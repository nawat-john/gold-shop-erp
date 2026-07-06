-- savings_transactions เป็น ledger — append-only บังคับระดับ DB เหมือน pawn_events/stock_movements
CREATE OR REPLACE FUNCTION forbid_savings_tx_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'savings_transactions is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'raise_exception';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER savings_transactions_append_only
  BEFORE UPDATE OR DELETE ON savings_transactions
  FOR EACH ROW
  EXECUTE FUNCTION forbid_savings_tx_mutation();

CREATE OR REPLACE FUNCTION forbid_savings_tx_truncate() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'savings_transactions is append-only: TRUNCATE is not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER savings_transactions_no_truncate
  BEFORE TRUNCATE ON savings_transactions
  FOR EACH STATEMENT
  EXECUTE FUNCTION forbid_savings_tx_truncate();

-- work_order_events เป็น ledger — append-only บังคับระดับ DB เหมือนกัน
CREATE OR REPLACE FUNCTION forbid_work_order_event_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'work_order_events is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'raise_exception';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER work_order_events_append_only
  BEFORE UPDATE OR DELETE ON work_order_events
  FOR EACH ROW
  EXECUTE FUNCTION forbid_work_order_event_mutation();

CREATE OR REPLACE FUNCTION forbid_work_order_event_truncate() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'work_order_events is append-only: TRUNCATE is not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER work_order_events_no_truncate
  BEFORE TRUNCATE ON work_order_events
  FOR EACH STATEMENT
  EXECUTE FUNCTION forbid_work_order_event_truncate();

-- Constraint ระดับ DB: ยอดคงเหลือห้ามติดลบ, น้ำหนัก/เงินต้องสมเหตุสมผล
ALTER TABLE savings_accounts
  ADD CONSTRAINT savings_accounts_balance_satang_nonnegative CHECK (balance_satang >= 0),
  ADD CONSTRAINT savings_accounts_balance_weight_nonnegative CHECK (balance_weight_mg >= 0),
  ADD CONSTRAINT savings_accounts_target_weight_positive CHECK (target_weight_mg IS NULL OR target_weight_mg > 0);

ALTER TABLE work_orders
  ADD CONSTRAINT work_orders_deposit_nonnegative CHECK (deposit_satang >= 0),
  ADD CONSTRAINT work_orders_gold_issued_nonnegative CHECK (gold_issued_mg >= 0),
  ADD CONSTRAINT work_orders_tolerance_nonnegative CHECK (tolerance_mg >= 0),
  ADD CONSTRAINT work_orders_service_fee_nonnegative CHECK (service_fee_satang >= 0);

ALTER TABLE amlo_alerts
  ADD CONSTRAINT amlo_alerts_amount_positive CHECK (amount_satang > 0);