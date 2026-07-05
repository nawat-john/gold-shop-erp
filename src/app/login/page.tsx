import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/auth/current-session";
import { LoginForm } from "./login-form";

export const metadata = { title: "เข้าสู่ระบบ — Gold Shop ERP" };

export default async function LoginPage() {
  const session = await getCurrentSession();
  if (session) redirect("/admin");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Gold Shop ERP</h1>
      <LoginForm />
    </main>
  );
}
