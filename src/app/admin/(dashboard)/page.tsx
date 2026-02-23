import { createClient } from "@/lib/supabase/server";
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
      created_at,
      wage_levels (name, hourly_wage, minimum_hours)
    `
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Trenere</h1>
      <TrainerTable trainers={trainers ?? []} />
    </div>
  );
}
