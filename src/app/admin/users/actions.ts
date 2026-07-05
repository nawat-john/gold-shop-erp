"use server";

// ทุก action ทำตามลำดับบังคับ: session → permission → zod → transaction(mutation + audit)
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import { writeAuditLog } from "@/server/services/audit.service";
import {
  hashPassword,
  validatePasswordPolicy,
} from "@/server/security/password";
import { resetPassword } from "@/server/services/auth.service";
import { revokeAllUserSessions } from "@/server/services/session.service";

export interface UserFormState {
  error?: string;
  success?: string;
}

async function requestId(): Promise<string | null> {
  return (await headers()).get("x-request-id");
}

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "username อย่างน้อย 3 ตัว")
    .max(50)
    .regex(/^[a-z0-9_.-]+$/, "username ใช้ a-z, 0-9, _ . - เท่านั้น"),
  displayName: z.string().min(1, "กรุณากรอกชื่อที่แสดง").max(100),
  password: z.string().max(200),
  roleId: z.string().uuid("กรุณาเลือกบทบาท"),
  branchId: z.string().uuid("กรุณาเลือกสาขา"),
});

export async function createUserAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "user.manage");

  const parsed = createUserSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    password: formData.get("password"),
    roleId: formData.get("roleId"),
    branchId: formData.get("branchId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const policy = validatePasswordPolicy(parsed.data.password);
  if (!policy.ok) return { error: policy.reason };

  const existing = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });
  if (existing) return { error: "username นี้ถูกใช้แล้ว" };

  const passwordHash = await hashPassword(parsed.data.password);
  const rid = await requestId();

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username: parsed.data.username,
        displayName: parsed.data.displayName,
        passwordHash,
        mustChangePassword: true, // รหัสตั้งโดย admin — บังคับเปลี่ยนครั้งแรก
        userBranchRoles: {
          create: {
            branchId: parsed.data.branchId,
            roleId: parsed.data.roleId,
          },
        },
      },
    });
    await writeAuditLog(tx, {
      action: "user.create",
      entityType: "user",
      entityId: user.id,
      actorId: session.user.id,
      branchId: parsed.data.branchId,
      requestId: rid,
      after: {
        username: user.username,
        displayName: user.displayName,
        roleId: parsed.data.roleId,
      },
    });
  });

  revalidatePath("/admin/users");
  return { success: `สร้างผู้ใช้ ${parsed.data.username} แล้ว` };
}

export async function toggleUserActiveAction(
  formData: FormData,
): Promise<void> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "user.manage");

  const userId = z.string().uuid().parse(formData.get("userId"));
  if (userId === session.user.id) {
    throw new Error("ปิดใช้งานบัญชีตัวเองไม่ได้");
  }

  const rid = await requestId();
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const updated = await tx.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
    // ปิดใช้งาน = ตัด session ทั้งหมดทันที
    if (!updated.isActive) {
      await tx.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    await writeAuditLog(tx, {
      action: updated.isActive ? "user.activate" : "user.deactivate",
      entityType: "user",
      entityId: userId,
      actorId: session.user.id,
      requestId: rid,
      before: { isActive: user.isActive },
      after: { isActive: updated.isActive },
    });
  });

  revalidatePath("/admin/users");
}

const resetPasswordSchema = z.object({
  userId: z.string().uuid(),
  newPassword: z.string().max(200),
});

export async function resetUserPasswordAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "user.manage");

  const parsed = resetPasswordSchema.safeParse({
    userId: formData.get("userId"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return { error: "ข้อมูลไม่ถูกต้อง" };

  const policy = validatePasswordPolicy(parsed.data.newPassword);
  if (!policy.ok) return { error: policy.reason };

  await resetPassword(prisma, {
    userId: parsed.data.userId,
    newPassword: parsed.data.newPassword,
    actorId: session.user.id,
    requestId: await requestId(),
  });

  revalidatePath("/admin/users");
  return { success: "ตั้งรหัสผ่านชั่วคราวแล้ว — ผู้ใช้ต้องเปลี่ยนเมื่อ login" };
}

export async function revokeUserSessionsAction(
  formData: FormData,
): Promise<void> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "session.revoke");

  const userId = z.string().uuid().parse(formData.get("userId"));
  const count = await revokeAllUserSessions(prisma, userId);
  await writeAuditLog(prisma, {
    action: "session.revoke_all",
    entityType: "user",
    entityId: userId,
    actorId: session.user.id,
    requestId: await requestId(),
    after: { revokedCount: count },
  });

  revalidatePath("/admin/users");
}
