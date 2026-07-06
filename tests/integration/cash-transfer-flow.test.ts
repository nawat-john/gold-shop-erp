// Integration Test: โอนเงินสดข้ามสาขาแบบ 2-Step (Phase 8)
// ครอบคลุม: สร้าง -> ส่ง (step-up PIN) -> รับ, ยกเลิกจาก DRAFT, ยกเลิกจาก IN_TRANSIT (คืนสถานะ),
// ปฏิเสธ transition ผิดสถานะ, บังคับ maker-checker คนละคน, บังคับสิทธิ์ตามสาขาจริง
// รันด้วย: pnpm test:integration tests/integration/cash-transfer-flow.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import { TransferStatus } from "@/generated/prisma/client";
import {
  createCashTransfer,
  sendCashTransfer,
  receiveCashTransfer,
  cancelCashTransfer,
} from "@/server/services/cash-transfer.service";
import { setApprovalPin } from "@/server/services/approval.service";
import {
  requirePermission,
  ForbiddenError,
} from "@/server/services/rbac.service";
import { seedRbac } from "@/server/services/rbac-seed";

let db: TestDb;
let branchAId: string;
let branchBId: string;
let drawerAId: string;
let drawerBId: string;
let managerAId: string; // BRANCH_MANAGER ที่สาขา A — ผู้สร้าง/ผู้ทำรายการ (maker)
const ownerApproverUsername = "cash-owner-approver";
let ownerApproverId: string; // OWNER ที่ถูกมอบหมายเฉพาะสาขา A — ผู้อนุมัติ (checker)
let managerBId: string; // BRANCH_MANAGER ที่สาขา B — รับเงินปลายทาง

