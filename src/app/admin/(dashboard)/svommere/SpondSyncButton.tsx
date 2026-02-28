"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SpondSyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    updated: number;
    skipped: number;
    deleted: number;
    errors?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/spond/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Kunne ikke synkronisere");
        return;
      }

      setResult({
        created: data.created ?? 0,
        updated: data.updated ?? 0,
        skipped: data.skipped ?? 0,
        deleted: data.deleted ?? 0,
        errors: data.errors,
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ukjent feil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="font-semibold text-slate-800">Spond – svømmere</h2>
        <button
          type="button"
          onClick={handleSync}
          disabled={loading}
          className="rounded-md bg-ssk-blue px-4 py-2 text-sm font-medium text-white hover:bg-ssk-800 disabled:opacity-50"
        >
          {loading ? "Synkroniserer…" : "Synkroniser fra Spond"}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
      {result && !error && (
        <p className="mt-3 text-sm text-slate-600">
          Opprettet: {result.created}, oppdatert: {result.updated}, hoppet over: {result.skipped}
          {result.deleted > 0 && `, slettet: ${result.deleted}`}
          {result.errors && result.errors.length > 0 && (
            <span className="mt-1 block text-amber-600">
              Noen feil: {result.errors.slice(0, 3).join("; ")}
              {result.errors.length > 3 && ` (+${result.errors.length - 3} til)`}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
