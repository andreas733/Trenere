-- wage_levels: Lønnstrinn for kontrakter
CREATE TABLE wage_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hourly_wage numeric NOT NULL DEFAULT 0,
  minimum_hours integer NOT NULL DEFAULT 0,
  sequence integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- trainers: Trenere/frivillige
CREATE TABLE trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  national_identity_number text,
  birthdate date,
  bank_account_number text,
  phone text,
  street text,
  street2 text,
  zip text,
  city text,
  tripletex_id integer,
  wage_level_id uuid REFERENCES wage_levels(id) ON DELETE SET NULL,
  minimum_hours integer DEFAULT 0,
  contract_from_date date,
  contract_to_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- admin_users: Brukere som har admin-tilgang (knyttes til auth.users via auth_user_id)
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for lookups
CREATE INDEX idx_trainers_email ON trainers(email);
CREATE INDEX idx_trainers_auth_user ON trainers(auth_user_id);
CREATE INDEX idx_trainers_created ON trainers(created_at DESC);
CREATE INDEX idx_wage_levels_sequence ON wage_levels(sequence);

-- RLS
ALTER TABLE wage_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- wage_levels: Lesbar for alle autentiserte (admin trenger det), skriv kun via service role
CREATE POLICY "wage_levels_read_all" ON wage_levels FOR SELECT TO authenticated USING (true);

-- trainers: Alle kan lese (for admin). Kun service/anonym kan opprette (ved registrering).
-- Admin kan oppdatere (via API med service eller admin-check)
CREATE POLICY "trainers_select_authenticated" ON trainers FOR SELECT TO authenticated USING (true);
CREATE POLICY "trainers_insert_anon" ON trainers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "trainers_insert_authenticated" ON trainers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "trainers_update_authenticated" ON trainers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "trainers_update_service" ON trainers FOR UPDATE TO service_role USING (true);

-- admin_users: Kun admin kan lese (sjekk om bruker er admin)
CREATE POLICY "admin_users_select_own" ON admin_users FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wage_levels_updated_at
  BEFORE UPDATE ON wage_levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trainers_updated_at
  BEFORE UPDATE ON trainers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
