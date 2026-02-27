-- app_settings: Key-value store for app configuration (e.g. NSF utviklingstrapp toggle)
CREATE TABLE app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed: NSF utviklingstrapp enabled by default
INSERT INTO app_settings (key, value) VALUES ('nsf_utviklingstrapp_enabled', 'true');

-- RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read
CREATE POLICY "app_settings_select" ON app_settings FOR SELECT TO authenticated USING (true);

-- Only admin users can insert/update
CREATE POLICY "app_settings_insert_admin" ON app_settings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "app_settings_update_admin" ON app_settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid()));

-- Updated_at trigger
CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
