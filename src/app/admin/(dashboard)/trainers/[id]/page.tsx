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
      wage_levels (id, name, hourly_wage, minimum_hours)
    `
    )
    .eq("id", id)
    .single();

  if (!trainer) {
    notFound();
  }

  const { data: wageLevels } = await supabase
    .from("wage_levels")
    .select("id, name, hourly_wage, minimum_hours")
    .order("sequence");

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
        wageLevels={wageLevels ?? []}
      />
    </div>
  );
}
