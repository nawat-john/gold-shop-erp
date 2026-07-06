"use client";

import { useActionState } from "react";
import { createWorkOrderAction } from "./actions";

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

export function NewWorkOrderForm({ branches }: { branches: BranchOption[] }) {
  const [state, action, isPending] = useActionState(createWorkOrderAction, {});

  return (
    <form action={action} className="flex flex-col gap-3">
      {state.error && (
        <div
          role="alert"
          className="rounded bg-red-50 p-2.5 text-xs text-red-600 border border-red-200"
        >
          ⚠ {state.error}
        </div>
      )}
      {state.success && (
        <div
          role="alert"
          className="rounded bg-green-50 p-2.5 text-xs text-green-700 border border-green-200"
        >
          ✓ {state.success}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">สาขา *</label>
        <select
          name="branchId"
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">-- เลือกสาขา --</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">
          ประเภทงาน *
        </label>
        <select
          name="type"
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="CUSTOM_ORDER">สั่งทำ</option>
          <option value="REPAIR">ซ่อม</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">
          รายละเอียดงาน *
        </label>
        <textarea
          name="description"
          required
          rows={2}
          placeholder="เช่น สั่งทำแหวนทองลายมังกร 1 บาท"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">
          เงินมัดจำ (บาท)
        </label>
        <input
          type="text"
          name="depositBahtStr"
          placeholder="เช่น 500.00"
          className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">
          ค่าเผื่อเศษทอง (กรัม) — เฉพาะงานสั่งทำ
        </label>
        <input
          type="text"
          name="toleranceGramStr"
          placeholder="เช่น 0.100"
          className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">
          ค่าบริการซ่อม (บาท) — เฉพาะงานซ่อม
        </label>
        <input
          type="text"
          name="serviceFeeBahtStr"
          placeholder="เช่น 200.00"
          className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 mt-2 disabled:bg-amber-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "รับงาน"}
      </button>
    </form>
  );
}
