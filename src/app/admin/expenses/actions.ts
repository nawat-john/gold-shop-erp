"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import { satangFromBahtString } from "@/server/domain/money";
import { recordExpense } from "@/server/services/expense.service";
import type { AccountCode } from "@/server/domain/chart-of-accounts";

async function requestId(): Promise<string | null> {
  return (await headers()).get("x-request-id");
}

export interface FormState {
  error?: string;
  success?: string;
}

const recordExpenseSchema = z.object({
  branchId: z.string().uuid("กรุณาเลือกสาขา"),
  expenseAccountCode: z.string().min(1, "กรุณาเลือกบัญชีค่าใช้จ่าย"),
  amountBahtStr: z.string().min(1, "กรุณากรอกจำนวนเงิน"),
  description: z.string().min(1, "กรุณาระบุรายละเอียด"),
  expenseDateStr: z.string().min(1, "กรุณาระบุวันที่"),
});

export async function recordExpenseAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "expense.manage");

  const parsed = recordExpenseSchema.safeParse({
    branchId: formData.get("branchId"),
    expenseAccountCode: formData.get("expenseAccountCode"),
    amountBahtStr: formData.get("amountBahtStr"),
    description: formData.get("description"),
    expenseDateStr: formData.get("expenseDateStr"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const amountSatang = satangFromBahtString(parsed.data.amountBahtStr);
    const rid = await requestId();
    const expense = await prisma.$transaction(async (tx) =>
      recordExpense(tx, {
        branchId: parsed.data.branchId,
        expenseAccountCode: parsed.data.expenseAccountCode as AccountCode,
        amountSatang,
        description: parsed.data.description,
        expenseDate: new Date(parsed.data.expenseDateStr),
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    revalidatePath("/admin/expenses");
    return { success: `บันทึกค่าใช้จ่าย ${expense.docNo} เรียบร้อยแล้ว` };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}
