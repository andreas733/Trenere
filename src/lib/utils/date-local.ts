/**
 * Hjelpefunksjoner for datum som skal behandles i lokal tidssone.
 * Unngår at ISO-strenger (YYYY-MM-DD) tolkes som UTC, noe som gir feil
 * ukedag/dato i tidssoner vest for UTC.
 */

/**
 * Parser "YYYY-MM-DD" som lokal midnatt (ikke UTC).
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/**
 * Formaterer Date til YYYY-MM-DD basert på lokal tidssone.
 */
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returnerer mandagen (uke 1 = mandag) for en gitt lokal dato.
 */
export function getMondayOfWeek(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatLocalDate(d);
}
