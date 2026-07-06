import Link from "next/link";
import { requireSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/services/rbac.service";
import { NewCustomerForm } from "./new-customer-form";

export const metadata = { title: "ลงทะเบียนลูกค้าใหม่ — Gold Shop ERP" };

export default async function NewCustomerPage() {
  const session = await requireSession();
  await requirePermission(prisma, session.user.id, "customer.manage");

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ลงทะเบียนลูกค้าใหม่</h1>
        <Link
          href="/admin/customers"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          กลับหน้ารายการ
        </Link>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <NewCustomerForm />
      </div>
    </div>
  );
}
