// Backfill Journal Entries — โพสต์ธุรกรรมเก่าที่เกิดก่อนเปิดใช้งานบัญชีคู่ (Phase 7) ย้อนหลัง
// กติกา: idempotent เต็มรูปแบบ (postJournalEntry เช็ค refType+refId เดิมอยู่แล้ว) รันซ้ำได้เสมอ
// ธุรกรรมที่ตกอยู่ในงวดบัญชีที่ถูกปิด (LOCKED) ไปแล้วจะโพสต์ไม่ได้โดยเจตนา — ต้องเปิดงวดชั่วคราวก่อน
import type { Db } from "@/server/db";
import {
  postSalesOrder,
  postVoidSalesOrder,
  postPurchaseOrder,
  postVoidPurchaseOrder,
  postTradeIn,
  postVoidTradeIn,
  postPawnEvent,
  postSavingsTransaction,
  postWorkOrderEvent,
} from "./accounting.service";

export interface BackfillFailure {
  refType: string;
  refId: string;
  error: string;
}

export interface BackfillResult {
  postedCount: number;
  failures: BackfillFailure[];
}

async function tryPost(
  result: BackfillResult,
  refType: string,
  refId: string,
  fn: () => Promise<unknown>,
): Promise<void> {
  try {
    const entry = await fn();
    if (entry) result.postedCount += 1;
  } catch (err) {
    result.failures.push({
      refType,
      refId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * โพสต์ธุรกรรมย้อนหลังทั้งหมดจาก Phase 4-6 ที่ยังไม่เคยลง journal — เรียกซ้ำได้ปลอดภัยเสมอ
 * (รายการที่โพสต์ไปแล้วจะถูกข้ามอัตโนมัติผ่านกลไก idempotent ของ postJournalEntry)
 */
export async function backfillJournalEntries(
  db: Db,
  actorId: string,
): Promise<BackfillResult> {
  const result: BackfillResult = { postedCount: 0, failures: [] };

  const salesOrders = await db.salesOrder.findMany({
    select: { id: true, status: true },
  });
  for (const order of salesOrders) {
    await tryPost(result, "sales_order", order.id, () =>
      postSalesOrder(db, order.id, actorId),
    );
    if (order.status === "VOIDED") {
      await tryPost(result, "sales_order_void", order.id, () =>
        postVoidSalesOrder(db, order.id, actorId),
      );
    }
  }

  const purchaseOrders = await db.purchaseOrder.findMany({
    select: { id: true, status: true },
  });
  for (const order of purchaseOrders) {
    await tryPost(result, "purchase_order", order.id, () =>
      postPurchaseOrder(db, order.id, actorId),
    );
    if (order.status === "VOIDED") {
      await tryPost(result, "purchase_order_void", order.id, () =>
        postVoidPurchaseOrder(db, order.id, actorId),
      );
    }
  }

  const tradeIns = await db.tradeIn.findMany({
    select: { id: true, salesOrder: { select: { status: true } } },
  });
  for (const tradeIn of tradeIns) {
    await tryPost(result, "trade_in", tradeIn.id, () =>
      postTradeIn(db, tradeIn.id, actorId),
    );
    if (tradeIn.salesOrder.status === "VOIDED") {
      await tryPost(result, "trade_in_void", tradeIn.id, () =>
        postVoidTradeIn(db, tradeIn.id, actorId),
      );
    }
  }

  const pawnEvents = await db.pawnEvent.findMany({
    select: { id: true },
    orderBy: { id: "asc" },
  });
  for (const event of pawnEvents) {
    await tryPost(result, "pawn_event", event.id.toString(), () =>
      postPawnEvent(db, event.id, actorId),
    );
  }

  const savingsTransactions = await db.savingsTransaction.findMany({
    select: { id: true },
    orderBy: { id: "asc" },
  });
  for (const tx of savingsTransactions) {
    await tryPost(result, "savings_transaction", tx.id.toString(), () =>
      postSavingsTransaction(db, tx.id, actorId),
    );
  }

  const workOrderEvents = await db.workOrderEvent.findMany({
    select: { id: true },
    orderBy: { id: "asc" },
  });
  for (const event of workOrderEvents) {
    await tryPost(result, "work_order_event", event.id.toString(), () =>
      postWorkOrderEvent(db, event.id, actorId),
    );
  }

  return result;
}
