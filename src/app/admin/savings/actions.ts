"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import { satangFromBahtString } from "@/server/domain/money";
import { mgFromGramString } from "@/server/domain/gold";
import {
  openAccount,
  deposit,
  closeForGold,
  closeForCash,
  closeDefaulted,
} from "@/server/services/savings.service";
import {
  postLatestSavingsTransaction,
  postSafely,
} from "@/server/services/accounting.service";

async function requestId(): Promise<string | null> {
  return (await headers()).get("x-request-id");
}

export interface FormState {
  error?: string;
  success?: string;
}

const openAccountSchema = z.object({
  branchId: z.string().uuid("กรุณาเลือกสาขา"),
  customerId: z.string().uuid().optional().nullable(),
  accountType: z.enum(["CASH_SAVINGS", "WEIGHT_SAVINGS"]),
  targetWeightGramStr: z.string().optional().nullable(),
});

export async function openAccountAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "savings.open");

  const parsed = openAccountSchema.safeParse({
    branchId: formData.get("branchId"),
    customerId: formData.get("customerId") || null,
    accountType: formData.get("accountType"),
    targetWeightGramStr: formData.get("targetWeightGramStr") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const rid = await requestId();
    const targetWeightMg = parsed.data.targetWeightGramStr
      ? mgFromGramString(parsed.data.targetWeightGramStr)
      : null;
    const account = await prisma.$transaction(async (tx) =>
      openAccount(tx, {
        branchId: parsed.data.branchId,
        customerId: parsed.data.customerId,
        accountType: parsed.data.accountType,
        targetWeightMg,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    revalidatePath("/admin/savings");
    return { success: `เปิดบัญชีออมทอง ${account.docNo} เรียบร้อยแล้ว` };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const depositSchema = z.object({
  accountId: z.string().uuid(),
  amountBahtStr: z.string().min(1, "กรุณากรอกจำนวนเงินฝาก"),
});

export async function depositAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "savings.deposit");

  const parsed = depositSchema.safeParse({
    accountId: formData.get("accountId"),
    amountBahtStr: formData.get("amountBahtStr"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const amountSatang = satangFromBahtString(parsed.data.amountBahtStr);
    const rid = await requestId();
    await prisma.$transaction(async (tx) =>
      deposit(tx, {
        accountId: parsed.data.accountId,
        amountSatang,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    await postSafely(
      () =>
        postLatestSavingsTransaction(
          prisma,
          parsed.data.accountId,
          session.user.id,
        ),
      { module: "savings_transaction", accountId: parsed.data.accountId },
    );

    revalidatePath(`/admin/savings/${parsed.data.accountId}`);
    return { success: "รับฝากเงินเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const accountIdSchema = z.object({ accountId: z.string().uuid() });

export async function closeForGoldAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "savings.close");

  const parsed = accountIdSchema.safeParse({
    accountId: formData.get("accountId"),
  });
  if (!parsed.success) return { error: "ข้อมูลไม่ถูกต้อง" };

  try {
    const rid = await requestId();
    const result = await prisma.$transaction(async (tx) =>
      closeForGold(tx, {
        accountId: parsed.data.accountId,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    await postSafely(
      () =>
        postLatestSavingsTransaction(
          prisma,
          parsed.data.accountId,
          session.user.id,
        ),
      { module: "savings_transaction", accountId: parsed.data.accountId },
    );

    revalidatePath(`/admin/savings/${parsed.data.accountId}`);
    revalidatePath("/admin/savings");
    return {
      success: `ปิดบัญชีรับทองเรียบร้อยแล้ว (${result.entitledWeightMg.toString()} มก.)`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function closeForCashAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "savings.close");

  const parsed = accountIdSchema.safeParse({
    accountId: formData.get("accountId"),
  });
  if (!parsed.success) return { error: "ข้อมูลไม่ถูกต้อง" };

  try {
    const rid = await requestId();
    const result = await prisma.$transaction(async (tx) =>
      closeForCash(tx, {
        accountId: parsed.data.accountId,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    await postSafely(
      () =>
        postLatestSavingsTransaction(
          prisma,
          parsed.data.accountId,
          session.user.id,
        ),
      { module: "savings_transaction", accountId: parsed.data.accountId },
    );

    revalidatePath(`/admin/savings/${parsed.data.accountId}`);
    revalidatePath("/admin/savings");
    return {
      success: `ปิดบัญชีคืนเงินเรียบร้อยแล้ว (${result.refundSatang.toString()} สตางค์)`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const closeDefaultedSchema = z.object({
  accountId: z.string().uuid(),
  reason: z.string().min(1, "กรุณาระบุเหตุผล"),
  approverUsername: z.string().min(1, "กรุณาระบุ username ผู้อนุมัติ"),
  pin: z.string().min(1, "กรุณากรอกรหัส PIN"),
});

export async function closeDefaultedAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "savings.cancel");

  const parsed = closeDefaultedSchema.safeParse({
    accountId: formData.get("accountId"),
    reason: formData.get("reason"),
    approverUsername: formData.get("approverUsername"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const rid = await requestId();
    await prisma.$transaction(async (tx) =>
      closeDefaulted(tx, {
        accountId: parsed.data.accountId,
        reason: parsed.data.reason,
        approverUsername: parsed.data.approverUsername,
        pin: parsed.data.pin,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    await postSafely(
      () =>
        postLatestSavingsTransaction(
          prisma,
          parsed.data.accountId,
          session.user.id,
        ),
      { module: "savings_transaction", accountId: parsed.data.accountId },
    );

    revalidatePath(`/admin/savings/${parsed.data.accountId}`);
    revalidatePath("/admin/savings");
    return { success: "ปิดบัญชีกรณีผิดนัดเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}
