"use client";

import { useActionState } from "react";
import { createUserAction, type UserFormState } from "./actions";

interface Option {
  id: string;
  label: string;
}

export function CreateUserForm({
  roles,
  branches,
}: {
  roles: Option[];
  branches: Option[];
}) {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(
    createUserAction,
    {},
  );

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-col gap-3 rounded border border-gray-200 p-4"
    >
      <h2 className="font-semibold">เพิ่มผู้ใช้ใหม่</h2>

      <input
        name="username"
        placeholder="username (a-z, 0-9)"
        required
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        name="displayName"
        placeholder="ชื่อที่แสดง"
        required
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        name="password"
        type="password"
        placeholder="รหัสผ่านชั่วคราว (≥ 12 ตัว)"
        required
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <select
        name="roleId"
        required
        defaultValue=""
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="" disabled>
          — เลือกบทบาท —
        </option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      <select
        name="branchId"
        required
        defaultValue=""
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="" disabled>
          — เลือกสาขา —
        </option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label}
          </option>
        ))}
      </select>

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
        {pending ? "กำลังสร้าง..." : "สร้างผู้ใช้"}
      </button>
    </form>
  );
}
