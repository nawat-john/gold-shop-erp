// AMLO Service — ตรวจธุรกรรมเข้าเกณฑ์เพดานเงินสด บังคับ KYC และเทียบทะเบียนเฝ้าระวัง
// กติกา: ธุรกรรมเกินเพดาน (settings) ต้องมี customerId (ลูกค้าลงทะเบียน KYC แล้ว) มิฉะนั้นห้ามทำต่อ
import type { Db } from "@/server/db";
import { AmloAlertStatus, type AmloRefType } from "@/generated/prisma/client";
import { hmacHash } from "@/server/security/crypto";
import { isAboveAmloThreshold } from "@/server/domain/amlo";
import { writeAuditLog } from "./audit.service";
import { SETTING_KEYS, getNumberSetting } from "./settings.service";

async function getAmloThresholdSatang(db: Db): Promise<bigint> {
  const value = await getNumberSetting(
    db,
    SETTING_KEYS.amloCashThresholdSatang,
    200_000_000, // 2,000,000 บาท
  );
  return BigInt(Math.round(value));
}

/**
 * ตรวจล่วงหน้าว่าธุรกรรมนี้จะเข้าเกณฑ์ AMLO หรือไม่ (ไม่สร้างอะไรลง DB)
 * ใช้ตัดสินใจว่าต้องลงทะเบียนลูกค้า (KYC) ก่อนสร้างเอกสารธุรกรรมหรือเปล่า
 */
export async function isTransactionAboveAmloThreshold(
  db: Db,
  amountSatang: bigint,
): Promise<boolean> {
  const threshold = await getAmloThresholdSatang(db);
  return isAboveAmloThreshold(amountSatang, threshold);
}

export interface EvaluateAmloTriggerParams {
  customerId?: string | null;
  amountSatang: bigint;
  refType: AmloRefType;
  refId: string;
  actorId: string;
  requestId?: string | null;
}

export interface AmloTriggerResult {
  triggered: boolean;
  alertId?: string;
  watchlistMatch: boolean;
}

/**
 * ตรวจธุรกรรมเข้าเกณฑ์ AMLO หรือไม่ — ถ้าเข้าเกณฑ์ต้องมี customerId (บังคับ KYC) มิฉะนั้น throw
 * เมื่อมี customerId แล้วจะเทียบทะเบียนเฝ้าระวังและสร้างแจ้งเตือนให้เจ้าหน้าที่ตรวจทาน (ไม่บล็อกธุรกรรม)
 */
export async function evaluateAmloTrigger(
  db: Db,
  params: EvaluateAmloTriggerParams,
): Promise<AmloTriggerResult> {
  const threshold = await getAmloThresholdSatang(db);
  if (!isAboveAmloThreshold(params.amountSatang, threshold)) {
    return { triggered: false, watchlistMatch: false };
  }

  if (!params.customerId) {
    throw new Error(
      `ธุรกรรมมูลค่าเกินเพดาน AMLO (${threshold} สตางค์) ต้องลงทะเบียนข้อมูลลูกค้า (KYC) ก่อนทำรายการ`,
    );
  }

  const customer = await db.customer.findUniqueOrThrow({
    where: { id: params.customerId },
  });

  let watchlistMatch = false;
  if (customer.citizenIdHash) {
    const hit = await db.amloWatchlistEntry.findUnique({
      where: { citizenIdHash: customer.citizenIdHash },
    });
    watchlistMatch = !!hit;
  }

  const alert = await db.amloAlert.create({
    data: {
      customerId: params.customerId,
      refType: params.refType,
      refId: params.refId,
      amountSatang: params.amountSatang,
      watchlistMatch,
      status: AmloAlertStatus.PENDING,
    },
  });

  await writeAuditLog(db, {
    action: "amlo.alert_created",
    entityType: "amlo_alert",
    entityId: alert.id,
    actorId: params.actorId,
    requestId: params.requestId,
    after: {
      refType: params.refType,
      refId: params.refId,
      amountSatang: params.amountSatang.toString(),
      watchlistMatch,
    },
  });

  return { triggered: true, alertId: alert.id, watchlistMatch };
}

