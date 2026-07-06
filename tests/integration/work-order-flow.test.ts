// Integration Test: ใบสั่งงานช่าง (สั่งทำ) และงานซ่อม (Phase 6)
// ครอบคลุม: สั่งทำเบิกทองช่างหลายครั้ง, งานซ่อมไม่มีการเบิกทอง, ยกเลิกจากสถานะที่อนุญาต,
// การกันทำ transition ผิดสถานะ, คิวงาน, concurrency งานเสร็จซ้ำสำเร็จครั้งเดียว
// รันด้วย: pnpm test:integration tests/integration/work-order-flow.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import { WorkOrderStatus, WorkOrderType } from "@/generated/prisma/client";
import {
  createWorkOrder,
  issueGoldToCraftsman,
  startWork,
  completeWorkOrder,
  deliverWorkOrder,
  cancelWorkOrder,
  getQueue,
} from "@/server/services/work-order.service";
import { seedRbac } from "@/server/services/rbac-seed";

let db: TestDb;
let branchId: string;
let cashierId: string;

beforeAll(async () => {
  db = await startTestDb();
  await seedRbac(db.prisma);

  const branch = await db.prisma.branch.create({
    data: { code: "WO01", name: "สาขาทดสอบงานช่าง" },
  });
  branchId = branch.id;

  const cashier = await db.prisma.user.create({
    data: {
      username: "wo-cashier",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานรับงานช่าง",
    },
  });
  cashierId = cashier.id;
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

describe("Work Order Lifecycle", () => {
  it("1. สั่งทำ (CUSTOM_ORDER): รับงาน -> เบิกทองช่าง 2 ครั้งสะสม -> เสร็จ -> ส่งมอบ", async () => {
    const wo = await createWorkOrder(db.prisma, {
      branchId,
      type: WorkOrderType.CUSTOM_ORDER,
      description: "สั่งทำแหวนทองลายมังกร 1 บาท",
      depositSatang: 500_000n,
      toleranceMg: 100n,
      actorId: cashierId,
    });
    expect(wo.status).toBe(WorkOrderStatus.RECEIVED);

    const afterFirstIssue = await issueGoldToCraftsman(db.prisma, {
      workOrderId: wo.id,
      weightMg: 10_000n,
      actorId: cashierId,
    });
    expect(afterFirstIssue.status).toBe(WorkOrderStatus.IN_PROGRESS);
    expect(afterFirstIssue.goldIssuedMg).toBe(10_000n);

    const afterSecondIssue = await issueGoldToCraftsman(db.prisma, {
      workOrderId: wo.id,
      weightMg: 5_160n,
      actorId: cashierId,
    });
    expect(afterSecondIssue.goldIssuedMg).toBe(15_160n);

    const completed = await completeWorkOrder(db.prisma, {
      workOrderId: wo.id,
      actorId: cashierId,
    });
    expect(completed.status).toBe(WorkOrderStatus.COMPLETED);
    expect(completed.completedAt).not.toBeNull();

    const delivered = await deliverWorkOrder(db.prisma, {
      workOrderId: wo.id,
      actorId: cashierId,
    });
    expect(delivered.status).toBe(WorkOrderStatus.DELIVERED);
    expect(delivered.deliveredAt).not.toBeNull();

    const events = await db.prisma.workOrderEvent.findMany({
      where: { workOrderId: wo.id },
      orderBy: { createdAt: "asc" },
    });
    expect(events.map((e) => e.eventType)).toEqual([
      "RECEIVE",
      "GOLD_ISSUE",
      "GOLD_ISSUE",
      "COMPLETE",
      "DELIVER",
    ]);
  });

  it("2. ซ่อม (REPAIR): รับงาน -> เริ่มงาน (ไม่มีการเบิกทอง) -> เสร็จ -> ส่งมอบ", async () => {
    const wo = await createWorkOrder(db.prisma, {
      branchId,
      type: WorkOrderType.REPAIR,
      description: "ซ่อมสร้อยคอขาด",
      serviceFeeSatang: 20_000n,
      actorId: cashierId,
    });

    const started = await startWork(db.prisma, {
      workOrderId: wo.id,
      actorId: cashierId,
    });
    expect(started.status).toBe(WorkOrderStatus.IN_PROGRESS);

    await completeWorkOrder(db.prisma, {
      workOrderId: wo.id,
      actorId: cashierId,
    });
    const delivered = await deliverWorkOrder(db.prisma, {
      workOrderId: wo.id,
      actorId: cashierId,
    });
    expect(delivered.status).toBe(WorkOrderStatus.DELIVERED);
  });

  it("3. ห้ามเบิกทองช่างกับงานซ่อม (REPAIR)", async () => {
    const wo = await createWorkOrder(db.prisma, {
      branchId,
      type: WorkOrderType.REPAIR,
      description: "ซ่อมต่างหูหลุด",
      actorId: cashierId,
    });

    await expect(
      issueGoldToCraftsman(db.prisma, {
        workOrderId: wo.id,
        weightMg: 1_000n,
        actorId: cashierId,
      }),
    ).rejects.toThrow("เบิกทองช่างได้เฉพาะงานสั่งทำ");
  });

  it("4. ห้าม transition ผิดสถานะ (เสร็จงานทั้งที่ยัง RECEIVED, ส่งมอบทั้งที่ยังไม่เสร็จ)", async () => {
    const wo = await createWorkOrder(db.prisma, {
      branchId,
      type: WorkOrderType.REPAIR,
      description: "ซ่อมกำไลข้อมือ",
      actorId: cashierId,
    });

    await expect(
      completeWorkOrder(db.prisma, { workOrderId: wo.id, actorId: cashierId }),
    ).rejects.toThrow("ต้องอยู่ในสถานะ IN_PROGRESS");

    await startWork(db.prisma, { workOrderId: wo.id, actorId: cashierId });
    await expect(
      deliverWorkOrder(db.prisma, { workOrderId: wo.id, actorId: cashierId }),
    ).rejects.toThrow("ต้องอยู่ในสถานะ COMPLETED");
  });

  it("5. ยกเลิกได้จาก RECEIVED และ IN_PROGRESS แต่ยกเลิกจาก COMPLETED ไม่ได้", async () => {
    const woReceived = await createWorkOrder(db.prisma, {
      branchId,
      type: WorkOrderType.REPAIR,
      description: "ยกเลิกจาก RECEIVED",
      actorId: cashierId,
    });
    const cancelled1 = await cancelWorkOrder(db.prisma, {
      workOrderId: woReceived.id,
      reason: "ลูกค้าเปลี่ยนใจ",
      actorId: cashierId,
    });
    expect(cancelled1.status).toBe(WorkOrderStatus.CANCELLED);

    const woInProgress = await createWorkOrder(db.prisma, {
      branchId,
      type: WorkOrderType.REPAIR,
      description: "ยกเลิกจาก IN_PROGRESS",
      actorId: cashierId,
    });
    await startWork(db.prisma, {
      workOrderId: woInProgress.id,
      actorId: cashierId,
    });
    const cancelled2 = await cancelWorkOrder(db.prisma, {
      workOrderId: woInProgress.id,
      reason: "ของหายาก งดทำ",
      actorId: cashierId,
    });
    expect(cancelled2.status).toBe(WorkOrderStatus.CANCELLED);

    const woCompleted = await createWorkOrder(db.prisma, {
      branchId,
      type: WorkOrderType.REPAIR,
      description: "ยกเลิกจาก COMPLETED ไม่ได้",
      actorId: cashierId,
    });
    await startWork(db.prisma, {
      workOrderId: woCompleted.id,
      actorId: cashierId,
    });
    await completeWorkOrder(db.prisma, {
      workOrderId: woCompleted.id,
      actorId: cashierId,
    });
    await expect(
      cancelWorkOrder(db.prisma, {
        workOrderId: woCompleted.id,
        reason: "ลองยกเลิกหลังเสร็จ",
        actorId: cashierId,
      }),
    ).rejects.toThrow("ไม่สามารถยกเลิก");
  });

  it("6. คิวงานแสดงเฉพาะ RECEIVED/IN_PROGRESS ไม่รวมที่เสร็จ/ยกเลิกแล้ว", async () => {
    const queue = await getQueue(db.prisma, { branchId });
    const statuses = new Set(queue.map((w) => w.status));
    expect(statuses.has(WorkOrderStatus.COMPLETED)).toBe(false);
    expect(statuses.has(WorkOrderStatus.DELIVERED)).toBe(false);
    expect(statuses.has(WorkOrderStatus.CANCELLED)).toBe(false);
  });

  it("7. งานเสร็จพร้อมกัน 2 คำขอบนใบสั่งงานเดียวกัน -> สำเร็จครั้งเดียว (concurrency)", async () => {
    const wo = await createWorkOrder(db.prisma, {
      branchId,
      type: WorkOrderType.REPAIR,
      description: "ทดสอบ concurrency งานซ่อม",
      actorId: cashierId,
    });
    await startWork(db.prisma, { workOrderId: wo.id, actorId: cashierId });

    const results = await Promise.allSettled([
      db.prisma.$transaction(async (tx) =>
        completeWorkOrder(tx, { workOrderId: wo.id, actorId: cashierId }),
      ),
      db.prisma.$transaction(async (tx) =>
        completeWorkOrder(tx, { workOrderId: wo.id, actorId: cashierId }),
      ),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
  }, 30_000);
});
