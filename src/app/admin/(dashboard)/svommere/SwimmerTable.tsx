"use client";

import { useState, useMemo } from "react";

type PartyOption = { id: string; name: string };

type SwimmerRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  party_id: string;
  synced_at: string;
  parties: { id: string; name: string } | { id: string; name: string }[] | null;
};

function formatDate(d: string | null) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPartyName(s: SwimmerRow): string {
  const p = Array.isArray(s.parties) ? s.parties[0] : s.parties;
  return p?.name ?? "–";
}

export default function SwimmerTable({
  swimmers,
  parties,
}: {
  swimmers: SwimmerRow[];
  parties: PartyOption[];
}) {
  const [search, setSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState<string>("");

  const filteredSwimmers = useMemo(() => {
    let result = swimmers;

    if (partyFilter) {
      result = result.filter((s) => s.party_id === partyFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.email?.toLowerCase().includes(q) ?? false) ||
          (s.phone?.toLowerCase().includes(q) ?? false) ||
          getPartyName(s).toLowerCase().includes(q)
      );
    }

    return result;
  }, [swimmers, search, partyFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label htmlFor="swimmer-search" className="sr-only">
            Søk svømmere
          </label>
          <input
            id="swimmer-search"
            type="search"
            placeholder="Søk på navn, e-post, telefon eller parti..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-ssk-500 focus:outline-none focus:ring-1 focus:ring-ssk-500"
          />
        </div>
        <div>
          <label htmlFor="party-filter" className="sr-only">
            Filtrer på parti
          </label>
          <select
            id="party-filter"
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-ssk-500 focus:outline-none focus:ring-1 focus:ring-ssk-500"
          >
            <option value="">Alle partier</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        {(search || partyFilter) && (
          <p className="mt-1 flex items-center text-sm text-slate-500">
            Viser {filteredSwimmers.length} av {swimmers.length} svømmere
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
                Telefon
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Parti
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Sist synket
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredSwimmers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  {swimmers.length === 0
                    ? "Ingen svømmere importert ennå. Klikk «Synkroniser fra Spond» for å hente inn."
                    : "Ingen svømmere matcher filteret."}
                </td>
              </tr>
            ) : (
              filteredSwimmers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    {s.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.email ?? "–"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.phone ?? "–"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {getPartyName(s)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(s.synced_at)}
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
