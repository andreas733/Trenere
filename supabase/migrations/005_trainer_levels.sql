-- trainer_levels: Utdanningsnivåer (trenerutdanning)
CREATE TABLE trainer_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sequence integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- trainer_certifications: Mange-til-mange (trener kan ha flere nivåer)
CREATE TABLE trainer_certifications (
  trainer_id uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  level_id uuid NOT NULL REFERENCES trainer_levels(id) ON DELETE CASCADE,
  PRIMARY KEY (trainer_id, level_id)
);

CREATE INDEX idx_trainer_levels_sequence ON trainer_levels(sequence);
CREATE INDEX idx_trainer_certifications_trainer ON trainer_certifications(trainer_id);

-- Seed nivåer (lavest til høyest)
INSERT INTO trainer_levels (name, sequence) VALUES
  ('Opplæringstrener grunnferdigheter', 10),
  ('Opplæringstrener svømmearter', 20),
  ('Opplæringstrener parasvømming', 30),
  ('Trener 1', 40),
  ('Trener 2', 50),
  ('Trener 3', 60),
  ('Trener 4', 70),
  ('Topptrener', 80);

-- RLS
ALTER TABLE trainer_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_certifications ENABLE ROW LEVEL SECURITY;

-- trainer_levels: Lesbar for alle autentiserte
CREATE POLICY "trainer_levels_read_all" ON trainer_levels FOR SELECT TO authenticated USING (true);

-- trainer_certifications: Lesbar for autentiserte, skriv via service/authenticated (admin)
CREATE POLICY "trainer_certifications_select" ON trainer_certifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "trainer_certifications_insert" ON trainer_certifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "trainer_certifications_delete" ON trainer_certifications FOR DELETE TO authenticated USING (true);

-- Updated_at trigger for trainer_levels
CREATE TRIGGER trainer_levels_updated_at
  BEFORE UPDATE ON trainer_levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
