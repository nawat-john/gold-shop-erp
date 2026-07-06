-- CreateEnum
CREATE TYPE "PawnContractStatus" AS ENUM ('ACTIVE', 'REDEEMED', 'FORFEITED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PawnEventType" AS ENUM ('OPEN', 'RENEW_INTEREST', 'REDEEM', 'FORFEIT', 'PRINCIPAL_INCREASE', 'PRINCIPAL_DECREASE', 'CANCEL');

-- CreateTable
CREATE TABLE "pawn_contracts" (
    "id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "status" "PawnContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT,
    "customer_citizen_id_enc" TEXT,
    "customer_citizen_id_hash" TEXT,
    "description" TEXT NOT NULL,
    "weight_mg" BIGINT NOT NULL,
    "gold_purity" DECIMAL(5,2) NOT NULL,
    "photo_path" TEXT,
    "customer_photo_path" TEXT,
    "location_id" TEXT,
    "principal_satang" BIGINT NOT NULL,
    "annual_interest_rate_percent" DECIMAL(5,2) NOT NULL,
    "term_months" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "interest_paid_through_date" TIMESTAMP(3) NOT NULL,
    "redeemed_at" TIMESTAMP(3),
    "redeemed_by_id" TEXT,
    "forfeited_at" TIMESTAMP(3),
    "forfeited_by_id" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "cancelled_by_id" TEXT,
    "cancel_reason" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pawn_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pawn_events" (
    "id" BIGSERIAL NOT NULL,
    "contract_id" TEXT NOT NULL,
    "event_type" "PawnEventType" NOT NULL,
    "principal_before_satang" BIGINT NOT NULL,
    "principal_after_satang" BIGINT NOT NULL,
    "interest_amount_satang" BIGINT,
    "period_from" TIMESTAMP(3),
    "period_to" TIMESTAMP(3),
    "actor_id" TEXT NOT NULL,
    "request_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pawn_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pawn_interest_payments" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "period_from" TIMESTAMP(3) NOT NULL,
    "period_to" TIMESTAMP(3) NOT NULL,
    "interest_amount_satang" BIGINT NOT NULL,
    "principal_after_satang" BIGINT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_id" TEXT NOT NULL,
    "request_id" TEXT,

    CONSTRAINT "pawn_interest_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pawn_contracts_doc_no_key" ON "pawn_contracts"("doc_no");

-- CreateIndex
CREATE INDEX "pawn_contracts_branch_id_status_idx" ON "pawn_contracts"("branch_id", "status");

-- CreateIndex
CREATE INDEX "pawn_contracts_status_due_date_idx" ON "pawn_contracts"("status", "due_date");

-- CreateIndex
CREATE INDEX "pawn_events_contract_id_created_at_idx" ON "pawn_events"("contract_id", "created_at");

-- CreateIndex
CREATE INDEX "pawn_interest_payments_contract_id_paid_at_idx" ON "pawn_interest_payments"("contract_id", "paid_at");

-- AddForeignKey
ALTER TABLE "pawn_contracts" ADD CONSTRAINT "pawn_contracts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pawn_contracts" ADD CONSTRAINT "pawn_contracts_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "storage_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pawn_events" ADD CONSTRAINT "pawn_events_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "pawn_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pawn_interest_payments" ADD CONSTRAINT "pawn_interest_payments_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "pawn_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
