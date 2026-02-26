-- Utvid planned_sessions for AI-generert innhold uten training_sessions
ALTER TABLE planned_sessions
  ALTER COLUMN session_id DROP NOT NULL;

ALTER TABLE planned_sessions
  ADD COLUMN ai_title text,
  ADD COLUMN ai_content text,
  ADD COLUMN ai_total_meters text;

-- Enten session_id (fra bank) eller ai_title (AI-generert) må være satt
ALTER TABLE planned_sessions
  ADD CONSTRAINT planned_sessions_session_or_ai_check
  CHECK (
    (session_id IS NOT NULL AND ai_title IS NULL) OR
    (session_id IS NULL AND ai_title IS NOT NULL)
  );
