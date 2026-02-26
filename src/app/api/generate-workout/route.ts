import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SWIMMING_SYSTEM_PROMPT = `Du er en erfaren svømmetrener som lager treningsprogram for svømmeklubber. Du svarer KUN med gyldig JSON uten annen tekst.

## Notasjon (bruk disse forkortelsene)
- vf = veldig lett, v = lett
- cr = crawl, rygg = ryggsvømming, bryst = brystsvømming, fly = butterfly
- m/pb = med pullbuøy, m/padl = med paddler
- p.X = pause X sekunder (f.eks. p.20, p.30)
- hv = holdvendt (pause til klokken viser rund tid)
- neg split = negativ split (første halvdel saktere enn andre)
- prog = progresiv (økt fart gjennom settet)
- s1 = sett 1 (lett)
- 0-start = start fra blokken
- sos = svømme eller sparke
- cr/ry = crawl eller rygg

## Øktstruktur
1. Oppvarming (vf/v, rolig svømming)
2. Teknikk/driller (korte distanser, fokus på teknikk)
3. Hoveddel (hovedfokus basert på intensitet)
4. Avslutning (rolig nedkjøling)

## Svømmearter og tilpasning
- crawl: cr, fri
- rygg: rygg
- bryst: bryst
- butterfly: fly
- medley: blandet cr/rygg/bryst/fly

## Intensitet
- lett: mye teknikk, kortere hoveddel, lavere volum
- moderat: balanse teknikk og kondisjon
- høy: intervalltrening, neg split, testing
- topp: racing, 0-start, maks intensitet

## Svarformat
Returner KUN denne JSON-strukturen, ingen annen tekst:
{"title":"Kort tittel (f.eks. Rygg teknikk + crawl kondisjon)","content":"Hele økten på én linje per set/øvelse. Bruk norsk svømmenotasjon.","totalMeters":"XXX" eller "XXX/YYY" for ulike grupper}`;

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
        { error: "Kun trenere og admin kan generere økter" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { stroke, totalMeters, intensity } = body;

    if (!stroke || !totalMeters || !intensity) {
      return NextResponse.json(
        { error: "Mangler stroke, totalMeters eller intensity" },
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

    const userPrompt = `Lag en ${intensity} ${stroke}-økt på ca ${totalMeters} meter. Bruk norsk svømmenotasjon som beskrevet. Svar KUN med JSON.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SWIMMING_SYSTEM_PROMPT,
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

    const title = parsed.title?.trim() || "AI-generert økt";
    const content = parsed.content?.trim() || "";
    const totalMetersOut = parsed.totalMeters?.trim() || String(body.totalMeters);

    return NextResponse.json({
      title,
      content,
      totalMeters: totalMetersOut,
    });
  } catch (err) {
    console.error("Generate workout error:", err);
    const message = err instanceof Error ? err.message : "Ukjent feil";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
