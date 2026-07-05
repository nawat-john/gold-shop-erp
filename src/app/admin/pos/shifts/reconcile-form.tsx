"use client";

import { useActionState } from "react";
import { reconcileShiftAction } from "../actions";

export function ShiftReconcileForm({ shiftId }: { shiftId: string }) {
  const [state, action, isPending] = useActionState(reconcileShiftAction, {});

  return (
    <form action={action} className="flex flex-col gap-1 items-end w-full">
      {state.error && (
        <span className="text-[10px] text-red-600 block mb-1">
          ⚠ {state.error}
        </span>
      )}
      {state.success && (
        <span className="text-[10px] text-green-700 block mb-1">
          ✓ {state.success}
        </span>
      )}

      <input type="hidden" name="shiftId" value={shiftId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-green-600 hover:bg-green-700 px-3 py-1 text-[10px] font-bold text-white disabled:bg-green-400 cursor-pointer"
      >
        {isPending ? "กำลังอนุมัติ..." : "อนุมัติกระทบยอดลิ้นชัก (Reconcile)"}
      </button>
    </form>
  );
}
