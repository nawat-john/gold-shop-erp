/*
  Adds branch_id to journal_entries so accounting reports can be scoped per branch
  (Phase 8 — cross-branch cash transfer & branch-scoped reporting).

  journal_entries already has rows (backfilled from Phase 4-7 transactions), so the
  column is added nullable, backfilled per ref_type by joining back to the source
  document's branch, then locked to NOT NULL.
*/

-- AlterTable (nullable first — existing rows need to be backfilled before NOT NULL)
ALTER TABLE "journal_entries" ADD COLUMN     "branch_id" TEXT;

-- Backfill: each ref_type maps to a source document that carries (or can derive) branch_id
UPDATE "journal_entries" je
SET "branch_id" = so.branch_id
FROM "sales_orders" so
WHERE je.ref_type IN ('sales_order', 'sales_order_void') AND je.ref_id = so.id;

UPDATE "journal_entries" je
SET "branch_id" = po.branch_id
FROM "purchase_orders" po
WHERE je.ref_type IN ('purchase_order', 'purchase_order_void') AND je.ref_id = po.id;

UPDATE "journal_entries" je
SET "branch_id" = so.branch_id
FROM "trade_ins" ti
JOIN "sales_orders" so ON so.id = ti.sales_order_id
WHERE je.ref_type IN ('trade_in', 'trade_in_void') AND je.ref_id = ti.id;

UPDATE "journal_entries" je
SET "branch_id" = pc.branch_id
FROM "pawn_events" pe
JOIN "pawn_contracts" pc ON pc.id = pe.contract_id
WHERE je.ref_type = 'pawn_event' AND je.ref_id = pe.id::text;

UPDATE "journal_entries" je
SET "branch_id" = sa.branch_id
FROM "savings_transactions" st
JOIN "savings_accounts" sa ON sa.id = st.account_id
WHERE je.ref_type = 'savings_transaction' AND je.ref_id = st.id::text;

UPDATE "journal_entries" je
SET "branch_id" = wo.branch_id
FROM "work_order_events" woe
JOIN "work_orders" wo ON wo.id = woe.work_order_id
WHERE je.ref_type = 'work_order_event' AND je.ref_id = woe.id::text;

UPDATE "journal_entries" je
SET "branch_id" = so.branch_id
FROM "commissions" c
JOIN "sales_orders" so ON so.id = c.sales_order_id
WHERE je.ref_type = 'commission' AND je.ref_id = c.id;

UPDATE "journal_entries" je
SET "branch_id" = ex.branch_id
FROM "expenses" ex
WHERE je.ref_type = 'expense' AND je.ref_id = ex.id;

-- Guard: fail loudly instead of silently locking rows with no derivable branch
DO $$
DECLARE
  missing_count INT;
BEGIN
  SELECT count(*) INTO missing_count FROM "journal_entries" WHERE "branch_id" IS NULL;
  IF missing_count > 0 THEN
    RAISE EXCEPTION 'journal_entries: % row(s) have no derivable branch_id — backfill this migration manually before proceeding', missing_count;
  END IF;
END $$;

-- AlterTable (now safe to enforce NOT NULL)
ALTER TABLE "journal_entries" ALTER COLUMN "branch_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "journal_entries_branch_id_idx" ON "journal_entries"("branch_id");

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
