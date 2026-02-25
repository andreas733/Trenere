"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type LevelInfo = { id: string; name: string; sequence: number };

type CertificationWithLevel = {
  trainer_levels: LevelInfo | null;
};

type TrainerRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
  tripletex_id: number | null;
  wage_level_id: string | null;
  minimum_hours: number;
  contract_from_date: string | null;
  contract_to_date: string | null;
  contract_fast: boolean;
  contract_status: string | null;
  created_at: string;
  wage_levels: { name: string; hourly_wage: number; minimum_hours: number } | { name: string; hourly_wage: number; minimum_hours: number }[] | null;
  trainer_certifications?: CertificationWithLevel[] | null;
};

function ContractStatusLabel({ status }: { status: string | null }) {
  if (!status) return <span className="text-slate-400">–</span>;
  if (status === "completed")
    return <span className="text-green-600">Signert</span>;
  if (status === "declined" || status === "voided")
    return <span className="text-red-600">Avslått</span>;
  return <span className="text-amber-600">Venter</span>;
}

function formatDate(d: string | null) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("nb-NO");
}

function getHighestLevel(certs: CertificationWithLevel[] | null | undefined): string {
  if (!certs?.length) return "–";
  const levels = certs
    .map((c) => c.trainer_levels)
    .filter((l): l is LevelInfo => !!l);
  if (levels.length === 0) return "–";
  const maxSeq = Math.max(...levels.map((l) => l.sequence));
  const level = levels.find((l) => l.sequence === maxSeq);
  return level?.name ?? "–";
}

function isContractExpired(
  contractFast: boolean,
  contractToDate: string | null
): boolean {
  if (contractFast) return false;
  if (!contractToDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const toDate = new Date(contractToDate);
  toDate.setHours(0, 0, 0, 0);
  return toDate < today;
}

export default function TrainerTable({
  trainers,
}: {
  trainers: TrainerRow[];
}) {
  const [search, setSearch] = useState("");

  const filteredTrainers = useMemo(() => {
    if (!search.trim()) return trainers;
    const q = search.trim().toLowerCase();
    return trainers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.city?.toLowerCase().includes(q) ?? false) ||
        (t.phone?.toLowerCase().includes(q) ?? false)
    );
  }, [trainers, search]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="trainer-search" className="sr-only">
          Søk trenere
        </label>
        <input
          id="trainer-search"
          type="search"
          placeholder="Søk på navn, e-post, by eller telefon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {search && (
          <p className="mt-1 text-sm text-slate-500">
            Viser {filteredTrainers.length} av {trainers.length} trenere
          </p>
        )}
      </div>
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Navn
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              E-post
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              By
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Nivå
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Lønnstrinn
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Kontrakt
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Signatur
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Tripletex
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Registrert
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
              Handlinger
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {filteredTrainers.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                {trainers.length === 0
                  ? "Ingen trenere registrert ennå."
                  : `Ingen trenere matcher "${search}"`}
              </td>
            </tr>
          ) : (
            filteredTrainers.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                  {t.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{t.email}</td>
                <td className="px-4 py-3 text-slate-600">{t.city ?? "–"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {getHighestLevel(t.trainer_certifications)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {Array.isArray(t.wage_levels) ? t.wage_levels[0]?.name : t.wage_levels?.name ?? "–"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      isContractExpired(t.contract_fast, t.contract_to_date)
                        ? "font-medium text-red-600"
                        : "text-slate-600"
                    }
                  >
                    {t.contract_fast && t.contract_from_date
                      ? `Fast fra ${formatDate(t.contract_from_date)}`
                      : t.contract_from_date && t.contract_to_date
                      ? `${formatDate(t.contract_from_date)} – ${formatDate(t.contract_to_date)}`
                      : "–"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ContractStatusLabel status={t.contract_status} />
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {t.tripletex_id ? (
                    <span className="text-green-600">Synkronisert</span>
                  ) : (
                    <span className="text-amber-600">Ikke synket</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatDate(t.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/trainers/${t.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Rediger
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
}
