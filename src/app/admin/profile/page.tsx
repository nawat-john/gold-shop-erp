import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { ChangePasswordForm } from "./change-password-form";
import { TotpSection } from "./totp-section";

export const metadata = { title: "โปรไฟล์ — Gold Shop ERP" };

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { totpEnabled: true, mustChangePassword: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">โปรไฟล์และความปลอดภัย</h1>

      {user.mustChangePassword && (
        <div
          role="alert"
          className="rounded border border-amber-400 bg-amber-50 p-4 text-sm"
        >
          รหัสผ่านของคุณถูกตั้งโดยผู้ดูแลระบบ —
          กรุณาเปลี่ยนรหัสผ่านใหม่ก่อนใช้งานต่อ
        </div>
      )}

      <ChangePasswordForm />
      <TotpSection enabled={user.totpEnabled} />
    </div>
  );
}
