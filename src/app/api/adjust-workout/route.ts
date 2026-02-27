import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const ADJUST_SYSTEM_PROMPT = `Du er en erfaren svømmetrener. Du får en eksisterende svømmeøkt og skal justere den til et nytt antall meter. Behold øktens struktur, fokus og intensitet, men tilpass distansene slik at totalen blir omtrent det ønskede antallet meter. Bruk norsk svømmenotasjon (vf, v, cr, rygg, bryst, fly, p.X, neg split, etc.). Svar KUN med gyldig JSON:
{"title":"Kort tittel","content":"Hele økten på én linje per set/øvelse","totalMeters":"XXX"}`;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
    }

    const { data: trainer } = await supabase
      .from("trainers")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    const identities = user.identities ?? [];
    const isAzure = identities.some((i) => i.provider === "azure");
    const isAdmin = isAzure || !!adminRow;
    const isTrainer = !!trainer;

    if (!isAdmin && !isTrainer) {
      return NextResponse.json(
        { error: "Kun trenere og admin kan justere økter" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, content, totalMeters, targetMeters } = body;

    if (!title || !content || !targetMeters) {
      return NextResponse.json(
        { error: "Mangler title, content eller targetMeters" },
        { status: 400 }
      );
    }

    const targetNum = parseInt(String(targetMeters).replace(/\D/g, ""), 10);
    if (isNaN(targetNum) || targetNum < 500) {
      return NextResponse.json(
        { error: "Ugyldig antall meter" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI-tjenesten er ikke konfigurert (ANTHROPIC_API_KEY)" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const userPrompt = `Justér denne økten til ca ${targetNum} meter. Opprinnelig tittel: ${title}. Opprinnelig innhold:\n${content}\n${totalMeters ? `Opprinnelig meter: ${totalMeters}.` : ""} Behold strukturen og fokuset. Svar KUN med JSON.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: ADJUST_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "Uventet svar fra AI" },
        { status: 500 }
      );
    }

    let parsed: { title?: string; content?: string; totalMeters?: string };
    try {
      const text = textContent.text.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      parsed = JSON.parse(jsonStr) as { title?: string; content?: string; totalMeters?: string };
    } catch {
      return NextResponse.json(
        { error: "Kunne ikke lese AI-svar. Prøv igjen." },
        { status: 500 }
      );
    }

    const titleOut = parsed.title?.trim() || title;
    const contentOut = parsed.content?.trim() || content;
    const totalMetersOut = parsed.totalMeters?.trim() || String(targetNum);

    return NextResponse.json({
      title: titleOut,
      content: contentOut,
      totalMeters: totalMetersOut,
    });
  } catch (err) {
    console.error("Adjust workout error:", err);
    const message = err instanceof Error ? err.message : "Ukjent feil";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
