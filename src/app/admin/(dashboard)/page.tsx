import { createClient } from "@/lib/supabase/server";
import { normalizeTrainers } from "@/lib/utils/trainers";
import SpondSyncButton from "./SpondSyncButton";
import TrainerTable from "./TrainerTable";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: trainers } = await supabase
    .from("trainers")
    .select(
      `
      id,
      email,
      name,
      national_identity_number,
      phone,
      city,
      tripletex_id,
      wage_level_id,
      minimum_hours,
      contract_from_date,
      contract_to_date,
      contract_fast,
      contract_status,
      created_at,
      wage_levels (name, hourly_wage, minimum_hours),
      trainer_certifications (trainer_levels (id, name, sequence))
    `
    )
    .order("created_at", { ascending: false });

  const normalizedTrainers = normalizeTrainers(trainers ?? []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Trenere</h1>
      <SpondSyncButton />
      <TrainerTable trainers={normalizedTrainers} />
    </div>
  );
}
