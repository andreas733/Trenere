"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAppSetting } from "@/lib/actions/app-settings";

export default function InnstillingerClient({
  initialNsfUtviklingstrappEnabled,
}: {
  initialNsfUtviklingstrappEnabled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nsfEnabled, setNsfEnabled] = useState(initialNsfUtviklingstrappEnabled);

  async function handleToggleNsf(enabled: boolean) {
    setError(null);
    setLoading(true);
    setNsfEnabled(enabled);
    const result = await updateAppSetting("nsf_utviklingstrapp_enabled", enabled);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      setNsfEnabled(!enabled);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-800">Statistikk</h2>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={nsfEnabled}
              onChange={(e) => handleToggleNsf(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-700">
              Vis NSF utviklingstrapp i statistikk
            </span>
          </label>
          {loading && (
            <span className="text-sm text-slate-500">Lagrer...</span>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Når aktivert, vises en stiplet referanselinje i statistikken for akkumulerte meter som
          viser NSF sin anbefalte treningsmengde for det valgte partiet.
        </p>
      </div>
    </div>
  );
}
