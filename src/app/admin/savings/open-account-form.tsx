"use client";

import { useActionState } from "react";
import { openAccountAction } from "./actions";

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

export function OpenAccountForm({ branches }: { branches: BranchOption[] }) {
  const [state, action, isPending] = useActionState(openAccountAction, {});

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
          ประเภทบัญชี *
        </label>
        <select
          name="accountType"
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="CASH_SAVINGS">ออมเงิน (แปลงเป็นทองตอนปิดบัญชี)</option>
          <option value="WEIGHT_SAVINGS">
            ออมน้ำหนัก (แปลงทันทีทุกครั้งที่ฝาก)
          </option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">
          เป้าหมายน้ำหนัก (กรัม) — ถ้ามี
        </label>
        <input
          type="text"
          name="targetWeightGramStr"
          placeholder="เช่น 15.16"
          className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 mt-2 disabled:bg-amber-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "เปิดบัญชี"}
      </button>
    </form>
  );
}
