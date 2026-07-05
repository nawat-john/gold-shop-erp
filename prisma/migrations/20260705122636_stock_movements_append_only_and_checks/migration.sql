-- stock_movements เป็น ledger — append-only บังคับระดับ DB เหมือน audit_logs
CREATE OR REPLACE FUNCTION forbid_stock_movement_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'stock_movements is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'raise_exception';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_movements_append_only
  BEFORE UPDATE OR DELETE ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION forbid_stock_movement_mutation();

CREATE OR REPLACE FUNCTION forbid_stock_movement_truncate() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'stock_movements is append-only: TRUNCATE is not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_movements_no_truncate
  BEFORE TRUNCATE ON stock_movements
  FOR EACH STATEMENT
  EXECUTE FUNCTION forbid_stock_movement_truncate();

-- Constraint ระดับ DB (แผน §6.1): น้ำหนัก/ต้นทุนต้องสมเหตุสมผลเสมอ
ALTER TABLE inventory_items
  ADD CONSTRAINT inventory_items_weight_positive CHECK (weight_mg > 0),
  ADD CONSTRAINT inventory_items_cost_nonnegative CHECK (cost_satang >= 0),
  ADD CONSTRAINT inventory_items_purity_range CHECK (gold_purity > 0 AND gold_purity <= 100);

ALTER TABLE products
  ADD CONSTRAINT products_purity_range CHECK (gold_purity > 0 AND gold_purity <= 100),
  ADD CONSTRAINT products_std_weight_positive CHECK (std_weight_mg IS NULL OR std_weight_mg > 0);

-- ledger: quantity ห้ามเป็น 0 และเครื่องหมายน้ำหนักต้องตรงกับ quantity
ALTER TABLE stock_movements
  ADD CONSTRAINT stock_movements_quantity_nonzero CHECK (quantity <> 0),
  ADD CONSTRAINT stock_movements_weight_sign CHECK (
    (quantity > 0 AND weight_mg > 0) OR (quantity < 0 AND weight_mg < 0)
  );

-- โอนย้ายห้ามสาขาต้นทาง = ปลายทาง
ALTER TABLE branch_transfers
  ADD CONSTRAINT branch_transfers_different_branches CHECK (from_branch_id <> to_branch_id);