beforeAll(async () => {
  db = await startTestDb();
  await seedRbac(db.prisma);

  const branchA = await db.prisma.branch.create({
    data: { code: "CTFA", name: "สาขาทดสอบโอนเงิน A" },
  });
  branchAId = branchA.id;
  const branchB = await db.prisma.branch.create({
    data: { code: "CTFB", name: "สาขาทดสอบโอนเงิน B" },
  });
  branchBId = branchB.id;

  const drawerA = await db.prisma.cashDrawer.create({
    data: { branchId: branchAId, code: "DRAWER-A", name: "ลิ้นชัก A" },
  });
  drawerAId = drawerA.id;
  const drawerB = await db.prisma.cashDrawer.create({
    data: { branchId: branchBId, code: "DRAWER-B", name: "ลิ้นชัก B" },
  });
  drawerBId = drawerB.id;

  const roleManager = await db.prisma.role.findUniqueOrThrow({
    where: { code: "BRANCH_MANAGER" },
  });
  const roleOwner = await db.prisma.role.findUniqueOrThrow({
    where: { code: "OWNER" },
  });

  const managerA = await db.prisma.user.create({
    data: {
      username: "cash-manager-a",
      passwordHash: "$argon2id$dummy",
      displayName: "ผู้จัดการสาขา A",
      userBranchRoles: {
        create: { branchId: branchAId, roleId: roleManager.id },
      },
    },
  });
  managerAId = managerA.id;

  // OWNER แต่ถูกมอบหมายเฉพาะสาขา A เท่านั้น (ทดสอบว่า branch-scope check บังคับจริง ไม่ใช่แค่ role name)
  const ownerApprover = await db.prisma.user.create({
    data: {
      username: ownerApproverUsername,
      passwordHash: "$argon2id$dummy",
      displayName: "เจ้าของร้าน (ผู้อนุมัติ)",
      userBranchRoles: {
        create: { branchId: branchAId, roleId: roleOwner.id },
      },
    },
  });
  ownerApproverId = ownerApprover.id;
  await setApprovalPin(db.prisma, {
    userId: ownerApproverId,
    pin: "991234",
    actorId: ownerApproverId,
  });

  const managerB = await db.prisma.user.create({
    data: {
      username: "cash-manager-b",
      passwordHash: "$argon2id$dummy",
      displayName: "ผู้จัดการสาขา B",
      userBranchRoles: {
        create: { branchId: branchBId, roleId: roleManager.id },
      },
    },
  });
  managerBId = managerB.id;
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

describe("Cash Transfer — 2-Step confirm ระหว่างสาขา", () => {
  it("1. สร้าง -> ส่ง (ต้อง PIN คนละคน) -> รับ สำเร็จตามลำดับ", async () => {
    const transfer = await db.prisma.$transaction((tx) =>
      createCashTransfer(tx, {
        fromBranchId: branchAId,
        toBranchId: branchBId,
        fromDrawerId: drawerAId,
        toDrawerId: drawerBId,
        amountSatang: 500_000n,
        actorId: managerAId,
      }),
    );
    expect(transfer.status).toBe(TransferStatus.DRAFT);
    expect(transfer.docNo).toMatch(/^CTF-/);

    const sent = await db.prisma.$transaction((tx) =>
      sendCashTransfer(tx, {
        transferId: transfer.id,
        approverUsername: ownerApproverUsername,
        pin: "991234",
        actorId: managerAId,
      }),
    );
    expect(sent.status).toBe(TransferStatus.IN_TRANSIT);
    expect(sent.sentBy).toBe(managerAId);

    const received = await db.prisma.$transaction((tx) =>
      receiveCashTransfer(tx, { transferId: transfer.id, actorId: managerBId }),
    );
    expect(received.status).toBe(TransferStatus.COMPLETED);
    expect(received.receivedBy).toBe(managerBId);
  });

  it("2. sendCashTransfer ปฏิเสธถ้าผู้อนุมัติเป็นคนเดียวกับผู้ทำรายการ (Maker-Checker)", async () => {
    const transfer = await db.prisma.$transaction((tx) =>
      createCashTransfer(tx, {
        fromBranchId: branchAId,
        toBranchId: branchBId,
        amountSatang: 100_000n,
        actorId: managerAId,
      }),
    );

    await setApprovalPin(db.prisma, {
      userId: managerAId,
      pin: "881111",
      actorId: managerAId,
    });

    await expect(
      db.prisma.$transaction((tx) =>
        sendCashTransfer(tx, {
          transferId: transfer.id,
          approverUsername: "cash-manager-a", // เป็นคนเดียวกับ actorId
          pin: "881111",
          actorId: managerAId,
        }),
      ),
    ).rejects.toThrow("การอนุมัติส่งเงินไม่ผ่าน");

    const stillDraft = await db.prisma.cashTransfer.findUniqueOrThrow({
      where: { id: transfer.id },
    });
    expect(stillDraft.status).toBe(TransferStatus.DRAFT);
  });

  it("3. ยกเลิกจาก DRAFT สำเร็จ", async () => {
    const transfer = await db.prisma.$transaction((tx) =>
      createCashTransfer(tx, {
        fromBranchId: branchAId,
        toBranchId: branchBId,
        amountSatang: 50_000n,
        actorId: managerAId,
      }),
    );
    const cancelled = await db.prisma.$transaction((tx) =>
      cancelCashTransfer(tx, { transferId: transfer.id, actorId: managerAId }),
    );
    expect(cancelled.status).toBe(TransferStatus.CANCELLED);
  });

  it("4. ยกเลิกจาก IN_TRANSIT สำเร็จ (เงินยังไม่ถึงปลายทาง)", async () => {
    const transfer = await db.prisma.$transaction((tx) =>
      createCashTransfer(tx, {
        fromBranchId: branchAId,
        toBranchId: branchBId,
        amountSatang: 75_000n,
        actorId: managerAId,
      }),
    );
    await db.prisma.$transaction((tx) =>
      sendCashTransfer(tx, {
        transferId: transfer.id,
        approverUsername: ownerApproverUsername,
        pin: "991234",
        actorId: managerAId,
      }),
    );
    const cancelled = await db.prisma.$transaction((tx) =>
      cancelCashTransfer(tx, { transferId: transfer.id, actorId: managerAId }),
    );
    expect(cancelled.status).toBe(TransferStatus.CANCELLED);
  });

  it("5. transition ผิดสถานะถูกปฏิเสธ (รับเงินจาก DRAFT โดยตรง, ส่งเงินซ้ำจาก COMPLETED)", async () => {
    const transfer = await db.prisma.$transaction((tx) =>
      createCashTransfer(tx, {
        fromBranchId: branchAId,
        toBranchId: branchBId,
        amountSatang: 60_000n,
        actorId: managerAId,
      }),
    );

    await expect(
      db.prisma.$transaction((tx) =>
        receiveCashTransfer(tx, {
          transferId: transfer.id,
          actorId: managerBId,
        }),
      ),
    ).rejects.toThrow("ไม่สามารถรับเงินได้จากสถานะ");

    await db.prisma.$transaction((tx) =>
      sendCashTransfer(tx, {
        transferId: transfer.id,
        approverUsername: ownerApproverUsername,
        pin: "991234",
        actorId: managerAId,
      }),
    );
    await db.prisma.$transaction((tx) =>
      receiveCashTransfer(tx, { transferId: transfer.id, actorId: managerBId }),
    );

    await expect(
      db.prisma.$transaction((tx) =>
        sendCashTransfer(tx, {
          transferId: transfer.id,
          approverUsername: ownerApproverUsername,
          pin: "991234",
          actorId: managerAId,
        }),
      ),
    ).rejects.toThrow("ไม่สามารถยืนยันการส่งเงินได้จากสถานะ");
  });

  it("6. บังคับสิทธิ์ตามสาขาจริง: OWNER ที่ไม่ได้ถูกมอบหมายสาขา B ต้องไม่มีสิทธิ์ cash.transfer ที่สาขา B", async () => {
    // ownerApprover ถูกมอบหมายเฉพาะสาขา A — ต้องไม่ผ่านการเช็คสิทธิ์ที่สาขา B
    await expect(
      requirePermission(db.prisma, ownerApproverId, "cash.transfer", branchBId),
    ).rejects.toThrow(ForbiddenError);

    // แต่ที่สาขา A ต้องผ่าน เพราะถูกมอบหมายจริง
    await expect(
      requirePermission(db.prisma, ownerApproverId, "cash.transfer", branchAId),
    ).resolves.toBeUndefined();
  });

  it("7. amountSatang ต้องมากกว่า 0 และห้ามโอนสาขาเดียวกัน", async () => {
    await expect(
      db.prisma.$transaction((tx) =>
        createCashTransfer(tx, {
          fromBranchId: branchAId,
          toBranchId: branchBId,
          amountSatang: 0n,
          actorId: managerAId,
        }),
      ),
    ).rejects.toThrow("จำนวนเงินโอนต้องมากกว่า 0");

    await expect(
      db.prisma.$transaction((tx) =>
        createCashTransfer(tx, {
          fromBranchId: branchAId,
          toBranchId: branchAId,
          amountSatang: 1_000n,
          actorId: managerAId,
        }),
      ),
    ).rejects.toThrow("สาขาต้นทางและปลายทางห้ามเป็นสาขาเดียวกัน");
  });
});
