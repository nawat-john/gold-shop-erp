-- audit_logs ต้อง append-only: บังคับที่ระดับ DB ไม่ใช่แค่วินัยในโค้ด
-- trigger ทำงานกับทุก DB user (รวม owner) — ปลอดภัยกว่า REVOKE เพียงอย่างเดียว
CREATE OR REPLACE FUNCTION forbid_audit_log_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'raise_exception';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_append_only
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION forbid_audit_log_mutation();

-- กัน TRUNCATE ด้วย (trigger ระดับ statement)
CREATE OR REPLACE FUNCTION forbid_audit_log_truncate() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: TRUNCATE is not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_no_truncate
  BEFORE TRUNCATE ON audit_logs
  FOR EACH STATEMENT
  EXECUTE FUNCTION forbid_audit_log_truncate();
