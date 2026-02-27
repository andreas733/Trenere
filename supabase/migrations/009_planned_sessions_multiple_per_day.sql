-- Tillat flere planlagte økter per dato
ALTER TABLE planned_sessions DROP CONSTRAINT planned_sessions_planned_date_key;
