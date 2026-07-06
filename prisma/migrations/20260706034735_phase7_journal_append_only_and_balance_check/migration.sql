-- journal_lines เป็น ledger — append-only บังคับระดับ DB เหมือน pawn_events/stock_movements
CREATE OR REPLACE FUNCTION forbid_journal_line_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'journal_lines is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'raise_exception';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_lines_append_only
  BEFORE UPDATE OR DELETE ON journal_lines
  FOR EACH ROW
  EXECUTE FUNCTION forbid_journal_line_mutation();

CREATE OR REPLACE FUNCTION forbid_journal_line_truncate() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'journal_lines is append-only: TRUNCATE is not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_lines_no_truncate
  BEFORE TRUNCATE ON journal_lines
  FOR EACH STATEMENT
  EXECUTE FUNCTION forbid_journal_line_truncate();

-- แต่ละบรรทัดต้องเป็น debit หรือ credit อย่างใดอย่างหนึ่งเท่านั้น (ห้ามทั้งคู่เป็น 0 หรือทั้งคู่ > 0)
ALTER TABLE journal_lines
  ADD CONSTRAINT journal_lines_debit_nonnegative CHECK (debit_satang >= 0),
  ADD CONSTRAINT journal_lines_credit_nonnegative CHECK (credit_satang >= 0),
  ADD CONSTRAINT journal_lines_exactly_one_side CHECK (
    (debit_satang > 0 AND credit_satang = 0) OR (debit_satang = 0 AND credit_satang > 0)
  );

-- หัวใจของบัญชีคู่ (Double-Entry): Σdebit = Σcredit ต่อ journal_entry เดียวกันเสมอ
-- ใช้ DEFERRABLE CONSTRAINT TRIGGER เพื่อให้เช็คตอน COMMIT (หลังแทรกครบทุกบรรทัดของ entry นั้นแล้ว)
CREATE OR REPLACE FUNCTION check_journal_entry_balanced() RETURNS trigger AS $$
DECLARE
  total_debit BIGINT;
  total_credit BIGINT;
BEGIN
  SELECT COALESCE(SUM(debit_satang), 0), COALESCE(SUM(credit_satang), 0)
    INTO total_debit, total_credit
    FROM journal_lines
    WHERE entry_id = NEW.entry_id;

  IF total_debit <> total_credit THEN
    RAISE EXCEPTION 'journal entry % is not balanced: debit % <> credit %',
      NEW.entry_id, total_debit, total_credit
      USING ERRCODE = 'raise_exception';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER journal_lines_balanced
  AFTER INSERT ON journal_lines
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION check_journal_entry_balanced();

-- Constraint ระดับ DB สำหรับตารางอื่นในเฟส 7
ALTER TABLE expenses
  ADD CONSTRAINT expenses_amount_positive CHECK (amount_satang > 0);

ALTER TABLE commissions
  ADD CONSTRAINT commissions_amount_nonnegative CHECK (amount_satang >= 0),
  ADD CONSTRAINT commissions_rate_range CHECK (rate_percent >= 0 AND rate_percent <= 100);