-- CreateEnum
CREATE TYPE "CustomerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD');

-- CreateEnum
CREATE TYPE "AmloAlertStatus" AS ENUM ('PENDING', 'REVIEWED', 'REPORTED');

-- CreateEnum
CREATE TYPE "AmloRefType" AS ENUM ('SALES_ORDER', 'PURCHASE_ORDER', 'PAWN_CONTRACT');

-- CreateEnum
CREATE TYPE "SavingsAccountType" AS ENUM ('CASH_SAVINGS', 'WEIGHT_SAVINGS');

-- CreateEnum
CREATE TYPE "SavingsAccountStatus" AS ENUM ('ACTIVE', 'CLOSED_GOLD', 'CLOSED_CASH', 'CLOSED_DEFAULTED');

-- CreateEnum
CREATE TYPE "SavingsTxType" AS ENUM ('OPEN', 'DEPOSIT', 'CLOSE_GOLD', 'CLOSE_CASH', 'CLOSE_DEFAULTED');

-- CreateEnum
CREATE TYPE "WorkOrderType" AS ENUM ('CUSTOM_ORDER', 'REPAIR');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkOrderEventType" AS ENUM ('RECEIVE', 'GOLD_ISSUE', 'STATUS_CHANGE', 'COMPLETE', 'DELIVER', 'CANCEL');

-- AlterTable
ALTER TABLE "pawn_contracts" ADD COLUMN     "customer_id" TEXT;

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "customer_id" TEXT;

-- AlterTable
ALTER TABLE "sales_orders" ADD COLUMN     "customer_id" TEXT;

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "note" TEXT,
    "citizen_id_enc" TEXT,
    "citizen_id_hash" TEXT,
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,
    "tier" "CustomerTier" NOT NULL DEFAULT 'BRONZE',
    "consent_given_at" TIMESTAMP(3),
    "consent_withdrawn_at" TIMESTAMP(3),
    "anonymized_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amlo_alerts" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT,
    "ref_type" "AmloRefType" NOT NULL,
    "ref_id" TEXT NOT NULL,
    "amount_satang" BIGINT NOT NULL,
    "watchlist_match" BOOLEAN NOT NULL DEFAULT false,
    "status" "AmloAlertStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reported_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amlo_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amlo_watchlist_entries" (
    "id" TEXT NOT NULL,
    "citizen_id_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amlo_watchlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_accounts" (
    "id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "account_type" "SavingsAccountType" NOT NULL,
    "status" "SavingsAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "balance_satang" BIGINT NOT NULL DEFAULT 0,
    "balance_weight_mg" BIGINT NOT NULL DEFAULT 0,
    "target_weight_mg" BIGINT,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "closed_by_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_transactions" (
    "id" BIGSERIAL NOT NULL,
    "account_id" TEXT NOT NULL,
    "tx_type" "SavingsTxType" NOT NULL,
    "amount_satang" BIGINT,
    "weight_mg" BIGINT,
    "price_snapshot" JSONB,
    "actor_id" TEXT NOT NULL,
    "request_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "type" "WorkOrderType" NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'RECEIVED',
    "description" TEXT NOT NULL,
    "deposit_satang" BIGINT NOT NULL DEFAULT 0,
    "gold_issued_mg" BIGINT NOT NULL DEFAULT 0,
    "tolerance_mg" BIGINT NOT NULL DEFAULT 0,
    "service_fee_satang" BIGINT NOT NULL DEFAULT 0,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promised_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_events" (
    "id" BIGSERIAL NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "event_type" "WorkOrderEventType" NOT NULL,
    "note" TEXT,
    "actor_id" TEXT NOT NULL,
    "request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_code_key" ON "customers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_citizen_id_hash_key" ON "customers"("citizen_id_hash");

-- CreateIndex
CREATE INDEX "amlo_alerts_status_idx" ON "amlo_alerts"("status");

-- CreateIndex
CREATE INDEX "amlo_alerts_ref_type_ref_id_idx" ON "amlo_alerts"("ref_type", "ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "amlo_watchlist_entries_citizen_id_hash_key" ON "amlo_watchlist_entries"("citizen_id_hash");

-- CreateIndex
CREATE UNIQUE INDEX "savings_accounts_doc_no_key" ON "savings_accounts"("doc_no");

-- CreateIndex
CREATE INDEX "savings_accounts_branch_id_status_idx" ON "savings_accounts"("branch_id", "status");

-- CreateIndex
CREATE INDEX "savings_transactions_account_id_created_at_idx" ON "savings_transactions"("account_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_doc_no_key" ON "work_orders"("doc_no");

-- CreateIndex
CREATE INDEX "work_orders_branch_id_status_idx" ON "work_orders"("branch_id", "status");

-- CreateIndex
CREATE INDEX "work_order_events_work_order_id_created_at_idx" ON "work_order_events"("work_order_id", "created_at");

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pawn_contracts" ADD CONSTRAINT "pawn_contracts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amlo_alerts" ADD CONSTRAINT "amlo_alerts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_accounts" ADD CONSTRAINT "savings_accounts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_accounts" ADD CONSTRAINT "savings_accounts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_transactions" ADD CONSTRAINT "savings_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "savings_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_events" ADD CONSTRAINT "work_order_events_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
