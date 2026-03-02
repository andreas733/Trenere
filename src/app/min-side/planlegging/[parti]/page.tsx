import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { canAccessPlanner } from "@/lib/permissions";
import PlanleggingClient from "../PlanleggingClient";

export const dynamic = "force-dynamic";

const VALID_PARTY_SLUGS = ["a", "a2", "b", "c", "test"];

export default async function PlanleggingPartiPage({
  params,
}: {
  params: Promise<{ parti: string }>;
}) {
  const { parti } = await params;
  const slug = parti.toLowerCase();

  if (!VALID_PARTY_SLUGS.includes(slug)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");
  if (!(await canAccessPlanner())) redirect("/min-side");

  const { data: party } = await supabase
    .from("parties")
    .select("id, name, slug")
    .eq("slug", slug)
    .eq("has_planner", true)
    .single();

  if (!party) {
    notFound();
  }

  const [sessionsResult, plannedResult] = await Promise.all([
    supabase
      .from("training_sessions")
      .select("id, title, total_meters")
      .order("created_at", { ascending: false }),
    supabase
      .from("planned_sessions")
      .select("id, session_id, planned_date, ai_title, ai_content, ai_total_meters, ai_focus_stroke, ai_intensity, training_sessions ( title, content, total_meters )")
      .eq("party_id", party.id)
      .order("planned_date"),
  ]);

  const sessions = sessionsResult.data ?? [];
  const planned = plannedResult.data ?? [];

  const plannedWithTitle = planned.map((p) => {
    const ts = p.training_sessions as { title?: unknown; content?: unknown; total_meters?: unknown } | null;
    const fromBankTitle = ts && typeof ts === "object" && "title" in ts
      ? String(ts.title)
      : "";
    const fromBankContent = ts && typeof ts === "object" && "content" in ts
      ? String(ts.content ?? "")
      : null;
    const fromBankMeters = ts && typeof ts === "object" && "total_meters" in ts
      ? String(ts.total_meters ?? "")
      : null;
    const title = p.session_id ? fromBankTitle : (p.ai_title ?? "");
    const content = p.session_id ? fromBankContent : (p.ai_content ?? null);
    const totalMeters = p.session_id ? fromBankMeters : (p.ai_total_meters ?? null);
    return {
      id: p.id,
      session_id: p.session_id,
      planned_date: p.planned_date,
      title: title || "",
      content: content || null,
      totalMeters: totalMeters || null,
      aiFocusStroke: p.session_id ? null : (p.ai_focus_stroke ?? null),
      aiIntensity: p.session_id ? null : (p.ai_intensity ?? null),
    };
  });

  const { data: plannerParties } = await supabase
    .from("parties")
    .select("id, name, slug")
    .eq("has_planner", true)
    .order("sequence");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold text-slate-800">
        Planlegging – {party.name}
      </h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {(plannerParties ?? []).map((p) => (
          <a
            key={p.id}
            href={`/min-side/planlegging/${p.slug}`}
            className={`flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-medium sm:py-1.5 ${
              p.slug === slug
                ? "bg-ssk-blue text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {p.name}
          </a>
        ))}
      </div>
      <p className="mb-6 text-slate-600">
        Klikk på en dato for å legge til eller fjerne en planlagt økt.{" "}
        <a href="/min-side/treningsokter" className="text-ssk-blue hover:text-ssk-800">
          Se øktbanken
        </a>
      </p>
      <PlanleggingClient
        sessions={sessions}
        planned={plannedWithTitle}
        partyId={party.id}
        partySlug={party.slug}
        plannerParties={plannerParties ?? []}
      />
    </div>
  );
}
