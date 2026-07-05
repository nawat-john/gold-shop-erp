"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "@/config/env";
import { prisma } from "@/server/db";
import { loginRateLimiter } from "@/server/rate-limit";
import { login } from "@/server/services/auth.service";
import {
  SESSION_COOKIE_NAME,
  hashSessionToken,
  revokeSession,
} from "@/server/services/session.service";

const loginSchema = z.object({
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้").max(100),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน").max(200),
  totpCode: z
    .string()
    .max(20)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export interface LoginFormState {
  error?: string;
  totpRequired?: boolean;
}

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    totpCode: formData.get("totpCode") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const headerStore = await headers();
  const result = await login(
    { db: prisma, rateLimiter: loginRateLimiter },
    {
      ...parsed.data,
      ip: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: headerStore.get("user-agent"),
      requestId: headerStore.get("x-request-id"),
    },
  );

  switch (result.status) {
    case "success": {
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, result.token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      // รหัสถูก reset โดย admin → บังคับไปตั้งรหัสใหม่ก่อน
      redirect(result.mustChangePassword ? "/admin/profile" : "/admin");
      break; // unreachable — redirect โยน exception
    }
    case "totp_required":
      return { totpRequired: true };
    case "locked":
      return {
        error: `บัญชีถูกล็อกชั่วคราว ลองใหม่หลัง ${result.lockedUntil.toLocaleTimeString("th-TH")}`,
      };
    case "rate_limited":
      return {
        error: `พยายามบ่อยเกินไป กรุณารอ ${Math.ceil(result.retryAfterMs / 60000)} นาที`,
      };
    case "invalid_credentials":
      return { error: "ชื่อผู้ใช้ รหัสผ่าน หรือรหัส 2FA ไม่ถูกต้อง" };
  }
  return {};
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const session = await prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      select: { id: true },
    });
    if (session) await revokeSession(prisma, session.id);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
