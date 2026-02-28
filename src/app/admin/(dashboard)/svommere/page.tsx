import { createClient } from "@/lib/supabase/server";
import SpondSyncButton from "./SpondSyncButton";
import SwimmerTable from "./SwimmerTable";

export const dynamic = "force-dynamic";

export default async function SvommerePage() {
  const supabase = await createClient();
  const [{ data: swimmers }, { data: parties }] = await Promise.all([
    supabase
      .from("swimmers")
      .select(
        `
      id,
      name,
      email,
      phone,
      party_id,
      synced_at,
      parties (id, name)
    `
      )
      .order("name"),
    supabase
      .from("parties")
      .select("id, name")
      .neq("slug", "svommeskolen")
      .order("sequence"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Svømmere</h1>
      <SpondSyncButton />
      <SwimmerTable swimmers={swimmers ?? []} parties={parties ?? []} />
    </div>
  );
}
