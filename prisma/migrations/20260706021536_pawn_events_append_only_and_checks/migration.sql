-- pawn_events เป็น ledger — append-only บังคับระดับ DB เหมือน stock_movements/audit_logs
CREATE OR REPLACE FUNCTION forbid_pawn_event_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'pawn_events is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'raise_exception';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pawn_events_append_only
  BEFORE UPDATE OR DELETE ON pawn_events
  FOR EACH ROW
  EXECUTE FUNCTION forbid_pawn_event_mutation();

CREATE OR REPLACE FUNCTION forbid_pawn_event_truncate() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'pawn_events is append-only: TRUNCATE is not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pawn_events_no_truncate
  BEFORE TRUNCATE ON pawn_events
  FOR EACH STATEMENT
  EXECUTE FUNCTION forbid_pawn_event_truncate();

-- Constraint ระดับ DB: สัญญาขายฝากต้องมีค่าที่สมเหตุสมผลเสมอ
ALTER TABLE pawn_contracts
  ADD CONSTRAINT pawn_contracts_weight_positive CHECK (weight_mg > 0),
  ADD CONSTRAINT pawn_contracts_purity_range CHECK (gold_purity > 0 AND gold_purity <= 100),
  ADD CONSTRAINT pawn_contracts_principal_positive CHECK (principal_satang > 0),
  ADD CONSTRAINT pawn_contracts_interest_rate_range CHECK (annual_interest_rate_percent >= 0),
  ADD CONSTRAINT pawn_contracts_term_positive CHECK (term_months > 0),
  ADD CONSTRAINT pawn_contracts_due_after_start CHECK (due_date >= start_date);

-- เหตุการณ์: เงินต้นก่อน/หลังห้ามติดลบ, ดอกเบี้ยห้ามติดลบถ้ามีค่า
ALTER TABLE pawn_events
  ADD CONSTRAINT pawn_events_principal_before_nonnegative CHECK (principal_before_satang >= 0),
  ADD CONSTRAINT pawn_events_principal_after_nonnegative CHECK (principal_after_satang >= 0),
  ADD CONSTRAINT pawn_events_interest_nonnegative CHECK (interest_amount_satang IS NULL OR interest_amount_satang >= 0);

-- ประวัติรับชำระดอกเบี้ย: ห้ามติดลบ และช่วงเวลาต้องสมเหตุสมผล
ALTER TABLE pawn_interest_payments
  ADD CONSTRAINT pawn_interest_payments_amount_nonnegative CHECK (interest_amount_satang >= 0),
  ADD CONSTRAINT pawn_interest_payments_principal_nonnegative CHECK (principal_after_satang >= 0),
  ADD CONSTRAINT pawn_interest_payments_period_valid CHECK (period_to >= period_from);