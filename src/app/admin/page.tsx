import {
  getCurrentPermissions,
  requireSession,
} from "@/server/auth/current-session";

export const metadata = { title: "ภาพรวม — Gold Shop ERP" };

export default async function AdminOverviewPage() {
  const session = await requireSession();
  const permissions = await getCurrentPermissions();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">ภาพรวมระบบ</h1>
      <p>
        ยินดีต้อนรับ <strong>{session.user.displayName}</strong> (
        {session.user.username})
      </p>
      <section>
        <h2 className="mb-2 font-semibold">สิทธิ์ของคุณ</h2>
        {permissions.size === 0 ? (
          <p className="text-gray-500">ยังไม่ได้รับมอบหมายสิทธิ์</p>
        ) : (
          <ul className="list-inside list-disc text-sm text-gray-700">
            {[...permissions].sort().map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
