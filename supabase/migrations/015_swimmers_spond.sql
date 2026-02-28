-- swimmers: Svømmere hentet fra Spond, organisert etter parti
CREATE TABLE swimmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spond_uid text NOT NULL UNIQUE,
  name text NOT NULL,
  email text,
  phone text,
  party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_swimmers_spond_uid ON swimmers(spond_uid);
CREATE INDEX idx_swimmers_party_id ON swimmers(party_id);

-- parties: Legg til mapping til Spond subgroup
ALTER TABLE parties ADD COLUMN spond_subgroup_id text;

-- RLS for swimmers
ALTER TABLE swimmers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "swimmers_select_authenticated" ON swimmers FOR SELECT TO authenticated USING (true);
CREATE POLICY "swimmers_insert_service" ON swimmers FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "swimmers_update_service" ON swimmers FOR UPDATE TO service_role USING (true);

-- Updated_at trigger for swimmers
CREATE TRIGGER swimmers_updated_at
  BEFORE UPDATE ON swimmers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
