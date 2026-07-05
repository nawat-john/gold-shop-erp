"use client";

import { useActionState } from "react";
import { closeShiftAction } from "../actions";

interface CloseShiftFormProps {
  shiftId: string;
}

export function CloseShiftForm({ shiftId }: CloseShiftFormProps) {
  const [state, action, isPending] = useActionState(closeShiftAction, {});

  return (
    <form
      action={action}
      className="flex flex-col gap-2 pt-2 border-t border-gray-100"
    >
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

      <input type="hidden" name="shiftId" value={shiftId} />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">
          ยอดเงินสดนับจริงเมื่อปิดกะ (บาท) *
        </label>
        <input
          type="text"
          name="endCashBahtStr"
          placeholder="เช่น 12400.00"
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-semibold text-white text-center cursor-pointer disabled:bg-red-400"
      >
        {isPending ? "กำลังปิด..." : "บันทึกปิดกะพนักงานขาย"}
      </button>
    </form>
  );
}
