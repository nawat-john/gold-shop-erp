import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";

export const metadata = { title: "Audit Log — Gold Shop ERP" };

export default async function AuditPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "audit.view");

  const logs = await prisma.auditLog.findMany({
    orderBy: { id: "desc" },
    take: 200,
  });

  // แสดง username แทน id — ดึงชุดเดียว
  const actorIds = [
    ...new Set(logs.flatMap((l) => (l.actorId ? [l.actorId] : []))),
  ];
  const actors = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, username: true },
  });
  const actorName = new Map(actors.map((a) => [a.id, a.username]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-gray-500">
          200 รายการล่าสุด — ตารางนี้ append-only แก้ไข/ลบไม่ได้แม้แต่ DB admin
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-2 pr-4">เวลา</th>
              <th className="py-2 pr-4">ผู้กระทำ</th>
              <th className="py-2 pr-4">action</th>
              <th className="py-2 pr-4">entity</th>
              <th className="py-2">รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id.toString()} className="border-b border-gray-100">
                <td className="py-2 pr-4 whitespace-nowrap text-xs">
                  {log.createdAt.toLocaleString("th-TH")}
                </td>
                <td className="py-2 pr-4 font-mono text-xs">
                  {log.actorId
                    ? (actorName.get(log.actorId) ?? log.actorId)
                    : "ระบบ"}
                </td>
                <td className="py-2 pr-4 font-mono text-xs">{log.action}</td>
                <td className="py-2 pr-4 font-mono text-xs">
                  {log.entityType}
                  {log.entityId ? `:${log.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="py-2 font-mono text-xs text-gray-600">
                  {log.after ? JSON.stringify(log.after).slice(0, 120) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
