"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth/current-session";
import { requirePermission } from "@/server/services/rbac.service";
import { writeAuditLog } from "@/server/services/audit.service";

export interface SettingFormState {
  error?: string;
  success?: string;
}

const settingSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9_.]+$/, "key ใช้ a-z, 0-9, _ . เท่านั้น"),
  value: z.string().max(5000),
  description: z.string().max(500).optional(),
});

export async function upsertSettingAction(
  _prev: SettingFormState,
  formData: FormData,
): Promise<SettingFormState> {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "settings.manage");

  const parsed = settingSchema.safeParse({
    key: formData.get("key"),
    value: formData.get("value"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  // ค่าเก็บเป็น JSON — พยายาม parse ก่อน ถ้าไม่ใช่ JSON เก็บเป็น string
  let value: unknown;
  try {
    value = JSON.parse(parsed.data.value);
  } catch {
    value = parsed.data.value;
  }

  const rid = (await headers()).get("x-request-id");
  await prisma.$transaction(async (tx) => {
    const before = await tx.setting.findUnique({
      where: { key: parsed.data.key },
    });
    await tx.setting.upsert({
      where: { key: parsed.data.key },
      update: {
        value: value as object,
        description: parsed.data.description,
        updatedBy: session.user.id,
      },
      create: {
        key: parsed.data.key,
        value: value as object,
        description: parsed.data.description,
        updatedBy: session.user.id,
      },
    });
    await writeAuditLog(tx, {
      action: before ? "settings.update" : "settings.create",
      entityType: "setting",
      entityId: parsed.data.key,
      actorId: session.user.id,
      requestId: rid,
      before: before ? { value: before.value as object } : null,
      after: { value: value as object },
    });
  });

  revalidatePath("/admin/settings");
  return { success: `บันทึก ${parsed.data.key} แล้ว` };
}
