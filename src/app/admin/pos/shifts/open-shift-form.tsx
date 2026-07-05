"use client";

import { useActionState } from "react";
import { openShiftAction } from "../actions";

interface DrawerOption {
  id: string;
  code: string;
  name: string;
}

interface OpenShiftFormProps {
  drawers: DrawerOption[];
}

export function OpenShiftForm({ drawers }: OpenShiftFormProps) {
  const [state, action, isPending] = useActionState(openShiftAction, {});

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
          เลือกตู้ลิ้นชักเงินสด *
        </label>
        <select
          name="drawerId"
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">-- เลือกตู้ลิ้นชัก --</option>
          {drawers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          เงินสดตั้งต้นลิ้นชัก (บาท) *
        </label>
        <input
          type="text"
          name="startCashBahtStr"
          defaultValue="10000.00"
          placeholder="เช่น 10000.00"
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-amber-600 hover:bg-amber-700 px-4 py-2 text-sm font-semibold text-white text-center cursor-pointer disabled:bg-amber-400"
      >
        {isPending ? "กำลังเปิด..." : "ยืนยันเปิดกะการทำงาน"}
      </button>
    </form>
  );
}
