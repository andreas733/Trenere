"use client";

import Link from "next/link";

type TrainerRow = {
  id: string;
  email: string;
  name: string;
  city: string | null;
  tripletex_id: number | null;
  wage_level_id: string | null;
  minimum_hours: number;
  contract_from_date: string | null;
  contract_to_date: string | null;
  created_at: string;
  wage_levels: { name: string; hourly_wage: number; minimum_hours: number } | { name: string; hourly_wage: number; minimum_hours: number }[] | null;
};

function formatDate(d: string | null) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("nb-NO");
}

export default function TrainerTable({
  trainers,
}: {
  trainers: TrainerRow[];
}) {
  return (
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
              Lønnstrinn
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Kontrakt
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
          {trainers.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                Ingen trenere registrert ennå.
              </td>
            </tr>
          ) : (
            trainers.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                  {t.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{t.email}</td>
                <td className="px-4 py-3 text-slate-600">{t.city ?? "–"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {Array.isArray(t.wage_levels) ? t.wage_levels[0]?.name : t.wage_levels?.name ?? "–"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {t.contract_from_date && t.contract_to_date
                    ? `${formatDate(t.contract_from_date)} – ${formatDate(t.contract_to_date)}`
                    : "–"}
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
  );
}
