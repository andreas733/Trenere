"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTrainer, deleteTrainer } from "./actions";
import type { Trainer } from "@/types/database";

type WageLevel = {
  id: string;
  name: string;
  hourly_wage: number;
  minimum_hours: number;
};

type TrainerLevel = {
  id: string;
  name: string;
  sequence: number;
};

type Party = {
  id: string;
  name: string;
};

type TrainerWithWage = Trainer & {
  wage_levels: WageLevel | null;
  trainer_certifications?: { level_id: string }[];
  trainer_parties?: { party_id: string }[];
};

function formatDateForInput(d: string | null) {
  if (!d) return "";
  return d.slice(0, 10);
}

export default function TrainerEditForm({
  trainer,
  wageLevels,
  trainerLevels,
  parties,
  selectedLevelIds,
  selectedPartyIds,
}: {
  trainer: TrainerWithWage;
  wageLevels: WageLevel[];
  trainerLevels: TrainerLevel[];
  parties: Party[];
  selectedLevelIds: string[];
  selectedPartyIds: string[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    wage_level_id: trainer.wage_level_id ?? "",
    minimum_hours: trainer.minimum_hours ?? 0,
    contract_from_date: formatDateForInput(trainer.contract_from_date),
    contract_to_date: formatDateForInput(trainer.contract_to_date),
    contract_fast: trainer.contract_fast ?? false,
    level_ids: selectedLevelIds,
    party_ids: selectedPartyIds,
    can_access_workout_library: trainer.can_access_workout_library ?? false,
    can_access_planner: trainer.can_access_planner ?? false,
    can_access_statistics: trainer.can_access_statistics ?? false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await updateTrainer(trainer.id, {
      wage_level_id: formData.wage_level_id || null,
      minimum_hours: formData.minimum_hours,
      contract_from_date: formData.contract_from_date || null,
      contract_to_date: formData.contract_fast ? null : (formData.contract_to_date || null),
      contract_fast: formData.contract_fast,
      level_ids: formData.level_ids,
      party_ids: formData.party_ids,
      can_access_workout_library: formData.can_access_workout_library,
      can_access_planner: formData.can_access_planner,
      can_access_statistics: formData.can_access_statistics,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Er du sikker på at du vil slette denne treneren? Denne handlingen kan ikke angres.")) {
      return;
    }
    setDeleting(true);
    setError(null);
    const result = await deleteTrainer(trainer.id);
    setDeleting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin");
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
        <h2 className="mb-4 font-semibold text-slate-800">Modultilganger</h2>
        <p className="mb-4 text-sm text-slate-600">
          Gi treneren tilgang til treningsøktbanken, planleggeren og statistikk. Nye trenere har kun tilgang til Min side før admin gir rettigheter.
        </p>
        <div className="mb-6 space-y-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={formData.can_access_workout_library}
              onChange={(e) =>
                setFormData((s) => ({ ...s, can_access_workout_library: e.target.checked }))
              }
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Tilgang til treningsøktbanken</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={formData.can_access_planner}
              onChange={(e) =>
                setFormData((s) => ({ ...s, can_access_planner: e.target.checked }))
              }
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Tilgang til planleggeren</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={formData.can_access_statistics}
              onChange={(e) =>
                setFormData((s) => ({ ...s, can_access_statistics: e.target.checked }))
              }
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Tilgang til statistikk</span>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-800">Partier</h2>
        <p className="mb-4 text-sm text-slate-600">
          Velg hvilke partier treneren er knyttet til (ett eller flere).
        </p>
        <div className="mb-6 space-y-2">
          {parties.map((party) => (
            <label key={party.id} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formData.party_ids.includes(party.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData((s) => ({
                      ...s,
                      party_ids: [...s.party_ids, party.id],
                    }));
                  } else {
                    setFormData((s) => ({
                      ...s,
                      party_ids: s.party_ids.filter((id) => id !== party.id),
                    }));
                  }
                }}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">{party.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-800">Trenerutdanning</h2>
        <div className="mb-6 space-y-2">
          {trainerLevels.map((level) => (
            <label key={level.id} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formData.level_ids.includes(level.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData((s) => ({
                      ...s,
                      level_ids: [...s.level_ids, level.id],
                    }));
                  } else {
                    setFormData((s) => ({
                      ...s,
                      level_ids: s.level_ids.filter((id) => id !== level.id),
                    }));
                  }
                }}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">{level.name}</span>
            </label>
          ))}
        </div>
      </div>

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
                  {w.name} ({w.hourly_wage} kr/t)
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
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formData.contract_fast}
                onChange={(e) =>
                  setFormData((s) => ({
                    ...s,
                    contract_fast: e.target.checked,
                    contract_to_date: e.target.checked ? "" : s.contract_to_date,
                  }))
                }
                className="rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Fast kontrakt (ingen sluttdato)</span>
            </label>
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
          {!formData.contract_fast && (
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
          )}
        </div>
      </div>

      <ContractStatusBadge
        status={trainer.contract_status}
        sentAt={trainer.contract_sent_at}
        etchPacketEid={trainer.contract_etch_packet_eid}
        trainerId={trainer.id}
        onRefresh={() => router.refresh()}
      />

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ssk-blue px-4 py-2 font-medium text-white hover:bg-ssk-700 disabled:opacity-50"
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
        <SendContractButton trainerId={trainer.id} onSuccess={() => router.refresh()} />
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading || deleting}
          className="ml-auto rounded-lg border border-red-300 bg-white px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Sletter..." : "Slett trener"}
        </button>
      </div>
    </form>
  );
}

