-- contract_fast: Når true har treneren fast kontrakt (kun fra-dato, ingen sluttdato)
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS contract_fast boolean NOT NULL DEFAULT false;
