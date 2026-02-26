import { createClient } from "@/lib/supabase/server";
import { normalizeTrainers } from "@/lib/utils/trainers";
import KompetanseTable from "./KompetanseTable";

export const dynamic = "force-dynamic";

export default async function KompetansePage() {
  const supabase = await createClient();
  const { data: trainers } = await supabase
    .from("trainers")
    .select(
      `
      id,
      email,
      name,
      trainer_certifications (trainer_levels (id, name, sequence))
    `
    )
    .order("name");

  const { data: trainerLevels } = await supabase
    .from("trainer_levels")
    .select("id, name, sequence")
    .order("sequence");

  const normalizedTrainers = normalizeTrainers(trainers ?? []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Kompetanseoversikt
      </h1>
      <KompetanseTable
        trainers={normalizedTrainers}
        trainerLevels={trainerLevels ?? []}
      />
    </div>
  );
}
