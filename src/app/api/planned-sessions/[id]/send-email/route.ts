import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { canAccessPlanner } from "@/lib/permissions";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await canAccessPlanner())) {
    return NextResponse.json(
      { error: "Du har ikke tilgang til planleggeren. Kontakt administrator for å få rettigheter." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: planned } = await admin
    .from("planned_sessions")
    .select(
      `
      id,
      session_id,
      party_id,
      planned_date,
      ai_title,
      ai_content,
      ai_total_meters,
      training_sessions ( title, content, total_meters )
    `
    )
    .eq("id", id)
    .single();

  if (!planned) {
    return NextResponse.json({ error: "Planlagt økt ikke funnet" }, { status: 404 });
  }

  const ts = planned.training_sessions as
    | { title?: string; content?: string; total_meters?: string | null }
    | null;
  const title = planned.session_id
    ? (ts?.title ?? "")
    : (planned.ai_title ?? "");
  const content = planned.session_id
    ? (ts?.content ?? "")
    : (planned.ai_content ?? "");
  const totalMeters = planned.session_id
    ? (ts?.total_meters ?? null)
    : (planned.ai_total_meters ?? null);

  const { data: trainerParties } = await admin
    .from("trainer_parties")
    .select("trainer_id")
    .eq("party_id", planned.party_id);

  if (!trainerParties?.length) {
    return NextResponse.json(
      { error: "Ingen trenere er tilknyttet dette partiet" },
      { status: 400 }
    );
  }

  const trainerIds = trainerParties.map((tp) => tp.trainer_id);
  const { data: trainers } = await admin
    .from("trainers")
    .select("id, email, name")
    .in("id", trainerIds);

  const recipients = (trainers ?? []).filter(
    (t) => t.email && typeof t.email === "string" && t.email.includes("@")
  );

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "Ingen trenere med gyldig e-postadresse er tilknyttet dette partiet" },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
  if (!apiKey) {
    return NextResponse.json(
      { error: "E-post er ikke konfigurert (RESEND_API_KEY mangler)" },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);
  const dateStr = new Date(planned.planned_date + "T12:00:00").toLocaleDateString(
    "nb-NO",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  const contentHtml = content
    ? `<pre style="white-space: pre-wrap; font-family: sans-serif; font-size: 14px; background: #f4f4f5; padding: 1rem; border-radius: 6px;">${escapeHtml(content)}</pre>`
    : "<p><em>Ingen innhold for denne økten.</em></p>";

  const html = `
    <p>Hei,</p>
    <p>Her er planlagt økt for <strong>${escapeHtml(dateStr)}</strong>.</p>
    <p><strong>Tittel:</strong> ${escapeHtml(title || "(Uten tittel)")}</p>
    ${totalMeters ? `<p><strong>Totale meter:</strong> ${escapeHtml(totalMeters)}</p>` : ""}
    <p><strong>Innhold:</strong></p>
    ${contentHtml}
    <p style="margin-top: 1.5rem; color: #64748b; font-size: 12px;">
      Sendt fra Skien Svømmeklubb – Trenere
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: recipients.map((r) => r.email as string),
      subject: `Planlagt økt ${dateStr}: ${title || "Uten tittel"}`,
      html,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Kunne ikke sende e-post" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `E-post sendt til ${recipients.length} trener${recipients.length === 1 ? "" : "e"}`,
      id: data?.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kunne ikke sende e-post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
