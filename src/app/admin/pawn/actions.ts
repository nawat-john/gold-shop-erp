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
  openContract,
  renewInterest,
  redeemContract,
  forfeitContract,
  adjustPrincipal,
  cancelContract,
} from "@/server/services/pawn.service";

async function requestId(): Promise<string | null> {
  return (await headers()).get("x-request-id");
}

export interface FormState {
  error?: string;
  success?: string;
}

const openContractSchema = z.object({
  branchId: z.string().uuid("กรุณาเลือกสาขา"),
  customerName: z.string().min(1, "กรุณาระบุชื่อลูกค้า"),
  customerPhone: z.string().optional().nullable(),
  customerCitizenId: z.string().optional().nullable(),
  description: z.string().min(1, "กรุณาระบุรายละเอียดทรัพย์"),
  weightGramStr: z.string().min(1, "กรุณากรอกน้ำหนักกรัม"),
  goldPurity: z.coerce
    .number()
    .min(0.01)
    .max(100, "ความบริสุทธิ์ต้องไม่เกิน 100%"),
  locationId: z.string().uuid().optional().nullable(),
  principalBahtStr: z.string().min(1, "กรุณากรอกวงเงินขายฝาก"),
  annualInterestRatePercent: z.coerce.number().min(0, "อัตราดอกเบี้ยห้ามติดลบ"),
  termMonths: z.coerce
    .number()
    .int()
    .min(1, "ระยะเวลาสัญญาต้องมากกว่า 0 เดือน"),
});

export async function openContractAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "pawn.open");

  const parsed = openContractSchema.safeParse({
    branchId: formData.get("branchId"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone") || null,
    customerCitizenId: formData.get("customerCitizenId") || null,
    description: formData.get("description"),
    weightGramStr: formData.get("weightGramStr"),
    goldPurity: formData.get("goldPurity"),
    locationId: formData.get("locationId") || null,
    principalBahtStr: formData.get("principalBahtStr"),
    annualInterestRatePercent: formData.get("annualInterestRatePercent"),
    termMonths: formData.get("termMonths"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const weightMg = mgFromGramString(parsed.data.weightGramStr);
    const principalSatang = satangFromBahtString(parsed.data.principalBahtStr);
    const rid = await requestId();

    const contract = await prisma.$transaction(async (tx) => {
      return openContract(tx, {
        branchId: parsed.data.branchId,
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        customerCitizenId: parsed.data.customerCitizenId,
        description: parsed.data.description,
        weightMg,
        goldPurity: parsed.data.goldPurity,
        locationId: parsed.data.locationId,
        principalSatang,
        annualInterestRatePercent: parsed.data.annualInterestRatePercent,
        termMonths: parsed.data.termMonths,
        actorId: session.user.id,
        requestId: rid,
      });
    });

    revalidatePath("/admin/pawn");
    return { success: `เปิดสัญญาขายฝาก ${contract.docNo} เรียบร้อยแล้ว` };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const contractIdSchema = z.object({
  contractId: z.string().uuid("รหัสสัญญาไม่ถูกต้อง"),
});

export async function renewInterestAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "pawn.renew");

  const parsed = contractIdSchema.safeParse({
    contractId: formData.get("contractId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const rid = await requestId();
    const result = await prisma.$transaction(async (tx) => {
      return renewInterest(tx, {
        contractId: parsed.data.contractId,
        actorId: session.user.id,
        requestId: rid,
      });
    });

    revalidatePath("/admin/pawn");
    revalidatePath(`/admin/pawn/${parsed.data.contractId}`);
    return {
      success: `รับชำระดอกเบี้ย ${result.interestPaidSatang.toString()} สตางค์ และต่อสัญญาสำเร็จ`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

export async function redeemContractAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "pawn.redeem");

  const parsed = contractIdSchema.safeParse({
    contractId: formData.get("contractId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const rid = await requestId();
    const result = await prisma.$transaction(async (tx) => {
      return redeemContract(tx, {
        contractId: parsed.data.contractId,
        actorId: session.user.id,
        requestId: rid,
      });
    });

    revalidatePath("/admin/pawn");
    revalidatePath(`/admin/pawn/${parsed.data.contractId}`);
    return {
      success: `ไถ่ถอนสำเร็จ ยอดชำระรวม ${result.totalPayableSatang.toString()} สตางค์`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const adjustPrincipalSchema = z.object({
  contractId: z.string().uuid("รหัสสัญญาไม่ถูกต้อง"),
  deltaBahtStr: z.string().min(1, "กรุณากรอกจำนวนเงินที่ปรับ"),
  note: z.string().optional().nullable(),
});

export async function adjustPrincipalAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "pawn.adjust_principal");

  const parsed = adjustPrincipalSchema.safeParse({
    contractId: formData.get("contractId"),
    deltaBahtStr: formData.get("deltaBahtStr"),
    note: formData.get("note") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const deltaSatang = satangFromBahtString(parsed.data.deltaBahtStr);
    const rid = await requestId();
    await prisma.$transaction(async (tx) => {
      return adjustPrincipal(tx, {
        contractId: parsed.data.contractId,
        deltaSatang,
        note: parsed.data.note,
        actorId: session.user.id,
        requestId: rid,
      });
    });

    revalidatePath("/admin/pawn");
    revalidatePath(`/admin/pawn/${parsed.data.contractId}`);
    return { success: "ปรับเงินต้นสัญญาสำเร็จ" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const approvalSchema = z.object({
  contractId: z.string().uuid("รหัสสัญญาไม่ถูกต้อง"),
  approverUsername: z.string().min(1, "กรุณาระบุ username ผู้อนุมัติ"),
  pin: z.string().min(1, "กรุณากรอกรหัส PIN"),
});

export async function forfeitContractAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "pawn.forfeit");

  const parsed = approvalSchema.safeParse({
    contractId: formData.get("contractId"),
    approverUsername: formData.get("approverUsername"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const rid = await requestId();
    await prisma.$transaction(async (tx) => {
      return forfeitContract(tx, {
        contractId: parsed.data.contractId,
        approverUsername: parsed.data.approverUsername,
        pin: parsed.data.pin,
        actorId: session.user.id,
        requestId: rid,
      });
    });

    revalidatePath("/admin/pawn");
    revalidatePath(`/admin/pawn/${parsed.data.contractId}`);
    revalidatePath("/admin/inventory");
    return { success: "อนุมัติทองหลุดและโอนเข้าสต๊อกเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const cancelSchema = approvalSchema.extend({
  reason: z.string().min(1, "กรุณาระบุเหตุผลการยกเลิก"),
});

export async function cancelContractAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "pawn.cancel");

  const parsed = cancelSchema.safeParse({
    contractId: formData.get("contractId"),
    approverUsername: formData.get("approverUsername"),
    pin: formData.get("pin"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const rid = await requestId();
    await prisma.$transaction(async (tx) => {
      return cancelContract(tx, {
        contractId: parsed.data.contractId,
        reason: parsed.data.reason,
        approverUsername: parsed.data.approverUsername,
        pin: parsed.data.pin,
        actorId: session.user.id,
        requestId: rid,
      });
    });

    revalidatePath("/admin/pawn");
    revalidatePath(`/admin/pawn/${parsed.data.contractId}`);
    return { success: "ยกเลิกสัญญาสำเร็จ" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}
