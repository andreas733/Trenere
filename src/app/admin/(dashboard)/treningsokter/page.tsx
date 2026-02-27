import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import TreningsokterTable from "./TreningsokterTable";

export const dynamic = "force-dynamic";

export default async function TreningsokterPage() {
  const admin = createAdminClient();
  const { data: sessions } = await admin
    .from("training_sessions")
    .select("id, title, total_meters, created_at")
    .order("created_at", { ascending: false });

  const isEmpty = !sessions || sessions.length === 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Treningsøktbank</h1>
        <Link
          href="/admin/treningsokter/ny"
          className="rounded-lg bg-ssk-blue px-4 py-2 font-medium text-white hover:bg-ssk-700"
        >
          Legg til økt
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
        {isEmpty && (
          <div className="px-6 py-12 text-center text-slate-500">
            Ingen økter i banken.{" "}
            <Link
              href="/admin/treningsokter/ny"
              className="text-ssk-blue hover:text-ssk-800"
            >
              Legg til første økt
            </Link>
          </div>
        )}
        {!isEmpty && <TreningsokterTable sessions={sessions!} />}
      </div>
    </div>
  );
}