function ContractStatusBadge({
  status,
  sentAt,
  etchPacketEid,
  trainerId,
  onRefresh,
}: {
  status: string | null;
  sentAt: string | null;
  etchPacketEid: string | null;
  trainerId: string;
  onRefresh: () => void;
}) {
  const [syncing, setSyncing] = useState(false);

  async function handleSyncStatus() {
    setSyncing(true);
    const res = await fetch(`/api/trainers/${trainerId}/sync-contract-status`, {
      method: "POST",
    });
    setSyncing(false);
    if (res.ok) onRefresh();
  }

  const labels: Record<string, string> = {
    sent: "Kontrakt sendt – venter på signatur fra klubb",
    club_signed: "Klubb har signert – venter på trener",
    completed: "Kontrakt fullført",
    declined: "Signering avslått",
    voided: "Kontrakt kansellert",
  };
  const hasContract = !!etchPacketEid && (status || sentAt);
  if (!hasContract) return null;

  const label = labels[status ?? ""] ?? status ?? "Sendt";
  const isComplete = status === "completed";
  const isError = status === "declined" || status === "voided";
  const dateStr = sentAt
    ? new Date(sentAt).toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  return (
    <div
      className={`rounded-lg border p-4 ${
        isComplete
          ? "border-green-200 bg-green-50 text-green-800"
          : isError
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span>
          <span className="font-medium">{label}</span>
          {dateStr && (
            <span className="ml-2 text-sm opacity-90">(sendt {dateStr})</span>
          )}
        </span>
        {etchPacketEid &&
          status &&
          status !== "completed" &&
          status !== "declined" &&
          status !== "voided" && (
          <button
            type="button"
            onClick={handleSyncStatus}
            disabled={syncing}
            className="rounded border border-slate-400 bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {syncing ? "Henter..." : "Hent status"}
          </button>
        )}
      </div>
    </div>
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

function SendContractButton({
  trainerId,
  onSuccess,
}: {
  trainerId: string;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/trainers/${trainerId}/send-contract`, {
      method: "POST",
    });
    const data = await res.json();
    const successText = data.error
      ? data.error
      : "Kontrakt sendt! Klubben og treneren mottar signaturlenke på e-post.";
    setMessage({ type: data.error ? "err" : "ok", text: successText });
    setLoading(false);
    if (!data.error) onSuccess?.();
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
