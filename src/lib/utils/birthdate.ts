/**
 * Parse DDMMYY from first 6 digits of Norwegian fødselsnummer.
 */
export function birthdateFromNationalId(nationalId: string | null | undefined): string | null {
  if (!nationalId) return null;
  const digits = String(nationalId).replace(/\D/g, "");
  if (digits.length < 6) return null;
  try {
    const day = parseInt(digits.slice(0, 2), 10);
    const month = parseInt(digits.slice(2, 4), 10);
    const yy = parseInt(digits.slice(4, 6), 10);
    const year = yy < 40 ? 2000 + yy : 1900 + yy;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
  } catch {
    return null;
  }
}
