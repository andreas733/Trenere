-- Legg til fokussvømmeart og intensitet på training_sessions
ALTER TABLE training_sessions
  ADD COLUMN focus_stroke text,
  ADD COLUMN intensity text;

-- Indekser for filtrering
CREATE INDEX idx_training_sessions_focus_stroke ON training_sessions(focus_stroke);
CREATE INDEX idx_training_sessions_intensity ON training_sessions(intensity);
