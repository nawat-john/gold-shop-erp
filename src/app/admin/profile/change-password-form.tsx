"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "./actions";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<
    ChangePasswordState,
    FormData
  >(changePasswordAction, {});

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-col gap-3 rounded border border-gray-200 p-4"
    >
      <h2 className="font-semibold">เปลี่ยนรหัสผ่าน</h2>
      <input
        name="currentPassword"
        type="password"
        placeholder="รหัสผ่านปัจจุบัน"
        autoComplete="current-password"
        required
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        name="newPassword"
        type="password"
        placeholder="รหัสผ่านใหม่ (≥ 12 ตัวอักษร)"
        autoComplete="new-password"
        required
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-green-700">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
      </button>
    </form>
  );
}
