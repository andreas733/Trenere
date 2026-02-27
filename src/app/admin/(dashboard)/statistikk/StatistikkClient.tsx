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
} from "recharts";
import { getStatistikk, type StatistikkData } from "@/lib/actions/statistikk";
import { parseLocalDate } from "@/lib/utils/date-local";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

function formatWeekLabel(week: string): string {
  const d = parseLocalDate(week);
  return `${d.getDate()}. ${["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"][d.getMonth()]}`;
}

export default function StatistikkClient({
  initialFrom,
  initialTo,
}: {
  initialFrom: string;
  initialTo: string;
}) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [data, setData] = useState<StatistikkData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getStatistikk(from, to).then((res) => {
      setLoading(false);
      if (res.error) setError(res.error);
      else setData(res.data ?? null);
    });
  }, [from, to]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
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

      {!loading && data && (
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
      )}
    </div>
  );
}
