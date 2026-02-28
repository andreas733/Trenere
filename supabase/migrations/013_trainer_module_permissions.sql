-- Rettighetsstyring: treningsøktbanken og planleggeren
-- Nye trenere får kun tilgang til Min side. Admin gir rettigheter til moduler.
-- Eksisterende trenere beholder tilgang (DEFAULT true).

ALTER TABLE trainers
  ADD COLUMN can_access_workout_library boolean NOT NULL DEFAULT true,
  ADD COLUMN can_access_planner boolean NOT NULL DEFAULT true;

-- Fremtidige inserts (f.eks. ved registrering) skal eksplisitt settes til false.
-- Kolonnenes default for nye rader endres til false.
ALTER TABLE trainers
  ALTER COLUMN can_access_workout_library SET DEFAULT false,
  ALTER COLUMN can_access_planner SET DEFAULT false;
