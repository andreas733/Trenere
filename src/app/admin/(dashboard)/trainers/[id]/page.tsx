import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import TrainerEditForm from "./TrainerEditForm";

export const dynamic = "force-dynamic";

export default async function TrainerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: trainer } = await supabase
    .from("trainers")
    .select(
      `
      *,
      wage_levels (id, name, hourly_wage, minimum_hours),
      trainer_certifications (level_id),
      trainer_parties (party_id)
    `
    )
    .eq("id", id)
    .single();

  if (!trainer) {
    notFound();
  }

  const [wageLevelsRes, trainerLevelsRes, partiesRes] = await Promise.all([
    supabase.from("wage_levels").select("id, name, hourly_wage, minimum_hours").order("sequence"),
    supabase.from("trainer_levels").select("id, name, sequence").order("sequence"),
    supabase.from("parties").select("id, name").order("sequence"),
  ]);

  const selectedLevelIds = (trainer.trainer_certifications ?? [])
    .map((c: { level_id: string }) => c.level_id);
  const selectedPartyIds = (trainer.trainer_parties ?? [])
    .map((p: { party_id: string }) => p.party_id);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Tilbake til trenere
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Rediger trener: {trainer.name}
      </h1>
      <TrainerEditForm
        trainer={trainer}
        wageLevels={wageLevelsRes.data ?? []}
        trainerLevels={trainerLevelsRes.data ?? []}
        parties={partiesRes.data ?? []}
        selectedLevelIds={selectedLevelIds}
        selectedPartyIds={selectedPartyIds}
      />
    </div>
  );
}
