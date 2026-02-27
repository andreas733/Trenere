-- Legg til focus_stroke og intensitet for AI-genererte økter
ALTER TABLE planned_sessions
  ADD COLUMN ai_focus_stroke text,
  ADD COLUMN ai_intensity text;

CREATE INDEX idx_planned_sessions_ai_focus_stroke ON planned_sessions(ai_focus_stroke);
CREATE INDEX idx_planned_sessions_ai_intensity ON planned_sessions(ai_intensity);
