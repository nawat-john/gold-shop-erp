-- CreateTable
CREATE TABLE "cash_transfers" (
    "id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "from_branch_id" TEXT NOT NULL,
    "to_branch_id" TEXT NOT NULL,
    "from_drawer_id" TEXT,
    "to_drawer_id" TEXT,
    "amount_satang" BIGINT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" TEXT NOT NULL,
    "sent_by" TEXT,
    "sent_at" TIMESTAMP(3),
    "received_by" TEXT,
    "received_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cash_transfers_doc_no_key" ON "cash_transfers"("doc_no");

-- CreateIndex
CREATE INDEX "cash_transfers_from_branch_id_status_idx" ON "cash_transfers"("from_branch_id", "status");

-- CreateIndex
CREATE INDEX "cash_transfers_to_branch_id_status_idx" ON "cash_transfers"("to_branch_id", "status");

-- AddForeignKey
ALTER TABLE "cash_transfers" ADD CONSTRAINT "cash_transfers_from_branch_id_fkey" FOREIGN KEY ("from_branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_transfers" ADD CONSTRAINT "cash_transfers_to_branch_id_fkey" FOREIGN KEY ("to_branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_transfers" ADD CONSTRAINT "cash_transfers_from_drawer_id_fkey" FOREIGN KEY ("from_drawer_id") REFERENCES "cash_drawers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_transfers" ADD CONSTRAINT "cash_transfers_to_drawer_id_fkey" FOREIGN KEY ("to_drawer_id") REFERENCES "cash_drawers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CheckConstraint (money invariants — DB-level guard, not just application-level)
ALTER TABLE "cash_transfers"
  ADD CONSTRAINT cash_transfers_amount_positive CHECK (amount_satang > 0),
  ADD CONSTRAINT cash_transfers_branches_distinct CHECK (from_branch_id != to_branch_id);
