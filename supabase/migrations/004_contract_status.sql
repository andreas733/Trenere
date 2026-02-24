-- Sporing av kontraktsignering (Anvil Etch)
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS contract_etch_packet_eid text,
  ADD COLUMN IF NOT EXISTS contract_status text,
  ADD COLUMN IF NOT EXISTS contract_sent_at timestamptz;

-- contract_status: 'sent' | 'club_signed' | 'completed' | 'declined' | 'voided'
CREATE INDEX IF NOT EXISTS idx_trainers_contract_etch_packet_eid ON trainers(contract_etch_packet_eid)
  WHERE contract_etch_packet_eid IS NOT NULL;
