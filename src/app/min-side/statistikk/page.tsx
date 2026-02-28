import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StatistikkClient from "./StatistikkClient";
import { formatLocalDate } from "@/lib/utils/date-local";
import { getAppSetting } from "@/lib/actions/app-settings";
import { canAccessStatistics } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function getDefaultPeriod() {
  const now = new Date();
  const to = formatLocalDate(now);
  const from = formatLocalDate(new Date(now.getFullYear(), 0, 1));
  return { from, to };
}

export default async function StatistikkPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");
  if (!(await canAccessStatistics())) redirect("/min-side");

  const { from, to } = getDefaultPeriod();
  const [partiesRes, nsfEnabled] = await Promise.all([
    supabase
      .from("parties")
      .select("id, name, slug")
      .eq("has_planner", true)
      .order("sequence"),
    getAppSetting("nsf_utviklingstrapp_enabled"),
  ]);
  const parties = partiesRes.data ?? [];
  const nsfUtviklingstrappEnabled = nsfEnabled === true;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Statistikk – treningsøkter</h1>
      <StatistikkClient
        initialFrom={from}
        initialTo={to}
        parties={parties}
        nsfUtviklingstrappEnabled={nsfUtviklingstrappEnabled}
      />
    </div>
  );
}
