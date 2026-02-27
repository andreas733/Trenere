/**
 * Parser total_meters-strenger til numerisk sum.
 * Håndterer formater som "3000", "3x1000", "5150/4850".
 */
export function parseMeters(s: string | null): number {
  if (!s) return 0;
  const nums = s.match(/\d+/g)?.map(Number) ?? [];
  return nums.reduce((a, b) => a + b, 0);
}
