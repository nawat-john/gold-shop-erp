"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import { satangFromBahtString } from "@/server/domain/money";
import {
  createCashTransfer,
  sendCashTransfer,
  receiveCashTransfer,
  cancelCashTransfer,
} from "@/server/services/cash-transfer.service";

async function requestId(): Promise<string | null> {
  return (await headers()).get("x-request-id");
}

export interface FormState {
  error?: string;
  success?: string;
}

const createCashTransferSchema = z.object({
  fromBranchId: z.string().uuid("กรุณาเลือกสาขาต้นทาง"),
  toBranchId: z.string().uuid("กรุณาเลือกสาขาปลายทาง"),
  fromDrawerId: z.string().optional().nullable(),
  toDrawerId: z.string().optional().nullable(),
  amountBahtStr: z.string().min(1, "กรุณากรอกจำนวนเงิน"),
  note: z.string().optional().nullable(),
});

export async function createCashTransferAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const parsed = createCashTransferSchema.safeParse({
    fromBranchId: formData.get("fromBranchId"),
    toBranchId: formData.get("toBranchId"),
    fromDrawerId: formData.get("fromDrawerId"),
    toDrawerId: formData.get("toDrawerId"),
    amountBahtStr: formData.get("amountBahtStr"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  await requirePermission(
    prisma,
    session.user.id,
    "cash.transfer",
    parsed.data.fromBranchId,
  );

  try {
    const amountSatang = satangFromBahtString(parsed.data.amountBahtStr);
    const rid = await requestId();
    const transfer = await prisma.$transaction(async (tx) =>
      createCashTransfer(tx, {
        fromBranchId: parsed.data.fromBranchId,
        toBranchId: parsed.data.toBranchId,
        fromDrawerId: parsed.data.fromDrawerId || null,
        toDrawerId: parsed.data.toDrawerId || null,
        amountSatang,
        note: parsed.data.note,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    revalidatePath("/admin/cash-transfers");
    return { success: `สร้างใบโอนเงินสด ${transfer.docNo} เรียบร้อยแล้ว` };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function sendCashTransferAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const transferId = formData.get("transferId") as string;
  const approverUsername = formData.get("approverUsername") as string;
  const pin = formData.get("pin") as string;
  if (!transferId || !approverUsername || !pin) {
    return { error: "ข้อมูลไม่ครบถ้วนสำหรับการอนุมัติ" };
  }

  const transfer = await prisma.cashTransfer.findUniqueOrThrow({
    where: { id: transferId },
  });
  await requirePermission(
    prisma,
    session.user.id,
    "cash.transfer",
    transfer.fromBranchId,
  );

  try {
    const rid = await requestId();
    await prisma.$transaction(async (tx) =>
      sendCashTransfer(tx, {
        transferId,
        approverUsername,
        pin,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    revalidatePath("/admin/cash-transfers");
    return { success: "ยืนยันการส่งเงินเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function receiveCashTransferAction(
  transferId: string,
): Promise<void> {
  const session = await requireSession();

  const transfer = await prisma.cashTransfer.findUniqueOrThrow({
    where: { id: transferId },
  });
  await requirePermission(
    prisma,
    session.user.id,
    "cash.transfer",
    transfer.toBranchId,
  );

  const rid = await requestId();
  await prisma.$transaction(async (tx) =>
    receiveCashTransfer(tx, {
      transferId,
      actorId: session.user.id,
      requestId: rid,
    }),
  );
  revalidatePath("/admin/cash-transfers");
}

export async function cancelCashTransferAction(
  transferId: string,
): Promise<void> {
  const session = await requireSession();

  const transfer = await prisma.cashTransfer.findUniqueOrThrow({
    where: { id: transferId },
  });
  await requirePermission(
    prisma,
    session.user.id,
    "cash.transfer",
    transfer.fromBranchId,
  );

  const rid = await requestId();
  await prisma.$transaction(async (tx) =>
    cancelCashTransfer(tx, {
      transferId,
      actorId: session.user.id,
      requestId: rid,
    }),
  );
  revalidatePath("/admin/cash-transfers");
}
