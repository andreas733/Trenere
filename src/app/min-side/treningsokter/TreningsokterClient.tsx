"use client";

import { useState } from "react";
import Link from "next/link";

type Session = {
  id: string;
  title: string;
  content: string;
  total_meters: string | null;
};

export default function TreningsokterClient({ sessions }: { sessions: Session[] }) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.total_meters && s.total_meters.toLowerCase().includes(search.toLowerCase())) ||
      s.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="search" className="mb-1 block text-sm font-medium text-slate-700">
          Søk
        </label>
        <input
          id="search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Søk i tittel, meter eller innhold..."
          className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          {sessions.length === 0
            ? "Ingen økter i banken ennå."
            : "Ingen økter matcher søket."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-800">{s.title}</h3>
                  {s.total_meters && (
                    <p className="mt-1 text-sm text-slate-600">
                      Totale meter: {s.total_meters}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/min-side/treningsokter/${s.id}`}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Rediger
                  </Link>
                  <Link
                    href={`/min-side/planlegging/a?velg=${s.id}`}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Planlegg
                  </Link>
                </div>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(expandedId === s.id ? null : s.id)
                  }
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {expandedId === s.id ? "Skjul innhold" : "Vis innhold"}
                </button>
                {expandedId === s.id && (
                  <pre className="mt-2 whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm text-slate-800">
                    {s.content || "(Tom)"}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
