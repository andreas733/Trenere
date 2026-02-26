import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import TreningsokterClient from "./TreningsokterClient";

export const dynamic = "force-dynamic";

export default async function TreningsokterMinSidePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: sessions } = await supabase
    .from("training_sessions")
    .select("id, title, content, total_meters")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">Treningsøktbank</h1>
          <p className="text-slate-600">
            Velg en økt for å se innholdet, eller{" "}
            <Link href="/min-side/planlegging" className="text-blue-600 hover:text-blue-800">
              gå til planlegging
            </Link>{" "}
            for å legge den på kalenderen.
          </p>
        </div>
        <Link
          href="/min-side/treningsokter/ny"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Legg til økt
        </Link>
      </div>
      <TreningsokterClient sessions={sessions ?? []} />
    </div>
  );
}
