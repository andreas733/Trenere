"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { getStatistikk, type StatistikkData } from "@/lib/actions/statistikk";
import { parseLocalDate } from "@/lib/utils/date-local";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

function formatWeekLabel(week: string): string {
  const d = parseLocalDate(week);
  return `${d.getDate()}. ${["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"][d.getMonth()]}`;
}

type Party = { id: string; name: string; slug: string };

function StatistikkCompareView({
  dataByParty,
  parties,
}: {
  dataByParty: Record<string, StatistikkData>;
  parties: Party[];
}) {
  const partyList = parties.filter((p) => dataByParty[p.id]);
  const allWeeks = new Set<string>();
  partyList.forEach((p) => dataByParty[p.id].metersByWeek.forEach((w) => allWeeks.add(w.week)));
  const weeksSorted = Array.from(allWeeks).sort();

  const accumulatedData: Record<string, string | number>[] = [];
  for (let idx = 0; idx < weeksSorted.length; idx++) {
    const week = weeksSorted[idx];
    const row: Record<string, string | number> = {
      week,
      label: formatWeekLabel(week),
    };
    partyList.forEach((p) => {
      const prev =
        idx > 0
          ? ((accumulatedData[idx - 1] as Record<string, number>)?.[p.id] as number) ?? 0
          : 0;
      const w = dataByParty[p.id].metersByWeek.find((x) => x.week === week);
      (row as Record<string, number>)[p.id] = prev + (w?.meters ?? 0);
    });
    accumulatedData.push(row);
  }

  const weeklyChartData = weeksSorted.map((week) => {
    const row: Record<string, string | number> = {
      week,
      label: formatWeekLabel(week),
    };
    partyList.forEach((p) => {
      const w = dataByParty[p.id].metersByWeek.find((x) => x.week === week);
      (row as Record<string, number>)[p.id] = w?.meters ?? 0;
    });
    return row;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {partyList.map((p) => {
          const d = dataByParty[p.id];
          return (
            <div key={p.id} className="space-y-2">
              <p className="text-sm font-medium text-slate-700">{p.name}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow">
                  <p className="text-xs text-slate-500">Meter</p>
                  <p className="font-bold text-slate-800">{d.totalMeters.toLocaleString("nb-NO")}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow">
                  <p className="text-xs text-slate-500">Økter</p>
                  <p className="font-bold text-slate-800">{d.sessionCount}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow">
                  <p className="text-xs text-slate-500">Snitt</p>
                  <p className="font-bold text-slate-800">{d.avgMetersPerSession.toLocaleString("nb-NO")}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {weeksSorted.length > 0 && (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Akkumulerte meter – sammenligning</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accumulatedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number | undefined) => [
                      value != null ? `${value.toLocaleString("nb-NO")} m` : "",
                      "",
                    ]}
                    labelFormatter={(label) => `Uke: ${label}`}
                  />
                  <Legend />
                  {partyList.map((p, i) => (
                    <Area
                      key={p.id}
                      type="monotone"
                      dataKey={p.id}
                      name={p.name}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Meter per uke – sammenligning</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number | undefined) => [
                      value != null ? `${value.toLocaleString("nb-NO")} m` : "",
                      "",
                    ]}
                    labelFormatter={(label) => `Uke: ${label}`}
                  />
                  <Legend />
                  {partyList.map((p, i) => (
                    <Line
                      key={p.id}
                      type="monotone"
                      dataKey={p.id}
                      name={p.name}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {partyList.map((p) => {
          const d = dataByParty[p.id];
          return (
            <div key={p.id} className="space-y-4">
              <h3 className="text-base font-semibold text-slate-800">{p.name}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {d.strokeDistribution.length > 0 && (
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow">
                    <h4 className="mb-3 text-sm font-medium text-slate-700">Fordeling svømmeart</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={d.strokeDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            label={({ name, percent }) => `${name} ${percent}%`}
                          >
                            {d.strokeDistribution.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val) => `${Number(val ?? 0)} økter`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                {d.intensityDistribution.length > 0 && (
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow">
                    <h4 className="mb-3 text-sm font-medium text-slate-700">Fordeling intensitet</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={d.intensityDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            label={({ name, percent }) => `${name} ${percent}%`}
                          >
                            {d.intensityDistribution.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val) => `${Number(val ?? 0)} økter`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StatistikkClient({
  initialFrom,
  initialTo,
  parties,
}: {
  initialFrom: string;
  initialTo: string;
  parties: Party[];
}) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [selectedPartyIds, setSelectedPartyIds] = useState<string[]>([]);
  const [data, setData] = useState<StatistikkData | null>(null);
  const [dataByParty, setDataByParty] = useState<Record<string, StatistikkData>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const partyIdsToFetch = selectedPartyIds.length === 0 ? undefined : selectedPartyIds;
  const isCompareMode = selectedPartyIds.length > 1;

  function toggleParty(partyId: string) {
    setSelectedPartyIds((prev) => {
      if (prev.length === 0) return parties.filter((p) => p.id !== partyId).map((p) => p.id);
      if (prev.includes(partyId)) return prev.filter((id) => id !== partyId);
      return [...prev, partyId];
    });
  }

  function selectAllParties() {
    setSelectedPartyIds([]);
  }

  function isPartySelected(partyId: string) {
    return selectedPartyIds.length === 0 || selectedPartyIds.includes(partyId);
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (isCompareMode) {
      Promise.all(
        selectedPartyIds.map((id) => getStatistikk(from, to, [id]))
      ).then((results) => {
        setLoading(false);
        const firstError = results.find((r) => r.error);
        if (firstError?.error) {
          setError(firstError.error);
          return;
        }
        const byParty: Record<string, StatistikkData> = {};
        results.forEach((r, i) => {
          if (r.data) byParty[selectedPartyIds[i]] = r.data;
        });
        setDataByParty(byParty);
        setData(null);
      });
    } else {
      getStatistikk(from, to, partyIdsToFetch).then((res) => {
        setLoading(false);
        if (res.error) setError(res.error);
        else {
          setData(res.data ?? null);
          setDataByParty({});
        }
      });
    }
  }, [from, to, selectedPartyIds, isCompareMode, partyIdsToFetch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        {parties.length > 0 && (
          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">Parti</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={selectAllParties}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  selectedPartyIds.length === 0
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                Alle
              </button>
              {parties.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleParty(p.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    isPartySelected(p.id)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label htmlFor="stat-from" className="mb-1 block text-sm font-medium text-slate-700">
            Fra dato
          </label>
          <input
            id="stat-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="stat-to" className="mb-1 block text-sm font-medium text-slate-700">
            Til dato
          </label>
          <input
            id="stat-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <p className="text-slate-500">Henter statistikk...</p>
      )}

      {!loading && (data || (isCompareMode && Object.keys(dataByParty).length > 0)) && (
        <>
          {isCompareMode ? (
            <StatistikkCompareView dataByParty={dataByParty} parties={parties} />
          ) : data ? (
          <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow">
              <p className="text-sm text-slate-500">Total meter</p>
              <p className="text-2xl font-bold text-slate-800">
                {data.totalMeters.toLocaleString("nb-NO")}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow">
              <p className="text-sm text-slate-500">Antall økter</p>
              <p className="text-2xl font-bold text-slate-800">{data.sessionCount}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow">
              <p className="text-sm text-slate-500">Gj.snitt per økt</p>
              <p className="text-2xl font-bold text-slate-800">
                {data.avgMetersPerSession.toLocaleString("nb-NO")} m
              </p>
            </div>
          </div>

          {data.metersByWeek.length > 0 && (
            <>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow">
                <h2 className="mb-4 text-lg font-semibold text-slate-800">Akkumulerte meter</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.metersByWeek.reduce<{ week: string; label: string; meters: number; accumulated: number }[]>(
                        (acc, w) => {
                          const prev = acc.length > 0 ? acc[acc.length - 1].accumulated : 0;
                          acc.push({
                            week: w.week,
                            label: formatWeekLabel(w.week),
                            meters: w.meters,
                            accumulated: prev + w.meters,
                          });
                          return acc;
                        },
                        []
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number | undefined) => [
                          value != null ? `${value.toLocaleString("nb-NO")} m` : "",
                          "Akkumulert",
                        ]}
                        labelFormatter={(label) => `Uke: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="accumulated"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        name="Akkumulert"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow">
                <h2 className="mb-4 text-lg font-semibold text-slate-800">Meter per uke</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.metersByWeek.map((w) => ({ ...w, label: formatWeekLabel(w.week) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number | undefined) => [
                        value != null ? `${value.toLocaleString("nb-NO")} m` : "",
                        "Meter",
                      ]}
                      labelFormatter={(label) => `Uke: ${label}`}
                    />
                    <Bar dataKey="meters" fill="#3b82f6" name="Meter" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            </>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {data.strokeDistribution.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow">
                <h2 className="mb-4 text-lg font-semibold text-slate-800">Fordeling svømmeart</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.strokeDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${percent}%`}
                      >
                        {data.strokeDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip
                        formatter={(val) => `${Number(val ?? 0)} økter`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {data.intensityDistribution.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow">
                <h2 className="mb-4 text-lg font-semibold text-slate-800">Fordeling intensitet</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.intensityDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${percent}%`}
                      >
                        {data.intensityDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip
                        formatter={(val) => `${Number(val ?? 0)} økter`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {data.strokeDistribution.length === 0 && data.intensityDistribution.length === 0 && data.sessionCount > 0 && (
              <p className="text-slate-500">
                Ingen økter i perioden har fokussvømmeart eller intensitet registrert. Legg til disse i øktbanken eller ved AI-planlegging for å se fordelingen.
              </p>
            )}
          </div>
        </>
          ) : null}
        </>
      )}
    </div>
  );
}
