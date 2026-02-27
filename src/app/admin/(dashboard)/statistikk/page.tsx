import { createClient } from "@/lib/supabase/server";
import StatistikkClient from "./StatistikkClient";
import { formatLocalDate } from "@/lib/utils/date-local";

export const dynamic = "force-dynamic";

function getDefaultPeriod() {
  const now = new Date();
  const to = formatLocalDate(now);
  const from = formatLocalDate(new Date(now.getFullYear(), 0, 1));
  return { from, to };
}

export default async function StatistikkPage() {
  const { from, to } = getDefaultPeriod();
  const supabase = await createClient();
  const { data: parties } = await supabase
    .from("parties")
    .select("id, name, slug")
    .eq("has_planner", true)
    .order("sequence");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Statistikk – treningsøkter</h1>
      <StatistikkClient
        initialFrom={from}
        initialTo={to}
        parties={parties ?? []}
      />
    </div>
  );
}
