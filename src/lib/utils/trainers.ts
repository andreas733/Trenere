export type LevelInfo = { id: string; name: string; sequence: number };
type RawCert = { trainer_levels: LevelInfo | LevelInfo[] | null };
export type NormalizedCert = { trainer_levels: LevelInfo | null };

export function normalizeTrainers<T extends { trainer_certifications?: RawCert[] }>(
  raw: T[]
): (Omit<T, "trainer_certifications"> & { trainer_certifications: NormalizedCert[] })[] {
  return raw.map((t) => {
    const certs = t.trainer_certifications ?? [];
    const normalized: NormalizedCert[] = certs.map((c) => {
      const levels = c.trainer_levels;
      const level = !levels ? null : Array.isArray(levels) ? levels[0] ?? null : levels;
      return { trainer_levels: level };
    });
    return { ...t, trainer_certifications: normalized };
  });
}
