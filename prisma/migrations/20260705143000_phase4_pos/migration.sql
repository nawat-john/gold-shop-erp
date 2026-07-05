-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('OPEN', 'CLOSED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "SalesOrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'VOIDED');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('COMPLETED', 'VOIDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'CREDIT_CARD');

-- CreateTable
CREATE TABLE "cash_drawers" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_drawers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "drawer_id" TEXT NOT NULL,
    "opened_by_id" TEXT NOT NULL,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_by_id" TEXT,
    "closed_at" TIMESTAMP(3),
    "start_cash_satang" BIGINT NOT NULL,
    "end_cash_satang" BIGINT,
    "expected_cash_satang" BIGINT,
    "reconciled_at" TIMESTAMP(3),
    "reconciled_by_id" TEXT,
    "status" "ShiftStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "price_snapshot" JSONB NOT NULL,
    "total_amount_satang" BIGINT NOT NULL,
    "vat_amount_satang" BIGINT NOT NULL,
    "status" "SalesOrderStatus" NOT NULL DEFAULT 'COMPLETED',
    "idempotency_key" TEXT,
    "voided_at" TIMESTAMP(3),
    "voided_by_id" TEXT,
    "void_reason" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "item_id" TEXT,
    "quantity" INTEGER NOT NULL,
    "weight_mg" BIGINT NOT NULL,
    "gold_purity" DECIMAL(5,2) NOT NULL,
    "gold_price_satang" BIGINT NOT NULL,
    "labor_charge_satang" BIGINT NOT NULL,
    "vat_amount_satang" BIGINT NOT NULL,
    "total_amount_satang" BIGINT NOT NULL,

    CONSTRAINT "sales_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "price_snapshot" JSONB NOT NULL,
    "total_amount_satang" BIGINT NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'COMPLETED',
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "customer_citizen_id" TEXT,
    "idempotency_key" TEXT,
    "voided_at" TIMESTAMP(3),
    "voided_by_id" TEXT,
    "void_reason" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT,
    "item_id" TEXT,
    "description" TEXT NOT NULL,
    "weight_mg" BIGINT NOT NULL,
    "gold_purity" DECIMAL(5,2) NOT NULL,
    "unit_price_satang" BIGINT NOT NULL,
    "total_amount_satang" BIGINT NOT NULL,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_ins" (
    "id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "sales_order_id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "net_amount_satang" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "sales_order_id" TEXT,
    "purchase_order_id" TEXT,
    "trade_in_id" TEXT,
    "payment_method" "PaymentMethod" NOT NULL,
    "amount_satang" BIGINT NOT NULL,
    "fee_satang" BIGINT NOT NULL DEFAULT 0,
    "reference_no" TEXT,
    "slip_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_invoices" (
    "id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "sales_order_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_address" TEXT,
    "customer_tax_id" TEXT,
    "is_full" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cash_drawers_branch_id_code_key" ON "cash_drawers"("branch_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_doc_no_key" ON "sales_orders"("doc_no");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_idempotency_key_key" ON "sales_orders"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_doc_no_key" ON "purchase_orders"("doc_no");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_idempotency_key_key" ON "purchase_orders"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "trade_ins_doc_no_key" ON "trade_ins"("doc_no");

-- CreateIndex
CREATE UNIQUE INDEX "trade_ins_sales_order_id_key" ON "trade_ins"("sales_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "trade_ins_purchase_order_id_key" ON "trade_ins"("purchase_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "tax_invoices_doc_no_key" ON "tax_invoices"("doc_no");

-- AddForeignKey
ALTER TABLE "cash_drawers" ADD CONSTRAINT "cash_drawers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_drawer_id_fkey" FOREIGN KEY ("drawer_id") REFERENCES "cash_drawers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_ins" ADD CONSTRAINT "trade_ins_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_ins" ADD CONSTRAINT "trade_ins_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_trade_in_id_fkey" FOREIGN KEY ("trade_in_id") REFERENCES "trade_ins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_invoices" ADD CONSTRAINT "tax_invoices_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
