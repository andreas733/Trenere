"use client";

import { useState, useEffect, useMemo } from "react";

const MOBILE_BREAKPOINT = 640;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return isMobile;
}
import { useRouter, useSearchParams } from "next/navigation";
import {
  planSession,
  unplanSession,
  planSessionWithAIContent,
} from "@/lib/actions/training-sessions";
import { parseMeters } from "@/lib/utils/parse-meters";

type Session = {
  id: string;
  title: string;
  total_meters: string | null;
};

type Planned = {
  id: string;
  session_id: string | null;
  planned_date: string;
  title: string;
  content: string | null;
  totalMeters: string | null;
};

const WEEKDAY_NAMES = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const MONTH_NAMES = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];

const STROKES = [
  { value: "crawl", label: "Crawl" },
  { value: "rygg", label: "Rygg" },
  { value: "bryst", label: "Bryst" },
  { value: "butterfly", label: "Butterfly" },
  { value: "medley", label: "Medley" },
];

const INTENSITIES = [
  { value: "lett", label: "Lett" },
  { value: "moderat", label: "Moderat" },
  { value: "høy", label: "Høy" },
  { value: "topp", label: "Topp" },
];

function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getMonday(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

type ModalMode = "choice" | "bank" | "ai_form" | "ai_preview" | "view";

type GeneratedWorkout = {
  title: string;
  content: string;
  totalMeters: string;
};

export default function PlanleggingClient({
  sessions,
  planned: initialPlanned,
  partyId,
  partySlug = "a",
}: {
  sessions: Session[];
  planned: Planned[];
  partyId: string;
  partySlug?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const velgSessionId = searchParams.get("velg");

  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"week" | "month" | "day">("week");
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return getMonday(now);
  });
  const [planned, setPlanned] = useState<Planned[]>(initialPlanned);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPlannedId, setSelectedPlannedId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("choice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendEmailResult, setSendEmailResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [aiForm, setAiForm] = useState({
    stroke: "crawl",
    totalMeters: "4000",
    intensity: "moderat",
    focusArea: "",
  });
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setPlanned(initialPlanned);
  }, [initialPlanned]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT) {
      setViewMode("day");
    }
  }, []);

  useEffect(() => {
    if (velgSessionId && sessions.some((s) => s.id === velgSessionId)) {
      setSelectedDate(formatDateKey(new Date()));
      setModalMode("bank");
      router.replace(`/min-side/planlegging/${partySlug}?velg=${velgSessionId}`, { scroll: false });
    }
  }, [velgSessionId, sessions, router, partySlug]);

  const plannedByDate = useMemo(() => {
    const map: Record<string, Planned[]> = {};
    for (const p of planned) {
      if (!map[p.planned_date]) map[p.planned_date] = [];
      map[p.planned_date].push(p);
    }
    return map;
  }, [planned]);

  const visibleDateKeys: string[] = (() => {
    if (viewMode === "week") {
      const mon = getMonday(viewDate);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        return formatDateKey(d);
      });
    }
    if (viewMode === "day") {
      return [formatDateKey(viewDate)];
    }
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: last }, (_, i) =>
      formatDateKey(new Date(y, m, i + 1))
    );
  })();

  const totalMetersSum = planned
    .filter((p) => visibleDateKeys.includes(p.planned_date))
    .reduce((sum, p) => sum + parseMeters(p.totalMeters), 0);

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

  function closeModal() {
    setSelectedDate(null);
    setSelectedPlannedId(null);
    setModalMode("choice");
    setGeneratedWorkout(null);
    setError(null);
    setSendEmailResult(null);
  }

  async function handleSendEmail(plannedId: string) {
    setSendEmailResult(null);
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/planned-sessions/${plannedId}/send-email`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setSendEmailResult({
          type: "success",
          message: data.message ?? "E-post sendt til trenere",
        });
      } else {
        setSendEmailResult({
          type: "error",
          message: data.error ?? "Kunne ikke sende e-post",
        });
      }
    } catch {
      setSendEmailResult({
        type: "error",
        message: "Kunne ikke kontakte serveren",
      });
    }
    setSendingEmail(false);
  }

  async function handlePlan(sessionId: string, date: string) {
    setError(null);
    setLoading(true);
    const result = await planSession(sessionId, date, partyId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    const session = sessions.find((s) => s.id === sessionId);
    setPlanned((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        session_id: sessionId,
        planned_date: date,
        title: session?.title ?? "",
        content: null,
        totalMeters: session?.total_meters ?? null,
      },
    ]);
    closeModal();
    router.refresh();
  }

  async function handlePlanAI(date: string) {
    if (!generatedWorkout) return;
    setError(null);
    setLoading(true);
    const result = await planSessionWithAIContent({
      plannedDate: date,
      title: generatedWorkout.title,
      content: generatedWorkout.content,
      totalMeters: generatedWorkout.totalMeters,
      focusStroke: aiForm.stroke,
      intensity: aiForm.intensity,
      partyId,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPlanned((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        session_id: null,
        planned_date: date,
        title: generatedWorkout.title,
        content: generatedWorkout.content,
        totalMeters: generatedWorkout.totalMeters,
      },
    ]);
    closeModal();
    router.refresh();
  }

  async function handleGenerateWorkout() {
    if (!selectedDate) return;
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stroke: aiForm.stroke,
          totalMeters: aiForm.totalMeters,
          intensity: aiForm.intensity,
          focusArea: aiForm.focusArea.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke generere økt");
        setGenerating(false);
        return;
      }
      setGeneratedWorkout({
        title: data.title,
        content: data.content,
        totalMeters: data.totalMeters,
      });
      setModalMode("ai_preview");
    } catch {
      setError("Kunne ikke kontakte AI-tjenesten");
    }
    setGenerating(false);
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
    setSelectedPlannedId(null);
    router.refresh();
  }

  const dateLabel = selectedDate
    ? new Date(selectedDate + "T12:00:00").toLocaleDateString("nb-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["week", "month", "day"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setViewMode(m)}
              className={`min-h-[44px] rounded-lg border px-3 py-2.5 text-sm font-medium sm:py-2 ${
                viewMode === m
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {m === "week" ? "Uke" : m === "month" ? "Måned" : "Dag"}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm font-medium text-slate-600">
            Totalt: {totalMetersSum.toLocaleString("nb-NO")} m
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (viewMode === "week") {
                  const d = new Date(viewDate);
                  d.setDate(d.getDate() - 7);
                  setViewDate(d);
                } else if (viewMode === "month") {
                  setViewDate(new Date(year, month - 1, 1));
                } else {
                  const d = new Date(viewDate);
                  d.setDate(d.getDate() - 1);
                  setViewDate(d);
                }
              }}
              className="min-h-[44px] rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:py-2"
            >
              Forrige
            </button>
            <button
              type="button"
              onClick={() => {
                if (viewMode === "week") {
                  const d = new Date(viewDate);
                  d.setDate(d.getDate() + 7);
                  setViewDate(d);
                } else if (viewMode === "month") {
                  setViewDate(new Date(year, month + 1, 1));
                } else {
                  const d = new Date(viewDate);
                  d.setDate(d.getDate() + 1);
                  setViewDate(d);
                }
              }}
              className="min-h-[44px] rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:py-2"
            >
              Neste
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          {viewMode === "day"
            ? viewDate.toLocaleDateString("nb-NO", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : viewMode === "week"
              ? visibleDateKeys[0]
                ? (() => {
                    const mon = new Date(
                      visibleDateKeys[0] + "T12:00:00"
                    );
                    const sun = new Date(visibleDateKeys[6] + "T12:00:00");
                    const sameMonth =
                      mon.getMonth() === sun.getMonth() &&
                      mon.getFullYear() === sun.getFullYear();
                    return sameMonth
                      ? `${mon.getDate()}.–${sun.getDate()}. ${MONTH_NAMES[mon.getMonth()]} ${mon.getFullYear()}`
                      : `${mon.getDate()}. ${MONTH_NAMES[mon.getMonth()].slice(0, 3)} – ${sun.getDate()}. ${MONTH_NAMES[sun.getMonth()].slice(0, 3)} ${sun.getFullYear()}`;
                  })()
                : ""
              : `${MONTH_NAMES[month]} ${year}`}
        </h2>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {viewMode === "day" ? (
          <div className="p-4">
            <div
              className={`min-h-[120px] rounded-lg border p-4 ${
                todayKey === formatDateKey(viewDate)
                  ? "border-blue-300 bg-blue-50/50"
                  : "border-slate-200"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    todayKey === formatDateKey(viewDate)
                      ? "text-blue-700"
                      : "text-slate-700"
                  }`}
                >
                  {viewDate.toLocaleDateString("nb-NO", {
                    weekday: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {(() => {
                const dateKey = formatDateKey(viewDate);
                const sessionsForDay = plannedByDate[dateKey] ?? [];
                return (
                  <div className="space-y-2">
                    {sessionsForDay.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedDate(dateKey);
                          setSelectedPlannedId(p.id);
                          setModalMode("view");
                        }}
                        className="min-h-[48px] w-full rounded-lg bg-slate-100 p-4 text-left hover:bg-slate-200"
                      >
                        <p className="font-medium text-slate-800">{p.title}</p>
                        {p.totalMeters && (
                          <p className="mt-1 text-sm text-slate-600">
                            {p.totalMeters} m
                          </p>
                        )}
                        <span className="mt-2 block text-sm text-slate-500">
                          Klikk for å se innhold
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(dateKey);
                        setSelectedPlannedId(null);
                        setModalMode("choice");
                      }}
                      className="min-h-[48px] w-full rounded-lg border-2 border-dashed border-slate-300 py-4 text-slate-500 hover:border-slate-400 hover:text-slate-700"
                    >
                      Legg til økt
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[480px] sm:min-w-0">
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
              <div
                className={`grid grid-cols-7 ${
                  viewMode === "week" ? "grid-rows-1" : ""
                }`}
              >
              {(viewMode === "week" ? visibleDateKeys : days).map((cell, i) => {
                const date =
                  viewMode === "week"
                    ? (cell as string)
                    : (cell as { date: string; isCurrentMonth: boolean }).date;
                const isCurrentMonth =
                  viewMode === "week" ||
                  (cell as { date: string; isCurrentMonth: boolean })
                    .isCurrentMonth;
                if (viewMode === "month" && !isCurrentMonth) {
                  return (
                    <div
                      key={i}
                      className="min-h-[80px] bg-slate-50/50"
                    />
                  );
                }
                const isToday = date === todayKey;

                const sessionCount = date ? (plannedByDate[date] ?? []).length : 0;
                const isMobileMonth = isMobile && viewMode === "month";

                return (
                  <div
                    key={date || i}
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
                        {date
                          ? new Date(date + "T12:00:00").getDate()
                          : ""}
                      </span>
                      {isMobileMonth && date && sessionCount > 0 && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden />
                      )}
                    </div>
                    {date && !isMobileMonth && (
                      <div className="mt-1 space-y-1">
                        {(plannedByDate[date] ?? []).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedDate(date);
                              setSelectedPlannedId(p.id);
                              setModalMode("view");
                            }}
                            className="block min-h-[44px] w-full rounded bg-slate-100 p-2 text-left text-xs hover:bg-slate-200 sm:min-h-0 sm:p-1.5"
                          >
                            <p className="truncate font-medium text-slate-800">
                              {p.title}
                            </p>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedPlannedId(null);
                            setModalMode("choice");
                          }}
                          className="block min-h-[44px] w-full rounded border border-dashed border-slate-300 py-2 text-xs text-slate-500 hover:border-slate-400 hover:text-slate-700 sm:min-h-0 sm:py-1"
                        >
                          Legg til økt
                        </button>
                      </div>
                    )}
                    {date && isMobileMonth && (
                      <button
                        type="button"
                        onClick={() => {
                          setViewDate(new Date(date + "T12:00:00"));
                          setViewMode("day");
                        }}
                        className="mt-1 flex min-h-[36px] w-full items-center justify-center rounded border border-slate-300 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        {sessionCount > 0 ? `${sessionCount} økt${sessionCount > 1 ? "er" : ""}` : "Se dag"}
                      </button>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="modal-overlay-safe fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-white p-4 shadow-xl sm:p-6">
            <h3 className="mb-4 font-semibold text-slate-800">
              {modalMode === "view"
                ? `Planlagt økt – ${dateLabel}`
                : modalMode === "choice"
                  ? `Legg til økt for ${dateLabel}`
                  : `Velg økt for ${dateLabel}`}
            </h3>

            {modalMode === "view" && selectedPlannedId && (() => {
              const p = planned.find((x) => x.id === selectedPlannedId);
              if (!p) return null;
              return (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-slate-800">{p.title}</p>
                    {p.totalMeters && (
                      <p className="text-sm text-slate-600">
                        Totale meter: {p.totalMeters}
                      </p>
                    )}
                  </div>
                  {p.content ? (
                    <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded bg-slate-50 p-3 text-xs text-slate-800">
                      {p.content}
                    </pre>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      Ingen innhold lagret for denne økten.
                    </p>
                  )}
                  {sendEmailResult && (
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        sendEmailResult.type === "success"
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {sendEmailResult.message}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="min-h-[44px] flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Lukk
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalMode("choice");
                      }}
                      className="min-h-[44px] flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Endre
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnplan(p.id, selectedDate)}
                      disabled={loading}
                      className="min-h-[44px] flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Fjern
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendEmail(p.id)}
                      disabled={sendingEmail}
                      className="min-h-[44px] flex-1 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {sendingEmail ? "Sender..." : "Send til trenere"}
                    </button>
                  </div>
                </div>
              );
            })()}

            {modalMode === "choice" && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setModalMode("bank")}
                  className="flex min-h-[48px] w-full items-center rounded-lg border border-slate-200 bg-white p-4 text-left font-medium text-slate-800 hover:bg-slate-50"
                >
                  Velg fra bank
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode("ai_form")}
                  className="flex min-h-[48px] w-full items-center rounded-lg border border-slate-200 bg-white p-4 text-left font-medium text-slate-800 hover:bg-slate-50"
                >
                  Generer ny økt med AI
                </button>
              </div>
            )}

            {modalMode === "bank" && (
              <div className="mb-4 max-h-60 space-y-2 overflow-y-auto">
                {sessions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Ingen økter i banken. Legg til økter eller bruk AI.
                  </p>
                ) : (
                  sessions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handlePlan(s.id, selectedDate)}
                      disabled={loading}
                      className="flex min-h-[48px] w-full items-center rounded-lg border border-slate-200 bg-white p-3 text-left text-sm hover:bg-slate-50 disabled:opacity-50"
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
            )}

            {modalMode === "ai_form" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Svømmeart
                  </label>
                  <select
                    value={aiForm.stroke}
                    onChange={(e) =>
                      setAiForm((s) => ({ ...s, stroke: e.target.value }))
                    }
                    className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-2"
                  >
                    {STROKES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Antall meter (ca.)
                  </label>
                  <input
                    type="number"
                    min={500}
                    step={250}
                    value={aiForm.totalMeters}
                    onChange={(e) =>
                      setAiForm((s) => ({ ...s, totalMeters: e.target.value }))
                    }
                    className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Intensitet
                  </label>
                  <select
                    value={aiForm.intensity}
                    onChange={(e) =>
                      setAiForm((s) => ({ ...s, intensity: e.target.value }))
                    }
                    className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-2"
                  >
                    {INTENSITIES.map((i) => (
                      <option key={i.value} value={i.value}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Fokusområde (valgfritt)
                  </label>
                  <input
                    type="text"
                    value={aiForm.focusArea}
                    onChange={(e) =>
                      setAiForm((s) => ({ ...s, focusArea: e.target.value }))
                    }
                    placeholder="F.eks. undervannsarbeid, ryggstart, vendinger"
                    className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Tittelen på økten vil ta inn over seg dette når det er satt.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateWorkout}
                  disabled={generating}
                  className="min-h-[44px] w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {generating ? "Genererer..." : "Generer økt"}
                </button>
              </div>
            )}

            {modalMode === "ai_preview" && generatedWorkout && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-slate-800">
                    {generatedWorkout.title}
                  </p>
                  {generatedWorkout.totalMeters && (
                    <p className="text-sm text-slate-600">
                      Totale meter: {generatedWorkout.totalMeters}
                    </p>
                  )}
                </div>
                <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded bg-slate-50 p-3 text-xs text-slate-800">
                  {generatedWorkout.content}
                </pre>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalMode("ai_form")}
                    className="min-h-[44px] flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Prøv igjen
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlanAI(selectedDate!)}
                    disabled={loading}
                    className="min-h-[44px] flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Planlegger..." : "Planlegg"}
                  </button>
                </div>
              </div>
            )}

            {(modalMode === "choice" || modalMode === "bank") && (
              <button
                type="button"
                onClick={closeModal}
                className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Lukk
              </button>
            )}
            {modalMode === "bank" && (
              <button
                type="button"
                onClick={() => setModalMode("choice")}
                className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                Tilbake
              </button>
            )}
            {modalMode === "ai_form" && (
              <button
                type="button"
                onClick={() => setModalMode("choice")}
                className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Tilbake
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
