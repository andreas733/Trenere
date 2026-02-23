"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTrainer } from "./actions";
import type { Trainer } from "@/types/database";

type WageLevel = {
  id: string;
  name: string;
  hourly_wage: number;
  minimum_hours: number;
};

type TrainerWithWage = Trainer & {
  wage_levels: WageLevel | null;
};

function formatDateForInput(d: string | null) {
  if (!d) return "";
  return d.slice(0, 10);
}

export default function TrainerEditForm({
  trainer,
  wageLevels,
}: {
  trainer: TrainerWithWage;
  wageLevels: WageLevel[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    wage_level_id: trainer.wage_level_id ?? "",
    minimum_hours: trainer.minimum_hours ?? 0,
    contract_from_date: formatDateForInput(trainer.contract_from_date),
    contract_to_date: formatDateForInput(trainer.contract_to_date),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await updateTrainer(trainer.id, {
      wage_level_id: formData.wage_level_id || null,
      minimum_hours: formData.minimum_hours,
      contract_from_date: formData.contract_from_date || null,
      contract_to_date: formData.contract_to_date || null,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-800">Kontraktsinformasjon</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="wage_level_id" className="mb-1 block text-sm font-medium text-slate-700">
              Lønnstrinn
            </label>
            <select
              id="wage_level_id"
              value={formData.wage_level_id}
              onChange={(e) =>
                setFormData((s) => ({ ...s, wage_level_id: e.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">Velg nivå</option>
              {wageLevels.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.hourly_wage} kr/t, min {w.minimum_hours} t)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="minimum_hours" className="mb-1 block text-sm font-medium text-slate-700">
              Min. antall timer (overstyring)
            </label>
            <input
              id="minimum_hours"
              type="number"
              min={0}
              value={formData.minimum_hours}
              onChange={(e) =>
                setFormData((s) => ({
                  ...s,
                  minimum_hours: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="contract_from_date" className="mb-1 block text-sm font-medium text-slate-700">
              Kontrakt fra dato
            </label>
            <input
              id="contract_from_date"
              type="date"
              value={formData.contract_from_date}
              onChange={(e) =>
                setFormData((s) => ({ ...s, contract_from_date: e.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="contract_to_date" className="mb-1 block text-sm font-medium text-slate-700">
              Kontrakt til dato
            </label>
            <input
              id="contract_to_date"
              type="date"
              value={formData.contract_to_date}
              onChange={(e) =>
                setFormData((s) => ({ ...s, contract_to_date: e.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Lagrer..." : "Lagre"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Avbryt
        </button>
        <SyncTripletexButton trainerId={trainer.id} />
        <SendContractButton trainerId={trainer.id} />
      </div>
    </form>
  );
}

function SyncTripletexButton({ trainerId }: { trainerId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/trainers/${trainerId}/sync-tripletex`, {
      method: "POST",
    });
    const data = await res.json();
    setMessage(
      data.error ? { type: "err", text: data.error } : { type: "ok", text: "Synkronisert til Tripletex!" }
    );
    setLoading(false);
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {loading ? "Synker..." : "Sync til Tripletex"}
      </button>
      {message && (
        <span className={message.type === "ok" ? "text-green-600" : "text-red-600"}>
          {message.text}
        </span>
      )}
    </span>
  );
}

function SendContractButton({ trainerId }: { trainerId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/trainers/${trainerId}/send-contract`, {
      method: "POST",
    });
    const data = await res.json();
    setMessage(
      data.error ? { type: "err", text: data.error } : { type: "ok", text: "Kontrakt sendt!" }
    );
    setLoading(false);
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {loading ? "Sender..." : "Send kontrakt"}
      </button>
      {message && (
        <span className={message.type === "ok" ? "text-green-600" : "text-red-600"}>
          {message.text}
        </span>
      )}
    </span>
  );
}
