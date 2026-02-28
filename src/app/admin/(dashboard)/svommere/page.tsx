import { createClient } from "@/lib/supabase/server";
import SpondSyncButton from "./SpondSyncButton";
import SwimmerTable from "./SwimmerTable";

export const dynamic = "force-dynamic";

export default async function SvommerePage() {
  const supabase = await createClient();
  const { data: swimmers } = await supabase
    .from("swimmers")
    .select(
      `
      id,
      name,
      email,
      phone,
      synced_at,
      parties (name)
    `
    )
    .order("name");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Svømmere</h1>
      <SpondSyncButton />
      <SwimmerTable swimmers={swimmers ?? []} />
    </div>
  );
}
