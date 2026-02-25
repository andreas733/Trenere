import { createClient } from "@/lib/supabase/server";
import TrainerTable from "./TrainerTable";

export const dynamic = "force-dynamic";

type LevelInfo = { id: string; name: string; sequence: number };
type RawCert = { trainer_levels: LevelInfo | LevelInfo[] | null };
type NormalizedCert = { trainer_levels: LevelInfo | null };

function normalizeTrainers<T extends { trainer_certifications?: RawCert[] }>(
  raw: T[]
): (Omit<T, "trainer_certifications"> & { trainer_certifications: NormalizedCert[] })[] {
  return raw.map((t) => {
    const certs = t.trainer_certifications ?? [];
    const normalized: NormalizedCert[] = certs.map((c) => {
      const levels = c.trainer_levels;
      const level = !levels ? null : Array.isArray(levels) ? levels[0] ?? null : levels;
      return { trainer_levels: level };
    });
    return { ...t, trainer_certifications: normalized };
  });
}

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
      <TrainerTable trainers={normalizedTrainers} />
    </div>
  );
}
