"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import { writeAuditLog } from "@/server/services/audit.service";

export interface BranchFormState {
  error?: string;
  success?: string;
}

const branchSchema = z.object({
  code: z
    .string()
    .min(2, "รหัสสาขาอย่างน้อย 2 ตัว")
    .max(10)
    .regex(
      /^[A-Z0-9]+$/,
      "รหัสสาขาใช้ A-Z, 0-9 เท่านั้น (ใช้ประกอบเลขที่เอกสาร)",
    ),
  name: z.string().min(1, "กรุณากรอกชื่อสาขา").max(100),
  address: z.string().max(500).optional(),
});

export async function createBranchAction(
  _prev: BranchFormState,
  formData: FormData,
): Promise<BranchFormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "branch.manage");

  const parsed = branchSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    address: formData.get("address") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const existing = await prisma.branch.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) return { error: "รหัสสาขานี้ถูกใช้แล้ว" };

  const rid = (await headers()).get("x-request-id");
  await prisma.$transaction(async (tx) => {
    const branch = await tx.branch.create({ data: parsed.data });
    await writeAuditLog(tx, {
      action: "branch.create",
      entityType: "branch",
      entityId: branch.id,
      actorId: session.user.id,
      branchId: branch.id,
      requestId: rid,
      after: parsed.data,
    });
  });

  revalidatePath("/admin/branches");
  return { success: `สร้างสาขา ${parsed.data.code} แล้ว` };
}

export async function toggleBranchActiveAction(
  formData: FormData,
): Promise<void> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "branch.manage");

  const branchId = z.string().uuid().parse(formData.get("branchId"));
  const rid = (await headers()).get("x-request-id");

  await prisma.$transaction(async (tx) => {
    const branch = await tx.branch.findUniqueOrThrow({
      where: { id: branchId },
    });
    const updated = await tx.branch.update({
      where: { id: branchId },
      data: { isActive: !branch.isActive },
    });
    await writeAuditLog(tx, {
      action: updated.isActive ? "branch.activate" : "branch.deactivate",
      entityType: "branch",
      entityId: branchId,
      actorId: session.user.id,
      branchId,
      requestId: rid,
      before: { isActive: branch.isActive },
      after: { isActive: updated.isActive },
    });
  });

  revalidatePath("/admin/branches");
}
