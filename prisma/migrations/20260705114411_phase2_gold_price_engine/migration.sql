-- CreateTable
CREATE TABLE "gold_price_feeds" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "announced_at" TIMESTAMP(3) NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bar_buy" BIGINT NOT NULL,
    "bar_sell" BIGINT NOT NULL,
    "ornament_buy" BIGINT NOT NULL,
    "ornament_sell" BIGINT NOT NULL,
    "raw" JSONB,

    CONSTRAINT "gold_price_feeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_price_announcements" (
    "id" TEXT NOT NULL,
    "announced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bar_buy" BIGINT NOT NULL,
    "bar_sell" BIGINT NOT NULL,
    "ornament_buy" BIGINT NOT NULL,
    "ornament_sell" BIGINT NOT NULL,
    "based_on_feed_id" TEXT,
    "announced_by" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "shop_price_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gold_price_feeds_announced_at_idx" ON "gold_price_feeds"("announced_at");

-- CreateIndex
CREATE UNIQUE INDEX "gold_price_feeds_source_announced_at_key" ON "gold_price_feeds"("source", "announced_at");

-- CreateIndex
CREATE INDEX "shop_price_announcements_announced_at_idx" ON "shop_price_announcements"("announced_at");

-- AddForeignKey
ALTER TABLE "shop_price_announcements" ADD CONSTRAINT "shop_price_announcements_based_on_feed_id_fkey" FOREIGN KEY ("based_on_feed_id") REFERENCES "gold_price_feeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
