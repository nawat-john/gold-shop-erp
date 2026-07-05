"use client";

import { useActionState } from "react";
import { createBranchAction, type BranchFormState } from "./actions";

export function CreateBranchForm() {
  const [state, formAction, pending] = useActionState<
    BranchFormState,
    FormData
  >(createBranchAction, {});

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-col gap-3 rounded border border-gray-200 p-4"
    >
      <h2 className="font-semibold">เพิ่มสาขาใหม่</h2>
      <input
        name="code"
        placeholder="รหัสสาขา เช่น BKK01"
        required
        className="rounded border border-gray-300 px-3 py-2 text-sm uppercase"
      />
      <input
        name="name"
        placeholder="ชื่อสาขา"
        required
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        name="address"
        placeholder="ที่อยู่ (ไม่บังคับ)"
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
        {pending ? "กำลังสร้าง..." : "สร้างสาขา"}
      </button>
    </form>
  );
}
