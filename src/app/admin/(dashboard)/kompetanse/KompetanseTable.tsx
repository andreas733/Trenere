"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { LevelInfo, NormalizedCert } from "@/lib/utils/trainers";

type TrainerLevel = { id: string; name: string; sequence: number };

type TrainerRow = {
  id: string;
  email: string;
  name: string;
  trainer_certifications?: NormalizedCert[];
};

function getLevelNames(certs: NormalizedCert[] | null | undefined): string[] {
  if (!certs?.length) return [];
  const levels = certs
    .map((c) => c.trainer_levels)
    .filter((l): l is LevelInfo => !!l)
    .sort((a, b) => a.sequence - b.sequence);
  return levels.map((l) => l.name);
}

function getHighestLevel(certs: NormalizedCert[] | null | undefined): string {
  const names = getLevelNames(certs);
  return names.length > 0 ? names[names.length - 1] : "–";
}

export default function KompetanseTable({
  trainers,
  trainerLevels,
}: {
  trainers: TrainerRow[];
  trainerLevels: TrainerLevel[];
}) {
  const [search, setSearch] = useState("");
  const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>([]);

  const filteredTrainers = useMemo(() => {
    let result = trainers;

    if (selectedLevelIds.length > 0) {
      result = result.filter((t) =>
        (t.trainer_certifications ?? []).some(
          (c) =>
            c.trainer_levels && selectedLevelIds.includes(c.trainer_levels.id)
        )
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [trainers, selectedLevelIds, search]);

  const showAll = selectedLevelIds.length === 0;

  function toggleLevel(levelId: string) {
    setSelectedLevelIds((prev) =>
      prev.includes(levelId)
        ? prev.filter((id) => id !== levelId)
        : [...prev, levelId]
    );
  }

  function clearFilter() {
    setSelectedLevelIds([]);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-medium text-slate-800">Filtrer på kompetanse</h2>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showAll}
              onChange={clearFilter}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-600">Vis alle</span>
          </label>
          {trainerLevels.map((level) => (
            <label
              key={level.id}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={selectedLevelIds.includes(level.id)}
                onChange={() => toggleLevel(level.id)}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">{level.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="kompetanse-search" className="sr-only">
          Søk trenere
        </label>
        <input
          id="kompetanse-search"
          type="search"
          placeholder="Søk på navn eller e-post..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {(search || selectedLevelIds.length > 0) && (
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
                Høyeste nivå
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Alle kompetanser
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Handlinger
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredTrainers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {trainers.length === 0
                    ? "Ingen trenere registrert ennå."
                    : "Ingen trenere matcher søket eller filteret."}
                </td>
              </tr>
            ) : (
              filteredTrainers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    <Link
                      href={`/admin/trainers/${t.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {getHighestLevel(t.trainer_certifications)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {getLevelNames(t.trainer_certifications).length > 0 ? (
                      <ul className="list-disc space-y-0.5 pl-4">
                        {getLevelNames(t.trainer_certifications).map(
                          (name) => (
                            <li key={name}>{name}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      "–"
                    )}
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
