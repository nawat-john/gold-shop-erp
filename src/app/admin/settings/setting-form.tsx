"use client";

import { useActionState } from "react";
import { upsertSettingAction, type SettingFormState } from "./actions";

export function SettingForm() {
  const [state, formAction, pending] = useActionState<
    SettingFormState,
    FormData
  >(upsertSettingAction, {});

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-col gap-3 rounded border border-gray-200 p-4"
    >
      <h2 className="font-semibold">เพิ่ม/แก้ไขการตั้งค่า</h2>
      <input
        name="key"
        placeholder="key เช่น pawn.default_interest_rate"
        required
        className="rounded border border-gray-300 px-3 py-2 font-mono text-sm"
      />
      <textarea
        name="value"
        placeholder='ค่า (JSON หรือข้อความ) เช่น 1.25 หรือ {"th": "ค่า"}'
        required
        rows={3}
        className="rounded border border-gray-300 px-3 py-2 font-mono text-sm"
      />
      <input
        name="description"
        placeholder="คำอธิบาย (ไม่บังคับ)"
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
        {pending ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </form>
  );
}
