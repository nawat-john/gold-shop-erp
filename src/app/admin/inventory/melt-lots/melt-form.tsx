"use client";

import { useActionState, useState } from "react";
import { createMeltLotAction } from "../actions";
import { formatMgAsGrams } from "@/server/domain/gold";

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

interface InStockItem {
  id: string;
  serialNo: string;
  weightMg: string;
  branchId: string;
  productName: string;
}

interface MeltFormProps {
  branches: BranchOption[];
  inStockItems: InStockItem[];
}

export function MeltForm({ branches, inStockItems }: MeltFormProps) {
  const [state, action, isPending] = useActionState(createMeltLotAction, {});
  const [branchId, setBranchId] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // กรองสินค้าที่อยู่ในสาขาที่เลือก
  const availableItems = inStockItems.filter(
    (item) => item.branchId === branchId,
  );

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBranchId(e.target.value);
    setSelectedItems([]); // รีเซ็ตการเลือกของเมื่อเปลี่ยนสาขา
  };

  return (
    <form
      action={action}
      className="flex flex-col gap-4 max-w-lg rounded border border-gray-200 p-6 bg-white"
    >
      <h2 className="font-semibold text-lg border-b border-gray-100 pb-2 mb-2">
        สร้างใบส่งหลอมทองคำใหม่
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

      {/* เลือกสาขา */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          สาขาที่รวบรวมทองเก่า *
        </label>
        <select
          name="branchId"
          value={branchId}
          onChange={handleBranchChange}
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

      {/* เลือกสินค้าส่งหลอม */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          เลือกสินค้าส่งหลอม (มีให้เลือก {availableItems.length} ชิ้น)
        </label>
        {!branchId ? (
          <p className="text-xs text-gray-500 italic">
            กรุณาเลือกสาขาเพื่อโหลดรายการทองเก่า
          </p>
        ) : availableItems.length === 0 ? (
          <p className="text-xs text-red-600 italic">
            ไม่มีสินค้าส่งหลอมในสาขานี้
          </p>
        ) : (
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded p-2 flex flex-col gap-2">
            {availableItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="rounded border-gray-300"
                />
                <span>
                  <strong className="font-mono">{item.serialNo}</strong> —{" "}
                  {item.productName} ({formatMgAsGrams(BigInt(item.weightMg))}{" "}
                  กรัม)
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* บันทึกข้อความ */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">หมายเหตุ</label>
        <textarea
          name="note"
          rows={2}
          placeholder="เช่น รวมทองเก่าส่งโรงหลอมบางซื่อ"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* ส่งอาเรย์ ItemIds ไปยัง Action ด้วย input hidden */}
      <input type="hidden" name="itemIdsStr" value={selectedItems.join(",")} />

      <div className="flex justify-end gap-2 mt-4 border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={isPending || selectedItems.length === 0}
          className="rounded bg-amber-600 px-6 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:bg-amber-400 text-center"
        >
          {isPending
            ? "กำลังบันทึก..."
            : `สร้างรอบส่งหลอม (${selectedItems.length} ชิ้น)`}
        </button>
      </div>
    </form>
  );
}
