// ประกาศราคาหน้าร้าน — แถวล่าสุดคือราคาปัจจุบัน ห้ามแก้/ลบ (ประกาศใหม่ทับเท่านั้น)
// permission price.announce ตรวจที่ชั้น action; service ตรวจความสมเหตุสมผลของราคา
import type { Db } from "@/server/db";
import type { ShopPriceAnnouncement } from "@/generated/prisma/client";
import { writeAuditLog } from "./audit.service";
import { serializePrices } from "./price-feed.service";

export interface AnnouncePriceInput {
  barBuy: bigint;
  barSell: bigint;
  ornamentBuy: bigint;
  ornamentSell: bigint;
  basedOnFeedId?: string | null;
  note?: string | null;
  actorId: string;
  requestId?: string | null;
}

export async function announceShopPrice(
  db: Db,
  input: AnnouncePriceInput,
): Promise<ShopPriceAnnouncement> {
  const prices = [
    input.barBuy,
    input.barSell,
    input.ornamentBuy,
    input.ornamentSell,
  ];
  if (prices.some((p) => p <= 0n)) {
    throw new Error("ราคาทองต้องมากกว่า 0");
  }
  if (input.barBuy > input.barSell) {
    throw new Error("ราคารับซื้อแท่งต้องไม่สูงกว่าราคาขายออก");
  }
  if (input.ornamentBuy > input.ornamentSell) {
    throw new Error("ราคารับซื้อรูปพรรณต้องไม่สูงกว่าราคาขายออก");
  }

  const announcement = await db.shopPriceAnnouncement.create({
    data: {
      barBuy: input.barBuy,
      barSell: input.barSell,
      ornamentBuy: input.ornamentBuy,
      ornamentSell: input.ornamentSell,
      basedOnFeedId: input.basedOnFeedId ?? null,
      announcedBy: input.actorId,
      note: input.note ?? null,
    },
  });
  await writeAuditLog(db, {
    action: "price.announce",
    entityType: "shop_price_announcement",
    entityId: announcement.id,
    actorId: input.actorId,
    requestId: input.requestId,
    after: {
      ...serializePrices(input),
      basedOnFeedId: input.basedOnFeedId ?? null,
      note: input.note ?? null,
    },
  });
  return announcement;
}

export async function getCurrentAnnouncement(
  db: Db,
): Promise<ShopPriceAnnouncement | null> {
  return db.shopPriceAnnouncement.findFirst({
    orderBy: { announcedAt: "desc" },
  });
}

export async function listAnnouncementHistory(
  db: Db,
  take = 50,
): Promise<ShopPriceAnnouncement[]> {
  return db.shopPriceAnnouncement.findMany({
    orderBy: { announcedAt: "desc" },
    take,
  });
}
