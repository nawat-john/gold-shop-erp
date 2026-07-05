// Shift & Cash Drawer Service — ระบบควบคุมกะพนักงานและตรวจสอบลิ้นชักเงินสด
// กติกา: ยอดเงินสดในกะต้องกระทบยอดได้ตรงกับปริมาณยอดรับชำระเงินสดจริงตอนปิดบิล

import type { Db } from "@/server/db";
import { ShiftStatus } from "@/generated/prisma/client";

interface OpenShiftParams {
  branchId: string;
  drawerId: string;
  openedById: string;
  startCashSatang: bigint;
}

interface CloseShiftParams {
  shiftId: string;
  closedById: string;
  endCashSatang: bigint;
}

/**
 * เปิดกะพนักงานขาย
 */
export async function openShift(
  db: Db,
  { branchId, drawerId, openedById, startCashSatang }: OpenShiftParams,
) {
  // ตรวจสอบว่าลิ้นชักนี้มีกะที่ยังเปิดค้างอยู่หรือไม่
  const activeDrawerShift = await db.shift.findFirst({
    where: {
      drawerId,
      status: ShiftStatus.OPEN,
    },
  });
  if (activeDrawerShift) {
    throw new Error("ลิ้นชักเงินสดนี้มีกะที่ยังเปิดใช้งานค้างอยู่");
  }

  // ตรวจสอบว่าพนักงานคนนี้เปิดกะอื่นค้างไว้ที่สาขานี้หรือไม่
  const activeUserShift = await db.shift.findFirst({
    where: {
      openedById,
      status: ShiftStatus.OPEN,
    },
  });
  if (activeUserShift) {
    throw new Error("พนักงานคนนี้มีกะที่กำลังทำงานค้างอยู่ กรุณาปิดกะเดิมก่อน");
  }

  // ดึงลิ้นชักเพื่อตรวจสอบว่าอยู่ในสาขาจริง
  const drawer = await db.cashDrawer.findFirst({
    where: { id: drawerId, branchId, isActive: true },
  });
  if (!drawer) {
    throw new Error("ไม่พบคลิ้นชักเงินสดหรือลิ้นชักไม่ได้อยู่ในสาขานี้");
  }

  return await db.shift.create({
    data: {
      branchId,
      drawerId,
      openedById,
      startCashSatang,
      status: ShiftStatus.OPEN,
    },
  });
}

/**
 * ปิดกะพนักงานขาย และกระทบยอดเงินสดในลิ้นชัก
 */
export async function closeShift(
  db: Db,
  { shiftId, closedById, endCashSatang }: CloseShiftParams,
) {
  const shift = await db.shift.findUnique({
    where: { id: shiftId },
    include: { drawer: true },
  });

  if (!shift) {
    throw new Error("ไม่พบข้อมูลกะการทำงาน");
  }
  if (shift.status !== ShiftStatus.OPEN) {
    throw new Error("กะการทำงานนี้ไม่ได้อยู่ในสถานะเปิด (OPEN)");
  }

  // คำนวณยอดเงินสดคาดหมาย (Expected Cash) จากธุรกรรมต่างๆ ในกะนี้
  // 1) ยอดเงินสดขายออก (Sales Order Payments)
  const salesPayments = await db.payment.aggregate({
    _sum: {
      amountSatang: true,
    },
    where: {
      paymentMethod: "CASH",
      salesOrder: {
        shiftId,
        status: { in: ["COMPLETED"] }, // ไม่คิดบิลที่ถูก Void
      },
    },
  });

  // 2) ยอดเงินสดรับซื้อคืน (Purchase Order Payments) — เป็นลบ เพราะจ่ายเงินออกไปจากลิ้นชัก
  const purchasePayments = await db.payment.aggregate({
    _sum: {
      amountSatang: true,
    },
    where: {
      paymentMethod: "CASH",
      purchaseOrder: {
        shiftId,
        status: { in: ["COMPLETED"] },
      },
    },
  });

  // 3) ยอดเงินสดจากรายการ Trade-In
  const tradeInPayments = await db.payment.aggregate({
    _sum: {
      amountSatang: true,
    },
    where: {
      paymentMethod: "CASH",
      tradeIn: {
        salesOrder: {
          shiftId,
          status: { in: ["COMPLETED"] },
        },
      },
    },
  });

  const cashIn = salesPayments._sum.amountSatang ?? 0n;
  const cashOut = purchasePayments._sum.amountSatang ?? 0n;
  const tradeInCash = tradeInPayments._sum.amountSatang ?? 0n;

  const expectedCashSatang =
    shift.startCashSatang + cashIn - cashOut + tradeInCash;

  return await db.shift.update({
    where: { id: shiftId },
    data: {
      closedById,
      closedAt: new Date(),
      endCashSatang,
      expectedCashSatang,
      status: ShiftStatus.CLOSED,
    },
  });
}

/**
 * ผู้จัดการร้านตรวจสอบอนุมัติกระทบยอดเงินปิดกะ (Reconciliation)
 */
export async function reconcileShift(
  db: Db,
  { shiftId, reconciledById }: { shiftId: string; reconciledById: string },
) {
  const shift = await db.shift.findUnique({
    where: { id: shiftId },
  });

  if (!shift) {
    throw new Error("ไม่พบข้อมูลกะการทำงาน");
  }
  if (shift.status !== ShiftStatus.CLOSED) {
    throw new Error(
      "กะการทำงานนี้ต้องปิดกะ (CLOSED) ก่อนจึงจะอนุมัติกระทบยอดได้",
    );
  }

  return await db.shift.update({
    where: { id: shiftId },
    data: {
      reconciledById,
      reconciledAt: new Date(),
      status: ShiftStatus.RECONCILED,
    },
  });
}
