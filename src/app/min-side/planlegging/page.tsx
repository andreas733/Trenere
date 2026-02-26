import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PlanleggingClient from "./PlanleggingClient";

export const dynamic = "force-dynamic";

export default async function PlanleggingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const [sessionsResult, plannedResult] = await Promise.all([
    supabase
      .from("training_sessions")
      .select("id, title, total_meters")
      .order("created_at", { ascending: false }),
    supabase
      .from("planned_sessions")
      .select("id, session_id, planned_date, ai_title, ai_content, ai_total_meters, training_sessions ( title, content, total_meters )")
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
    };
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Planlegging</h1>
      <p className="mb-6 text-slate-600">
        Felles klubbkalender. Klikk på en dato for å legge til eller fjerne en
        planlagt økt.{" "}
        <a href="/min-side/treningsokter" className="text-blue-600 hover:text-blue-800">
          Se øktbanken
        </a>
      </p>
      <PlanleggingClient
        sessions={sessions}
        planned={plannedWithTitle}
      />
    </div>
  );
}
