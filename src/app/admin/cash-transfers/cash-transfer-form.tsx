"use client";

import { useActionState, useState } from "react";
import { createCashTransferAction } from "./actions";

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

interface DrawerOption {
  id: string;
  code: string;
  name: string;
  branchId: string;
}

interface CashTransferFormProps {
  branches: BranchOption[];
  drawers: DrawerOption[];
}

export function CashTransferForm({ branches, drawers }: CashTransferFormProps) {
  const [state, action, isPending] = useActionState(
    createCashTransferAction,
    {},
  );
  const [fromBranchId, setFromBranchId] = useState("");
  const [toBranchId, setToBranchId] = useState("");

  const fromDrawers = drawers.filter((d) => d.branchId === fromBranchId);
  const toDrawers = drawers.filter((d) => d.branchId === toBranchId);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 max-w-lg rounded border border-gray-200 p-6 bg-white"
    >
      <h2 className="font-semibold text-lg border-b border-gray-100 pb-2 mb-2">
        สร้างใบโอนเงินสดระหว่างสาขา
      </h2>

      {state.error && (
        <div
          role="alert"
          className="rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200"
        >
          ⚠ {state.error}
        </div>
      )}
      {state.success && (
        <div
          role="alert"
          className="rounded bg-green-50 p-3 text-sm text-green-700 border border-green-200"
        >
          ✓ {state.success}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          สาขาต้นทาง *
        </label>
        <select
          name="fromBranchId"
          value={fromBranchId}
          onChange={(e) => setFromBranchId(e.target.value)}
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">-- เลือกสาขาต้นทาง --</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      {fromDrawers.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            ลิ้นชักต้นทาง (ถ้ามี)
          </label>
          <select
            name="fromDrawerId"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">-- ไม่ระบุ (เงินจากตู้เซฟ) --</option>
            {fromDrawers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          สาขาปลายทาง *
        </label>
        <select
          name="toBranchId"
          value={toBranchId}
          onChange={(e) => setToBranchId(e.target.value)}
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">-- เลือกสาขาปลายทาง --</option>
          {branches
            .filter((b) => b.id !== fromBranchId)
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
        </select>
      </div>

      {toDrawers.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            ลิ้นชักปลายทาง (ถ้ามี)
          </label>
          <select
            name="toDrawerId"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">-- ไม่ระบุ (เงินเข้าตู้เซฟ) --</option>
            {toDrawers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          จำนวนเงิน (บาท) *
        </label>
        <input
          type="text"
          name="amountBahtStr"
          required
          placeholder="เช่น 50000.00"
          className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">หมายเหตุ</label>
        <textarea
          name="note"
          rows={2}
          placeholder="เช่น โอนเงินสดส่วนเกินไปสำรองสาขาหลัก"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 mt-4 border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={isPending || !fromBranchId || !toBranchId}
          className="rounded bg-amber-600 px-6 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:bg-amber-400 text-center"
        >
          {isPending ? "กำลังบันทึก..." : "สร้างใบโอนเงินสด"}
        </button>
      </div>
    </form>
  );
}
