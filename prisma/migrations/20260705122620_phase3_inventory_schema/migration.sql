-- CreateEnum
CREATE TYPE "ProductTracking" AS ENUM ('SERIALIZED', 'COUNTED');

-- CreateEnum
CREATE TYPE "StorageKind" AS ENUM ('SHOWCASE', 'TRAY', 'SAFE', 'OTHER');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('IN_STOCK', 'RESERVED', 'SOLD', 'PAWNED_COLLATERAL', 'IN_TRANSIT', 'MELTED', 'MISSING');

-- CreateEnum
CREATE TYPE "AcquisitionSource" AS ENUM ('SUPPLIER', 'BUYBACK', 'PAWN_FORFEIT');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('RECEIVE_SUPPLIER', 'BUYBACK_IN', 'PAWN_FORFEIT_IN', 'SALE_OUT', 'TRANSFER_OUT', 'TRANSFER_IN', 'MELT_OUT', 'COUNT_ADJUST_IN', 'COUNT_ADJUST_OUT', 'MANUAL_ADJUST_IN', 'MANUAL_ADJUST_OUT');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('DRAFT', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MeltLotStatus" AS ENUM ('OPEN', 'SENT', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockCountStatus" AS ENUM ('OPEN', 'REVIEW', 'APPROVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "note" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "default_labor_charge" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "tracking" "ProductTracking" NOT NULL,
    "gold_purity" DECIMAL(5,2) NOT NULL,
    "std_weight_mg" BIGINT,
    "labor_charge" BIGINT,
    "pattern" TEXT,
    "photo_path" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_locations" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "StorageKind" NOT NULL DEFAULT 'SHOWCASE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storage_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "serial_no" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'IN_STOCK',
    "weight_mg" BIGINT NOT NULL,
    "gold_purity" DECIMAL(5,2) NOT NULL,
    "cost_satang" BIGINT NOT NULL,
    "labor_charge" BIGINT,
    "source" "AcquisitionSource" NOT NULL DEFAULT 'SUPPLIER',
    "supplier_id" TEXT,
    "location_id" TEXT,
    "photo_path" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_labels" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "printed_by" TEXT NOT NULL,
    "printed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "product_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" BIGSERIAL NOT NULL,
    "movement_type" "StockMovementType" NOT NULL,
    "branch_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "item_id" TEXT,
    "quantity" INTEGER NOT NULL,
    "weight_mg" BIGINT NOT NULL,
    "cost_satang" BIGINT,
    "ref_type" TEXT,
    "ref_id" TEXT,
    "actor_id" TEXT NOT NULL,
    "request_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_transfers" (
    "id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "from_branch_id" TEXT NOT NULL,
    "to_branch_id" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" TEXT NOT NULL,
    "sent_by" TEXT,
    "sent_at" TIMESTAMP(3),
    "received_by" TEXT,
    "received_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_transfer_items" (
    "transfer_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,

    CONSTRAINT "branch_transfer_items_pkey" PRIMARY KEY ("transfer_id","item_id")
);

-- CreateTable
CREATE TABLE "melt_lots" (
    "id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "status" "MeltLotStatus" NOT NULL DEFAULT 'OPEN',
    "sent_weight_mg" BIGINT,
    "returned_weight_mg" BIGINT,
    "returned_satang" BIGINT,
    "created_by" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "melt_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "melt_lot_items" (
    "lot_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,

    CONSTRAINT "melt_lot_items_pkey" PRIMARY KEY ("lot_id","item_id")
);

-- CreateTable
CREATE TABLE "stock_counts" (
    "id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "status" "StockCountStatus" NOT NULL DEFAULT 'OPEN',
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_count_items" (
    "count_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "expected" BOOLEAN NOT NULL DEFAULT true,
    "found" BOOLEAN,
    "counted_by" TEXT,
    "counted_at" TIMESTAMP(3),

    CONSTRAINT "stock_count_items_pkey" PRIMARY KEY ("count_id","item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_code_key" ON "product_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "storage_locations_branch_id_code_key" ON "storage_locations"("branch_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_serial_no_key" ON "inventory_items"("serial_no");

-- CreateIndex
CREATE INDEX "inventory_items_branch_id_status_idx" ON "inventory_items"("branch_id", "status");

-- CreateIndex
CREATE INDEX "inventory_items_product_id_idx" ON "inventory_items"("product_id");

-- CreateIndex
CREATE INDEX "product_labels_item_id_idx" ON "product_labels"("item_id");

-- CreateIndex
CREATE INDEX "stock_movements_branch_id_product_id_created_at_idx" ON "stock_movements"("branch_id", "product_id", "created_at");

-- CreateIndex
CREATE INDEX "stock_movements_item_id_idx" ON "stock_movements"("item_id");

-- CreateIndex
CREATE INDEX "stock_movements_ref_type_ref_id_idx" ON "stock_movements"("ref_type", "ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "branch_transfers_doc_no_key" ON "branch_transfers"("doc_no");

-- CreateIndex
CREATE INDEX "branch_transfers_from_branch_id_status_idx" ON "branch_transfers"("from_branch_id", "status");

-- CreateIndex
CREATE INDEX "branch_transfers_to_branch_id_status_idx" ON "branch_transfers"("to_branch_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "melt_lots_doc_no_key" ON "melt_lots"("doc_no");

-- CreateIndex
CREATE INDEX "melt_lots_branch_id_status_idx" ON "melt_lots"("branch_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "stock_counts_doc_no_key" ON "stock_counts"("doc_no");

-- CreateIndex
CREATE INDEX "stock_counts_branch_id_status_idx" ON "stock_counts"("branch_id", "status");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_locations" ADD CONSTRAINT "storage_locations_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "storage_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_labels" ADD CONSTRAINT "product_labels_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_transfers" ADD CONSTRAINT "branch_transfers_from_branch_id_fkey" FOREIGN KEY ("from_branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_transfers" ADD CONSTRAINT "branch_transfers_to_branch_id_fkey" FOREIGN KEY ("to_branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_transfer_items" ADD CONSTRAINT "branch_transfer_items_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "branch_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_transfer_items" ADD CONSTRAINT "branch_transfer_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "melt_lots" ADD CONSTRAINT "melt_lots_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "melt_lot_items" ADD CONSTRAINT "melt_lot_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "melt_lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "melt_lot_items" ADD CONSTRAINT "melt_lot_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_counts" ADD CONSTRAINT "stock_counts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_count_items" ADD CONSTRAINT "stock_count_items_count_id_fkey" FOREIGN KEY ("count_id") REFERENCES "stock_counts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_count_items" ADD CONSTRAINT "stock_count_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
