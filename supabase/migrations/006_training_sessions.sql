-- training_sessions: Bank med gjenbrukbare treningsøkter
CREATE TABLE training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  total_meters text,
  created_by uuid REFERENCES trainers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- planned_sessions: Planlagte økter på felles klubbkalender
CREATE TABLE planned_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  planned_date date NOT NULL UNIQUE,
  planned_by uuid REFERENCES trainers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_training_sessions_created_by ON training_sessions(created_by);
CREATE INDEX idx_training_sessions_created_at ON training_sessions(created_at DESC);
CREATE INDEX idx_planned_sessions_planned_date ON planned_sessions(planned_date);
CREATE INDEX idx_planned_sessions_session_id ON planned_sessions(session_id);

-- RLS
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_sessions ENABLE ROW LEVEL SECURITY;

-- Helper: sjekk om bruker er trener eller admin
CREATE OR REPLACE FUNCTION is_trainer_or_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trainers WHERE auth_user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- training_sessions: lesbar for alle autentiserte, skriv for trener/admin
CREATE POLICY "training_sessions_select_authenticated" ON training_sessions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "training_sessions_insert_trainer_or_admin" ON training_sessions
  FOR INSERT TO authenticated WITH CHECK (is_trainer_or_admin());

CREATE POLICY "training_sessions_update_trainer_or_admin" ON training_sessions
  FOR UPDATE TO authenticated USING (is_trainer_or_admin());

CREATE POLICY "training_sessions_delete_trainer_or_admin" ON training_sessions
  FOR DELETE TO authenticated USING (is_trainer_or_admin());

-- planned_sessions: lesbar for alle autentiserte, skriv for trener/admin
CREATE POLICY "planned_sessions_select_authenticated" ON planned_sessions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "planned_sessions_insert_trainer_or_admin" ON planned_sessions
  FOR INSERT TO authenticated WITH CHECK (is_trainer_or_admin());

CREATE POLICY "planned_sessions_delete_trainer_or_admin" ON planned_sessions
  FOR DELETE TO authenticated USING (is_trainer_or_admin());

-- updated_at trigger for training_sessions
CREATE TRIGGER training_sessions_updated_at
  BEFORE UPDATE ON training_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
