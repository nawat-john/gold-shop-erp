import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import {
  hasPermission,
  requirePermission,
} from "@/server/services/rbac.service";
import { SettingForm } from "./setting-form";

export const metadata = { title: "ตั้งค่า — Gold Shop ERP" };

export default async function SettingsPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "settings.view");
  const canManage = await hasPermission(
    prisma,
    session.user.id,
    "settings.manage",
  );

  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">การตั้งค่าระบบ</h1>

      {settings.length === 0 ? (
        <p className="text-gray-500">ยังไม่มีการตั้งค่า</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2 pr-4">key</th>
                <th className="py-2 pr-4">ค่า</th>
                <th className="py-2">คำอธิบาย</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.key} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-mono">{s.key}</td>
                  <td className="py-2 pr-4 font-mono text-xs">
                    {JSON.stringify(s.value)}
                  </td>
                  <td className="py-2 text-gray-600">{s.description ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canManage && <SettingForm />}
    </div>
  );
}
