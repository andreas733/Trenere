"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { planSession, unplanSession } from "@/lib/actions/training-sessions";

type Session = {
  id: string;
  title: string;
  total_meters: string | null;
};

type Planned = {
  id: string;
  session_id: string;
  planned_date: string;
  title: string;
};

const WEEKDAY_NAMES = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const MONTH_NAMES = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];

function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function PlanleggingClient({
  sessions,
  planned: initialPlanned,
}: {
  sessions: Session[];
  planned: Planned[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const velgSessionId = searchParams.get("velg");

  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [planned, setPlanned] = useState<Planned[]>(initialPlanned);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPlanned(initialPlanned);
  }, [initialPlanned]);

  useEffect(() => {
    if (velgSessionId && sessions.some((s) => s.id === velgSessionId)) {
      setSelectedDate(formatDateKey(new Date()));
      router.replace("/min-side/planlegging", { scroll: false });
    }
  }, [velgSessionId, sessions, router]);

  const plannedByDate = Object.fromEntries(planned.map((p) => [p.planned_date, p]));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();
  const endPad = 42 - startPad - daysInMonth;

  const days: { date: string; isCurrentMonth: boolean }[] = [];
  for (let i = 0; i < startPad; i++) days.push({ date: "", isCurrentMonth: false });
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: formatDateKey(new Date(year, month, d)),
      isCurrentMonth: true,
    });
  }
  for (let i = 0; i < endPad; i++) days.push({ date: "", isCurrentMonth: false });

  const todayKey = formatDateKey(new Date());

  async function handlePlan(sessionId: string, date: string) {
    setError(null);
    setLoading(true);
    const existing = plannedByDate[date];
    if (existing) {
      const unplanResult = await unplanSession(existing.id);
      if (unplanResult.error) {
        setError(unplanResult.error);
        setLoading(false);
        return;
      }
      setPlanned((prev) => prev.filter((p) => p.id !== existing.id));
    }
    const result = await planSession(sessionId, date);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    const session = sessions.find((s) => s.id === sessionId);
    setPlanned((prev) => [
      ...prev.filter((p) => p.planned_date !== date),
      { id: crypto.randomUUID(), session_id: sessionId, planned_date: date, title: session?.title ?? "" },
    ]);
    setSelectedDate(null);
    router.refresh();
  }

  async function handleUnplan(id: string, date: string) {
    setError(null);
    setLoading(true);
    const result = await unplanSession(id);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPlanned((prev) => prev.filter((p) => p.id !== id));
    setSelectedDate(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setViewDate(new Date(year, month - 1, 1))
          }
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Forrige
        </button>
        <h2 className="text-lg font-semibold text-slate-800">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          type="button"
          onClick={() =>
            setViewDate(new Date(year, month + 1, 1))
          }
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Neste
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {WEEKDAY_NAMES.map((name) => (
            <div
              key={name}
              className="px-2 py-2 text-center text-xs font-medium text-slate-600"
            >
              {name}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((cell, i) => {
            if (!cell.isCurrentMonth) {
              return <div key={i} className="min-h-[80px] bg-slate-50/50" />;
            }
            const p = plannedByDate[cell.date];
            const isToday = cell.date === todayKey;
            const isSelected = selectedDate === cell.date;

            return (
              <div
                key={cell.date || i}
                className={`min-h-[80px] border-b border-r border-slate-200 p-2 last:border-r-0 ${
                  isToday ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      isToday ? "text-blue-700" : "text-slate-700"
                    }`}
                  >
                    {cell.date ? new Date(cell.date + "T12:00:00").getDate() : ""}
                  </span>
                </div>
                {cell.date && (
                  <div className="mt-1">
                    {p ? (
                      <div className="rounded bg-slate-100 p-1.5 text-xs">
                        <p className="truncate font-medium text-slate-800">
                          {p.title}
                        </p>
                        {isSelected ? (
                          <button
                            type="button"
                            onClick={() => handleUnplan(p.id, cell.date)}
                            disabled={loading}
                            className="mt-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            Fjern
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedDate(cell.date)}
                            className="mt-1 text-blue-600 hover:text-blue-800"
                          >
                            Endre
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedDate(cell.date)}
                        className="w-full rounded border border-dashed border-slate-300 py-1.5 text-xs text-slate-500 hover:border-slate-400 hover:text-slate-700"
                      >
                        Legg til økt
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-md overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 font-semibold text-slate-800">
              Velg økt for{" "}
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("nb-NO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            <div className="mb-4 max-h-60 space-y-2 overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Ingen økter i banken. Legg til økter først.
                </p>
              ) : (
                sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handlePlan(s.id, selectedDate)}
                    disabled={loading}
                    className="block w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    <span className="font-medium text-slate-800">{s.title}</span>
                    {s.total_meters && (
                      <span className="ml-2 text-slate-600">
                        ({s.total_meters} m)
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              Lukk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
