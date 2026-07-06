"use client";

import { useActionState, useState } from "react";
import { openContractAction } from "../actions";

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

interface LocationOption {
  id: string;
  branchId: string;
  code: string;
  name: string;
}

interface NewContractFormProps {
  branches: BranchOption[];
  locations: LocationOption[];
  /** ราคารับซื้อคืนทองรูปพรรณปัจจุบัน (บาท/บาททอง) — null ถ้าร้านยังไม่เคยประกาศราคา */
  ornamentBuyBaht: number | null;
  /** % ของราคาตลาดที่แนะนำให้เป็นวงเงินขายฝาก */
  ltvPercent: number;
}

export function NewContractForm({
  branches,
  locations,
  ornamentBuyBaht,
  ltvPercent,
}: NewContractFormProps) {
  const [state, action, isPending] = useActionState(openContractAction, {});
  const [branchId, setBranchId] = useState("");
  const [weightGramStr, setWeightGramStr] = useState("");
  const [goldPurity, setGoldPurity] = useState("96.5");

  const filteredLocations = locations.filter(
    (l) => !branchId || l.branchId === branchId,
  );

  const weightGrams = Number(weightGramStr);
  const purity = Number(goldPurity);
  const suggestedPrincipal =
    ornamentBuyBaht && weightGrams > 0 && purity > 0
      ? (weightGrams / 15.16) *
        ornamentBuyBaht *
        (purity / 96.5) *
        (ltvPercent / 100)
      : null;

  return (
    <form action={action} className="flex flex-col gap-4">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">สาขา *</label>
          <select
            name="branchId"
            required
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
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
          <label className="text-sm font-semibold text-gray-700">
            ตำแหน่งจัดเก็บ (custody)
          </label>
          <select
            name="locationId"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">-- ไม่ระบุ --</option>
            {filteredLocations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            ชื่อลูกค้า *
          </label>
          <input
            type="text"
            name="customerName"
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            เบอร์โทรศัพท์
          </label>
          <input
            type="text"
            name="customerPhone"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          เลขบัตรประชาชน
        </label>
        <input
          type="text"
          name="customerCitizenId"
          className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
          placeholder="เก็บแบบเข้ารหัส (AES-256-GCM)"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          รายละเอียดทรัพย์ *
        </label>
        <input
          type="text"
          name="description"
          required
          placeholder="เช่น สร้อยคอทอง 2 บาท ลายผ่าหวาย"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            น้ำหนัก (กรัม) *
          </label>
          <input
            type="text"
            name="weightGramStr"
            required
            value={weightGramStr}
            onChange={(e) => setWeightGramStr(e.target.value)}
            placeholder="เช่น 15.16"
            className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            ความบริสุทธิ์ (%) *
          </label>
          <input
            type="number"
            step="0.01"
            name="goldPurity"
            required
            value={goldPurity}
            onChange={(e) => setGoldPurity(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            วงเงินขายฝาก (บาท) *
          </label>
          <input
            type="text"
            name="principalBahtStr"
            required
            placeholder="เช่น 30000.00"
            className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
          />
          {suggestedPrincipal !== null && (
            <p className="text-xs text-amber-700">
              แนะนำ ~{" "}
              {suggestedPrincipal.toLocaleString("th-TH", {
                maximumFractionDigits: 0,
              })}{" "}
              บาท ({ltvPercent}% ของราคาตลาด)
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            อัตราดอกเบี้ย (%/ปี) *
          </label>
          <input
            type="number"
            step="0.01"
            name="annualInterestRatePercent"
            required
            defaultValue={15}
            className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            ระยะเวลา (เดือน) *
          </label>
          <input
            type="number"
            name="termMonths"
            required
            defaultValue={1}
            min={1}
            className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 mt-2 disabled:bg-amber-400 cursor-pointer"
      >
        {isPending ? "กำลังบันทึก..." : "เปิดสัญญาขายฝาก"}
      </button>
    </form>
  );
}
