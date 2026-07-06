"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import {
  createCustomer,
  updateCustomer,
  setConsent,
  anonymizeCustomer,
} from "@/server/services/customer.service";
import { MockCustomerIdCardReader } from "@/server/hardware/id-card-reader";

async function requestId(): Promise<string | null> {
  return (await headers()).get("x-request-id");
}

export interface FormState {
  error?: string;
  success?: string;
}

const createCustomerSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อลูกค้า"),
  phone: z.string().optional().nullable(),
  citizenId: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export async function createCustomerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "customer.manage");

  const parsed = createCustomerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || null,
    citizenId: formData.get("citizenId") || null,
    address: formData.get("address") || null,
    note: formData.get("note") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const customer = await prisma.$transaction(async (tx) =>
      createCustomer(tx, { ...parsed.data, actorId: session.user.id }),
    );
    revalidatePath("/admin/customers");
    return { success: `ลงทะเบียนลูกค้า ${customer.code} เรียบร้อยแล้ว` };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const updateCustomerSchema = z.object({
  customerId: z.string().uuid(),
  name: z.string().min(1, "กรุณาระบุชื่อลูกค้า"),
  phone: z.string().optional().nullable(),
  citizenId: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export async function updateCustomerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "customer.manage");

  const parsed = updateCustomerSchema.safeParse({
    customerId: formData.get("customerId"),
    name: formData.get("name"),
    phone: formData.get("phone") || null,
    citizenId: formData.get("citizenId") || undefined,
    address: formData.get("address") || null,
    note: formData.get("note") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    await prisma.$transaction(async (tx) =>
      updateCustomer(tx, { ...parsed.data, actorId: session.user.id }),
    );
    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${parsed.data.customerId}`);
    return { success: "บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const consentSchema = z.object({
  customerId: z.string().uuid(),
  given: z.enum(["true", "false"]),
});

export async function setConsentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "customer.manage");

  const parsed = consentSchema.safeParse({
    customerId: formData.get("customerId"),
    given: formData.get("given"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    await setConsent(prisma, {
      customerId: parsed.data.customerId,
      given: parsed.data.given === "true",
      actorId: session.user.id,
    });
    revalidatePath(`/admin/customers/${parsed.data.customerId}`);
    return { success: "บันทึกความยินยอมเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

const anonymizeSchema = z.object({
  customerId: z.string().uuid(),
  approverUsername: z.string().min(1, "กรุณาระบุ username ผู้อนุมัติ"),
  pin: z.string().min(1, "กรุณากรอกรหัส PIN"),
});

export async function anonymizeCustomerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "customer.anonymize");

  const parsed = anonymizeSchema.safeParse({
    customerId: formData.get("customerId"),
    approverUsername: formData.get("approverUsername"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const rid = await requestId();
    await prisma.$transaction(async (tx) =>
      anonymizeCustomer(tx, {
        customerId: parsed.data.customerId,
        approverUsername: parsed.data.approverUsername,
        pin: parsed.data.pin,
        actorId: session.user.id,
        requestId: rid,
      }),
    );
    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${parsed.data.customerId}`);
    return { success: "ล้างข้อมูลส่วนตัวลูกค้าเรียบร้อยแล้ว" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการทำรายการ";
    return { error: message };
  }
}

/** อ่านบัตรประชาชน (จำลอง — mock hardware) เพื่อ prefill ฟอร์มลงทะเบียนลูกค้า */
export async function readIdCardAction() {
  await requireSession();
  const reader = new MockCustomerIdCardReader();
  return reader.read();
}
