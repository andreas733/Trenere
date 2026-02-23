import { createClient } from "@/lib/supabase/server";
import WageLevelsClient from "./WageLevelsClient";

export const dynamic = "force-dynamic";

export default async function WageLevelsPage() {
  const supabase = await createClient();
  const { data: wageLevels } = await supabase
    .from("wage_levels")
    .select("id, name, hourly_wage, sequence")
    .order("sequence");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Lønnstrinn</h1>
      <WageLevelsClient wageLevels={wageLevels ?? []} />
    </div>
  );
}
