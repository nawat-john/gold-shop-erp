// อ่าน session ปัจจุบันจาก cookie — ใช้ใน server component / server action เท่านั้น
// cache() = ตรวจครั้งเดียวต่อ request แม้ถูกเรียกหลายจุด
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import {
  SESSION_COOKIE_NAME,
  validateSession,
} from "@/server/services/session.service";
import { getUserPermissions } from "@/server/services/rbac.service";

export interface CurrentSession {
  sessionId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    mustChangePassword: boolean;
  };
}

export const getCurrentSession = cache(
  async (): Promise<CurrentSession | null> => {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const result = await validateSession(prisma, token);
    if (!result.ok) return null;

    return { sessionId: result.session.id, user: result.user };
  },
);

/** ใช้หัวทุกหน้า/action ที่ต้อง login — ไม่มี session = เด้งไปหน้า login */
export async function requireSession(): Promise<CurrentSession> {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  return session;
}

/** permission ทั้งหมดของผู้ใช้ปัจจุบัน (ใช้แสดง/ซ่อนเมนู) */
export const getCurrentPermissions = cache(
  async (): Promise<ReadonlySet<string>> => {
    const session = await getCurrentSession();
    if (!session) return new Set();
    return getUserPermissions(prisma, session.user.id);
  },
);
