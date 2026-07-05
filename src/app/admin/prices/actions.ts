"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import { satangFromBahtString } from "@/server/domain/money";
import { announceShopPrice } from "@/server/services/price-announcement.service";
import { ingestManualQuote } from "@/server/services/price-feed.service";
import { fetchAndIngestGoldPrice } from "@/server/jobs/gold-price.job";
import { MockGoldPriceFeedSource } from "@/server/prices/feed-source";

export interface PriceFormState {
  error?: string;
  success?: string;
}

// ราคากรอกเป็น "บาท" (เช่น 51,250.00) — แปลงเป็นสตางค์ด้วย satangFromBahtString
const pricesSchema = z.object({
  barBuy: z.string().min(1, "กรุณากรอกราคารับซื้อทองแท่ง"),
  barSell: z.string().min(1, "กรุณากรอกราคาขายออกทองแท่ง"),
  ornamentBuy: z.string().min(1, "กรุณากรอกราคารับซื้อรูปพรรณ"),
  ornamentSell: z.string().min(1, "กรุณากรอกราคาขายออกรูปพรรณ"),
});

function parsePrices(formData: FormData) {
  const parsed = pricesSchema.safeParse({
    barBuy: formData.get("barBuy"),
    barSell: formData.get("barSell"),
    ornamentBuy: formData.get("ornamentBuy"),
    ornamentSell: formData.get("ornamentSell"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }
  return {
    barBuy: satangFromBahtString(parsed.data.barBuy),
    barSell: satangFromBahtString(parsed.data.barSell),
    ornamentBuy: satangFromBahtString(parsed.data.ornamentBuy),
    ornamentSell: satangFromBahtString(parsed.data.ornamentSell),
  };
}

export async function announcePriceAction(
  _prev: PriceFormState,
  formData: FormData,
): Promise<PriceFormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "price.announce");

  try {
    const prices = parsePrices(formData);
    const basedOnFeedId =
      (formData.get("basedOnFeedId") as string | null) || null;
    const note = (formData.get("note") as string | null) || null;

    await announceShopPrice(prisma, {
      ...prices,
      basedOnFeedId,
      note,
      actorId: session.user.id,
      requestId: (await headers()).get("x-request-id"),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" };
  }

  revalidatePath("/admin/prices");
  revalidatePath("/price-board");
  return { success: "ประกาศราคาแล้ว" };
}

export async function manualFeedAction(
  _prev: PriceFormState,
  formData: FormData,
): Promise<PriceFormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "price.announce");

  try {
    const prices = parsePrices(formData);
    await ingestManualQuote(prisma, {
      ...prices,
      actorId: session.user.id,
      requestId: (await headers()).get("x-request-id"),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" };
  }

  revalidatePath("/admin/prices");
  return { success: "บันทึกราคา feed (กรอกมือ) แล้ว" };
}

export async function fetchFeedNowAction(): Promise<void> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "price.announce");

  // dev ใช้ mock — production เปลี่ยน source ที่นี่จุดเดียว (และใน worker)
  await fetchAndIngestGoldPrice(prisma, new MockGoldPriceFeedSource());
  revalidatePath("/admin/prices");
}
