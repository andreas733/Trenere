"use server";

import { createClient } from "@/lib/supabase/server";
import { parseMeters } from "@/lib/utils/parse-meters";
import { getMondayOfWeek } from "@/lib/utils/date-local";

export type StatistikkData = {
  totalMeters: number;
  sessionCount: number;
  avgMetersPerSession: number;
  strokeDistribution: { name: string; value: number; percent: number }[];
  intensityDistribution: { name: string; value: number; percent: number }[];
  metersByWeek: { week: string; meters: number; sessionCount: number }[];
};

export async function getStatistikk(
  dateFrom: string,
  dateTo: string,
  partyIds?: string[]
): Promise<{ data: StatistikkData | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Ikke innlogget" };

  const { data: trainer } = await supabase
    .from("trainers")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  const identities = user.identities ?? [];
  const isAzure = identities.some((i) => i.provider === "azure");
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!trainer && !isAzure && !adminRow) {
    return { data: null, error: "Kun trenere og admin har tilgang til statistikk" };
  }

  let partyFilterIds = partyIds;
  if (partyFilterIds === undefined || partyFilterIds.length === 0) {
    const { data: plannerParties } = await supabase
      .from("parties")
      .select("id")
      .eq("has_planner", true);
    partyFilterIds = plannerParties?.map((p) => p.id) ?? [];
  }

  let query = supabase
    .from("planned_sessions")
    .select(`
      id,
      planned_date,
      session_id,
      ai_total_meters,
      ai_focus_stroke,
      ai_intensity,
      training_sessions (
        total_meters,
        focus_stroke,
        intensity
      )
    `)
    .gte("planned_date", dateFrom)
    .lte("planned_date", dateTo)
    .order("planned_date");

  if (partyFilterIds.length > 0) {
    query = query.in("party_id", partyFilterIds);
  }

  const { data: rows, error } = await query;

  if (error) return { data: null, error: error.message };
  if (!rows || rows.length === 0) {
    return {
      data: {
        totalMeters: 0,
        sessionCount: 0,
        avgMetersPerSession: 0,
        strokeDistribution: [],
        intensityDistribution: [],
        metersByWeek: [],
      },
    };
  }

  let totalMeters = 0;
  const strokeCounts: Record<string, number> = {};
  const intensityCounts: Record<string, number> = {};
  const weekMap: Record<string, { meters: number; count: number }> = {};

  const STROKE_LABELS: Record<string, string> = {
    crawl: "Crawl",
    rygg: "Rygg",
    bryst: "Bryst",
    butterfly: "Butterfly",
    medley: "Medley",
  };
  const INTENSITY_LABELS: Record<string, string> = {
    lett: "Lett",
    moderat: "Moderat",
    høy: "Høy",
    topp: "Topp",
  };

  for (const r of rows) {
    const ts = r.training_sessions as
      | { total_meters?: string | null; focus_stroke?: string | null; intensity?: string | null }
      | null;
    const meters = r.session_id
      ? parseMeters(ts?.total_meters ?? null)
      : parseMeters(r.ai_total_meters ?? null);
    const stroke = r.session_id ? ts?.focus_stroke : r.ai_focus_stroke;
    const intensity = r.session_id ? ts?.intensity : r.ai_intensity;

    totalMeters += meters;

    if (stroke && stroke.trim()) {
      strokeCounts[stroke] = (strokeCounts[stroke] ?? 0) + 1;
    }
    if (intensity && intensity.trim()) {
      intensityCounts[intensity] = (intensityCounts[intensity] ?? 0) + 1;
    }

    const weekKey = getMondayOfWeek(r.planned_date);
    if (!weekMap[weekKey]) weekMap[weekKey] = { meters: 0, count: 0 };
    weekMap[weekKey].meters += meters;
    weekMap[weekKey].count += 1;
  }

  const sessionCount = rows.length;
  const avgMetersPerSession = sessionCount > 0 ? Math.round(totalMeters / sessionCount) : 0;

  const strokeTotal = Object.values(strokeCounts).reduce((a, b) => a + b, 0);
  const strokeDistribution = Object.entries(strokeCounts).map(([key, value]) => ({
    name: STROKE_LABELS[key] ?? key,
    value,
    percent: strokeTotal > 0 ? Math.round((value / strokeTotal) * 100) : 0,
  }));

  const intensityTotal = Object.values(intensityCounts).reduce((a, b) => a + b, 0);
  const intensityDistribution = Object.entries(intensityCounts).map(([key, value]) => ({
    name: INTENSITY_LABELS[key] ?? key,
    value,
    percent: intensityTotal > 0 ? Math.round((value / intensityTotal) * 100) : 0,
  }));

  const metersByWeek = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, { meters, count }]) => ({
      week,
      meters,
      sessionCount: count,
    }));

  return {
    data: {
      totalMeters,
      sessionCount,
      avgMetersPerSession,
      strokeDistribution,
      intensityDistribution,
      metersByWeek,
    },
  };
}