/** เจ้าหน้าที่ตรวจทานแจ้งเตือน (PENDING -> REVIEWED) */
export async function reviewAlert(
  db: Db,
  params: { alertId: string; actorId: string; note?: string | null },
) {
  const alert = await db.amloAlert.findUniqueOrThrow({
    where: { id: params.alertId },
  });
  if (alert.status !== AmloAlertStatus.PENDING) {
    throw new Error(
      `แจ้งเตือนนี้ไม่ได้อยู่ในสถานะ PENDING (สถานะปัจจุบัน: ${alert.status})`,
    );
  }

  const updated = await db.amloAlert.update({
    where: { id: params.alertId },
    data: {
      status: AmloAlertStatus.REVIEWED,
      reviewedById: params.actorId,
      reviewedAt: new Date(),
      note: params.note ?? alert.note,
    },
  });

  await writeAuditLog(db, {
    action: "amlo.alert_reviewed",
    entityType: "amlo_alert",
    entityId: params.alertId,
    actorId: params.actorId,
  });

  return updated;
}

/** ยืนยันว่าได้ส่งรายงานให้ AMLO แล้ว (REVIEWED -> REPORTED) */
export async function markAlertReported(
  db: Db,
  params: { alertId: string; actorId: string },
) {
  const alert = await db.amloAlert.findUniqueOrThrow({
    where: { id: params.alertId },
  });
  if (alert.status !== AmloAlertStatus.REVIEWED) {
    throw new Error(
      `ต้องตรวจทาน (REVIEWED) ก่อนจึงจะบันทึกว่าส่งรายงานแล้วได้`,
    );
  }

  const updated = await db.amloAlert.update({
    where: { id: params.alertId },
    data: { status: AmloAlertStatus.REPORTED, reportedAt: new Date() },
  });

  await writeAuditLog(db, {
    action: "amlo.alert_reported",
    entityType: "amlo_alert",
    entityId: params.alertId,
    actorId: params.actorId,
  });

  return updated;
}

export interface AddWatchlistEntryParams {
  citizenId: string;
  name: string;
  reason: string;
  actorId: string;
}

/** เพิ่มรายชื่อเฝ้าระวัง — เก็บเฉพาะ HMAC hash ของเลขบัตร ไม่เก็บ plaintext */
export async function addWatchlistEntry(
  db: Db,
  params: AddWatchlistEntryParams,
) {
  const citizenIdHash = hmacHash(params.citizenId);
  const existing = await db.amloWatchlistEntry.findUnique({
    where: { citizenIdHash },
  });
  if (existing) {
    throw new Error("เลขบัตร ปชช. นี้อยู่ในทะเบียนเฝ้าระวังอยู่แล้ว");
  }

  const entry = await db.amloWatchlistEntry.create({
    data: {
      citizenIdHash,
      name: params.name,
      reason: params.reason,
      addedBy: params.actorId,
    },
  });

  await writeAuditLog(db, {
    action: "amlo.watchlist_add",
    entityType: "amlo_watchlist_entry",
    entityId: entry.id,
    actorId: params.actorId,
  });

  return entry;
}

/** เอกสาร CSV รายการแจ้งเตือน AMLO ในช่วงวันที่ที่กำหนด — ใช้ export ให้เจ้าหน้าที่ปฏิบัติตามกฎหมาย */
export async function exportAlertsCsv(
  db: Db,
  params: { fromDate: Date; toDate: Date },
): Promise<string> {
  const alerts = await db.amloAlert.findMany({
    where: { createdAt: { gte: params.fromDate, lte: params.toDate } },
    include: { customer: true },
    orderBy: { createdAt: "asc" },
  });

  const header =
    "created_at,ref_type,ref_id,customer_code,customer_name,amount_satang,watchlist_match,status";
  const rows = alerts.map((a) =>
    [
      a.createdAt.toISOString(),
      a.refType,
      a.refId,
      a.customer?.code ?? "",
      (a.customer?.name ?? "").replace(/,/g, " "),
      a.amountSatang.toString(),
      a.watchlistMatch,
      a.status,
    ].join(","),
  );

  return [header, ...rows].join("\n");
}
