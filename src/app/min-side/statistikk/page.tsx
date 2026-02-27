import { createClient } from "@/lib/supabase/server";
import StatistikkClient from "./StatistikkClient";
import { formatLocalDate } from "@/lib/utils/date-local";
import { getAppSetting } from "@/lib/actions/app-settings";

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
