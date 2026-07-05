import Link from "next/link";
import {
  getCurrentPermissions,
  requireSession,
} from "@/server/auth/current-session";
import { logoutAction } from "@/app/login/actions";

const NAV_ITEMS: { href: string; label: string; permission?: string }[] = [
  { href: "/admin", label: "ภาพรวม" },
  { href: "/admin/users", label: "ผู้ใช้", permission: "user.view" },
  { href: "/admin/roles", label: "บทบาท", permission: "role.manage" },
  { href: "/admin/branches", label: "สาขา", permission: "branch.manage" },
  { href: "/admin/settings", label: "ตั้งค่า", permission: "settings.view" },
  { href: "/admin/audit", label: "Audit Log", permission: "audit.view" },
  { href: "/admin/profile", label: "โปรไฟล์" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const permissions = await getCurrentPermissions();

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.permission || permissions.has(item.permission),
  );

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col gap-1 border-r border-gray-200 p-4">
        <div className="mb-4">
          <p className="font-bold">Gold Shop ERP</p>
          <p className="text-sm text-gray-500">{session.user.displayName}</p>
        </div>
        {visibleNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded px-3 py-2 text-sm hover:bg-amber-50"
          >
            {item.label}
          </Link>
        ))}
        <form action={logoutAction} className="mt-auto">
          <button
            type="submit"
            className="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            ออกจากระบบ
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
