import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileEditor from "../ProfileEditor";

export const dynamic = "force-dynamic";

function formatDate(d: string | null) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("nb-NO");
}

export default async function ProfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: trainer } = await supabase
    .from("trainers")
    .select(
      `
      *,
      wage_levels (name, hourly_wage),
      trainer_certifications (trainer_levels (id, name, sequence))
    `
    )
    .eq("auth_user_id", user.id)
    .single();

  if (!trainer) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md text-center">
          <h1 className="mb-4 text-xl font-bold text-slate-800">Ikke funnet</h1>
          <p className="mb-6 text-slate-600">
            Det ser ikke ut til at du er registrert som trener. Kontakt klubben
            hvis du mener dette er en feil.
          </p>
          <Link href="/min-side" className="text-ssk-blue hover:underline">
            Tilbake
          </Link>
        </div>
      </div>
    );
  }

  const wageLevel = Array.isArray(trainer.wage_levels)
    ? trainer.wage_levels[0]
    : trainer.wage_levels;

  const certifications = (trainer.trainer_certifications ?? []) as {
    trainer_levels: { id: string; name: string; sequence: number } | null;
  }[];
  const trainerLevels = certifications
    .map((c) => c.trainer_levels)
    .filter((l): l is { id: string; name: string; sequence: number } => !!l)
    .sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Min side</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">
          Personlig informasjon og adresse
        </h2>
        <ProfileEditor
          trainer={{
            name: trainer.name,
            email: trainer.email,
            phone: trainer.phone,
            birthdate: trainer.birthdate,
            street: trainer.street,
            street2: trainer.street2,
            zip: trainer.zip,
            city: trainer.city,
          }}
        />
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Trenerutdanning</h2>
        {trainerLevels.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-slate-900">
            {trainerLevels.map((l) => (
              <li key={l.id}>{l.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">Ingen utdanningsnivåer registrert.</p>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Kontrakt og lønn</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Lønnstrinn</dt>
            <dd className="text-slate-900">
              {wageLevel
                ? `${wageLevel.name} (${wageLevel.hourly_wage} kr/t)`
                : "–"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Min. antall timer</dt>
            <dd className="text-slate-900">{trainer.minimum_hours ?? "–"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Kontrakt periode</dt>
            <dd className="text-slate-900">
              {trainer.contract_fast && trainer.contract_from_date
                ? `Fast fra ${formatDate(trainer.contract_from_date)}`
                : trainer.contract_from_date && trainer.contract_to_date
                ? `${formatDate(trainer.contract_from_date)} – ${formatDate(trainer.contract_to_date)}`
                : "–"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Bankkonto</dt>
            <dd className="font-mono text-slate-900">
              {trainer.bank_account_number ?? "–"}
            </dd>
          </div>
        </dl>
      </div>

      <Link
        href="/min-side"
        className="mt-6 block text-sm text-slate-500 hover:text-slate-700"
      >
        ← Tilbake
      </Link>
    </div>
  );
}
