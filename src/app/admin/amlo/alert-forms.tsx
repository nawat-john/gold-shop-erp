"use client";

import { useActionState } from "react";
import {
  reviewAlertAction,
  markAlertReportedAction,
  addWatchlistEntryAction,
} from "./actions";

function Message({ state }: { state: { error?: string; success?: string } }) {
  if (state.error) {
    return (
      <div
        role="alert"
        className="rounded bg-red-50 p-2 text-xs text-red-600 border border-red-200"
      >
        ⚠ {state.error}
      </div>
    );
  }
  if (state.success) {
    return (
      <div
        role="alert"
        className="rounded bg-green-50 p-2 text-xs text-green-700 border border-green-200"
      >
        ✓ {state.success}
      </div>
    );
  }
  return null;
}

export function ReviewAlertForm({ alertId }: { alertId: string }) {
  const [state, action, isPending] = useActionState(reviewAlertAction, {});
  return (
    <form action={action} className="inline">
      <input type="hidden" name="alertId" value={alertId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs font-semibold text-white disabled:bg-blue-400 cursor-pointer"
      >
        {isPending ? "..." : "ตรวจทานแล้ว"}
      </button>
      <Message state={state} />
    </form>
  );
}

export function MarkReportedForm({ alertId }: { alertId: string }) {
  const [state, action, isPending] = useActionState(
    markAlertReportedAction,
    {},
  );
  return (
    <form action={action} className="inline">
      <input type="hidden" name="alertId" value={alertId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-green-600 hover:bg-green-700 px-3 py-1 text-xs font-semibold text-white disabled:bg-green-400 cursor-pointer"
      >
        {isPending ? "..." : "ยืนยันส่งรายงานแล้ว"}
      </button>
      <Message state={state} />
    </form>
  );
}

export function AddWatchlistForm() {
  const [state, action, isPending] = useActionState(
    addWatchlistEntryAction,
    {},
  );
  return (
    <form action={action} className="flex flex-col gap-2">
      <Message state={state} />
      <input
        type="text"
        name="name"
        required
        placeholder="ชื่อ"
        className="rounded border border-gray-300 px-3 py-1.5 text-xs"
      />
      <input
        type="text"
        name="citizenId"
        required
        placeholder="เลขบัตร ปชช."
        className="rounded border border-gray-300 px-3 py-1.5 text-xs font-mono"
      />
      <input
        type="text"
        name="reason"
        required
        placeholder="เหตุผล"
        className="rounded border border-gray-300 px-3 py-1.5 text-xs"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-gray-700 hover:bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white disabled:bg-gray-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "เพิ่มรายชื่อเฝ้าระวัง"}
      </button>
    </form>
  );
}
