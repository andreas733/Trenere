-- parties: Partier i svømmeklubben (A, A2, B, C, Svømmeskolen)
CREATE TABLE parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  has_planner boolean NOT NULL DEFAULT true,
  sequence integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed partier
INSERT INTO parties (name, slug, has_planner, sequence) VALUES
  ('A', 'a', true, 10),
  ('A2', 'a2', true, 20),
  ('B', 'b', true, 30),
  ('C', 'c', true, 40),
  ('Svømmeskolen', 'svommeskolen', false, 50);

-- trainer_parties: Mange-til-mange (trener kan være knyttet til flere partier)
CREATE TABLE trainer_parties (
  trainer_id uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  PRIMARY KEY (trainer_id, party_id)
);

CREATE INDEX idx_trainer_parties_trainer ON trainer_parties(trainer_id);
CREATE INDEX idx_trainer_parties_party ON trainer_parties(party_id);
CREATE INDEX idx_parties_slug ON parties(slug);
CREATE INDEX idx_parties_has_planner ON parties(has_planner) WHERE has_planner = true;

-- planned_sessions: Legg til party_id
-- Steg 1: Legg til kolonne som nullable
ALTER TABLE planned_sessions
  ADD COLUMN party_id uuid REFERENCES parties(id) ON DELETE CASCADE;

-- Steg 2: Tilordne eksisterende rader til parti A
UPDATE planned_sessions
SET party_id = (SELECT id FROM parties WHERE slug = 'a' LIMIT 1)
WHERE party_id IS NULL;

-- Steg 3: Sett NOT NULL
ALTER TABLE planned_sessions
  ALTER COLUMN party_id SET NOT NULL;

CREATE INDEX idx_planned_sessions_party_id ON planned_sessions(party_id);

-- RLS for parties og trainer_parties
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parties_read_all" ON parties FOR SELECT TO authenticated USING (true);
CREATE POLICY "trainer_parties_select" ON trainer_parties FOR SELECT TO authenticated USING (true);
CREATE POLICY "trainer_parties_insert" ON trainer_parties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "trainer_parties_delete" ON trainer_parties FOR DELETE TO authenticated USING (true);

-- Updated_at trigger for parties
CREATE TRIGGER parties_updated_at
  BEFORE UPDATE ON parties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
