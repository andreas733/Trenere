-- Rettighetsstyring: statistikk-modulen
-- Nye trenere får ingen tilgang. Admin gir tilgang via treneredit.
-- Eksisterende trenere beholder tilgang (DEFAULT true).

ALTER TABLE trainers ADD COLUMN can_access_statistics boolean NOT NULL DEFAULT true;
ALTER TABLE trainers ALTER COLUMN can_access_statistics SET DEFAULT false;
