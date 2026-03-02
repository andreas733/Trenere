/**
 * NSF utviklingstrapp – mapping og anbefalte treningsmengder.
 * Kilder: svomming.no/utviklingstrapp
 */

import { formatLocalDate, parseLocalDate } from "./utils/date-local";

/** Parti slug -> NSF trinn (1-6). Bruk snitt for trinn som spenner over flere. */
export const PARTY_SLUG_TO_NSF_TRINN: Record<string, number> = {
  svommeskolen: 1.5, // trinn 1-2
  c: 3,
  b: 3,
  a2: 4,
  a: 5.5, // trinn 5-6
  test: 3, // testparti – bruker trinn 3
};

/** Anbefalt km/år per NSF trinn (min–max). Kan justeres fra NSF PDF. */
export const NSF_TRINN_METER_RANGE: Record<number, { minKmPerYear: number; maxKmPerYear: number }> = {
  1: { minKmPerYear: 36, maxKmPerYear: 228 },
  2: { minKmPerYear: 228, maxKmPerYear: 756 },
  3: { minKmPerYear: 600, maxKmPerYear: 1200 },
  4: { minKmPerYear: 1600, maxKmPerYear: 2500 },
  5: { minKmPerYear: 2000, maxKmPerYear: 2600 },
  6: { minKmPerYear: 2200, maxKmPerYear: 2800 },
};

export function getTrinnForParty(slug: string): number | null {
  const trinn = PARTY_SLUG_TO_NSF_TRINN[slug];
  return trinn != null ? trinn : null;
}

function getRangeForTrinn(trinn: number): { minKmPerYear: number; maxKmPerYear: number } | null {
  const floor = Math.floor(trinn);
  const ceil = Math.ceil(trinn);
  const r1 = NSF_TRINN_METER_RANGE[floor];
  const r2 = NSF_TRINN_METER_RANGE[ceil];
  if (r1 && r2) {
    const t = trinn - floor;
    return {
      minKmPerYear: r1.minKmPerYear + t * (r2.minKmPerYear - r1.minKmPerYear),
      maxKmPerYear: r1.maxKmPerYear + t * (r2.maxKmPerYear - r1.maxKmPerYear),
    };
  }
  return r1 ?? r2 ?? null;
}

/** Anbefalt meter for perioden (proratert fra årlig mengde). Bruker snitt av min/max. */
export function getAnbefaltMeterForPeriode(
  trinn: number,
  dateFrom: string,
  dateTo: string
): number {
  const range = getRangeForTrinn(trinn);
  if (!range) return 0;

  const from = parseLocalDate(dateFrom);
  const to = parseLocalDate(dateTo);
  const daysInPeriod = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)));
  const daysPerYear = 365;
  const avgKmPerYear = (range.minKmPerYear + range.maxKmPerYear) / 2;
  const kmForPeriod = (daysInPeriod / daysPerYear) * avgKmPerYear;
  return Math.round(kmForPeriod * 1000); // return meters
}

export function getWeeklyReferenceLineData(
  weeks: string[],
  trinn: number,
  from: string,
  to: string
): { week: string; label: string; anbefaltAccumulated: number }[] {
  const totalForPeriod = getAnbefaltMeterForPeriode(trinn, from, to);
  if (weeks.length === 0) return [];

  return weeks.map((week, idx) => {
    const frac = (idx + 1) / weeks.length;
    return {
      week,
      label: formatWeekLabel(week),
      anbefaltAccumulated: Math.round(frac * totalForPeriod),
    };
  });
}

function formatWeekLabel(week: string): string {
  const d = parseLocalDate(week);
  return `${d.getDate()}. ${
    ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"][d.getMonth()]
  }`;
}
