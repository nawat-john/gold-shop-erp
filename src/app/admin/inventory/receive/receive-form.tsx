"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { receiveItemAction } from "../actions";

interface ProductOption {
  id: string;
  sku: string;
  name: string;
  tracking: "SERIALIZED" | "COUNTED";
  goldPurity: number;
}

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

interface SupplierOption {
  id: string;
  code: string;
  name: string;
}

interface LocationOption {
  id: string;
  code: string;
  name: string;
  branchId: string;
}

interface ReceiveFormProps {
  products: ProductOption[];
  branches: BranchOption[];
  suppliers: SupplierOption[];
  locations: LocationOption[];
}

export function ReceiveForm({
  products,
  branches,
  suppliers,
  locations,
}: ReceiveFormProps) {
  const [state, action, isPending] = useActionState(receiveItemAction, {});
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const isSerialized = selectedProduct?.tracking === "SERIALIZED";

  // ฟิลเตอร์เฉพาะ Location ของสาขาที่เลือก
  const filteredLocations = locations.filter(
    (l) => l.branchId === selectedBranchId,
  );

  return (
    <form
      action={action}
      className="flex flex-col gap-4 max-w-lg rounded border border-gray-200 p-6 bg-white"
    >
      <h2 className="font-semibold text-lg border-b border-gray-100 pb-2 mb-2">
        รับสินค้าเข้าคลัง
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
          สาขาที่รับเข้า *
        </label>
        <select
          name="branchId"
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
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

      {/* เลือกคลังย่อย */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          ตำแหน่งจัดเก็บ (Storage Location)
        </label>
        <select
          name="locationId"
          disabled={!selectedBranchId}
          className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
        >
          <option value="">-- ไม่ระบุ (คลังหลักของสาขา) --</option>
          {filteredLocations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.code})
            </option>
          ))}
        </select>
      </div>

      {/* เลือกแบบสินค้า */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          แบบสินค้า (SKU) *
        </label>
        <select
          name="productId"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">-- เลือกแบบสินค้า --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              [{p.tracking}] {p.name} ({p.sku})
            </option>
          ))}
        </select>
      </div>

      {/* ผู้จัดจำหน่าย */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          ผู้จำหน่าย (Supplier)
        </label>
        <select
          name="supplierId"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">-- ไม่ระบุ --</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      {/* น้ำหนัก และ ความบริสุทธิ์ */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            น้ำหนักรวม (กรัม) *
          </label>
          <input
            type="text"
            name="weightGramStr"
            placeholder="เช่น 15.160"
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            ความบริสุทธิ์ทอง (%) *
          </label>
          <input
            type="number"
            name="goldPurity"
            step="0.01"
            defaultValue={selectedProduct ? selectedProduct.goldPurity : 96.5}
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      {/* ต้นทุน และ ค่ากำเน็จ */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            ราคาทุนรวม (บาท) *
          </label>
          <input
            type="text"
            name="costBahtStr"
            placeholder="เช่น 38200.00"
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            ค่ากำเหน็จ (บาท) /ชิ้น
          </label>
          <input
            type="text"
            name="laborChargeBahtStr"
            placeholder="เช่น 800.00"
            className="rounded border border-gray-300 px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      {/* จำนวน และ หมายเลขป้ายสินค้า */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            จำนวนที่รับเข้า *
          </label>
          <input
            type="number"
            name="quantity"
            min="1"
            value={isSerialized ? 1 : undefined}
            readOnly={isSerialized}
            defaultValue={1}
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm font-mono bg-disabled disabled:bg-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            {isSerialized
              ? "ป้ายสินค้า (SerialNo) *"
              : "ป้ายสินค้า (ข้ามสำหรับ Counted)"}
          </label>
          <input
            type="text"
            name="serialNo"
            placeholder={
              isSerialized ? "ปล่อยว่างเพื่อสร้างอัตโนมัติ" : "ไม่รองรับ"
            }
            disabled={!isSerialized}
            className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4 border-t border-gray-100 pt-4">
        <Link
          href="/admin/inventory"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 text-center"
        >
          กลับหน้าหลัก
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-amber-600 px-6 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:bg-amber-400 text-center"
        >
          {isPending ? "กำลังบันทึก..." : "ยืนยันการรับเข้า"}
        </button>
      </div>
    </form>
  );
}
