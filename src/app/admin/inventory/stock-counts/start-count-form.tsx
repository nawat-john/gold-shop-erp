"use client";

import { useActionState } from "react";
import { startStockCountAction } from "../actions";

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

interface StartCountFormProps {
  branches: BranchOption[];
}

export function StartCountForm({ branches }: StartCountFormProps) {
  const [state, action, isPending] = useActionState(startStockCountAction, {});

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
        <label className="text-sm font-semibold text-gray-700">
          เลือกสาขา *
        </label>
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
        <label className="text-sm font-semibold text-gray-700">หมายเหตุ</label>
        <textarea
          name="note"
          rows={2}
          placeholder="เช่น สุ่มตรวจนับตู้ทองรูปพรรณประจำเดือน"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 mt-2 text-center disabled:bg-amber-400 cursor-pointer"
      >
        {isPending ? "กำลังเริ่ม..." : "เริ่มต้นเปิดรอบนับสต๊อก"}
      </button>
    </form>
  );
}
