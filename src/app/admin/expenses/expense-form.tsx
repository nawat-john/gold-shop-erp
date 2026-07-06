"use client";

import { useActionState } from "react";
import { recordExpenseAction } from "./actions";

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

interface AccountOption {
  code: string;
  name: string;
}

export function ExpenseForm({
  branches,
  expenseAccounts,
}: {
  branches: BranchOption[];
  expenseAccounts: AccountOption[];
}) {
  const [state, action, isPending] = useActionState(recordExpenseAction, {});

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
          ประเภทค่าใช้จ่าย *
        </label>
        <select
          name="expenseAccountCode"
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          {expenseAccounts.map((a) => (
            <option key={a.code} value={a.code}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">
          จำนวนเงิน (บาท) *
        </label>
        <input
          type="text"
          name="amountBahtStr"
          required
          placeholder="เช่น 5000.00"
          className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">
          รายละเอียด *
        </label>
        <input
          type="text"
          name="description"
          required
          placeholder="เช่น ค่าเช่าร้านประจำเดือน"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">วันที่ *</label>
        <input
          type="date"
          name="expenseDateStr"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 mt-2 disabled:bg-amber-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "บันทึกค่าใช้จ่าย"}
      </button>
    </form>
  );
}
