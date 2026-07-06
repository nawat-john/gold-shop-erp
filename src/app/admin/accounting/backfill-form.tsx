"use client";

import { useActionState } from "react";
import { runBackfillAction } from "./actions";

export function BackfillForm() {
  const [state, action, isPending] = useActionState(runBackfillAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      {state.error && (
        <div
          role="alert"
          className="rounded bg-red-50 p-2 text-xs text-red-600 border border-red-200"
        >
          ⚠ {state.error}
        </div>
      )}
      {state.success && (
        <div
          role="alert"
          className="rounded bg-green-50 p-2 text-xs text-green-700 border border-green-200"
        >
          ✓ {state.success}
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded border border-gray-300 hover:bg-gray-50 px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
      >
        {isPending
          ? "กำลังโพสต์..."
          : "โพสต์ธุรกรรมย้อนหลังที่ยังไม่ลงบัญชี (Backfill)"}
      </button>
    </form>
  );
}
