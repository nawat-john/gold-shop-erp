"use client";

// กราฟเส้นราคาทองย้อนหลัง (series เดียว — ไม่ต้องมี legend, ชื่อกราฟบอกอยู่แล้ว)
// สเปกตาม dataviz method: เส้น 2px สี series-1, grid จาง, hover crosshair + tooltip,
// direct label เฉพาะค่าล่าสุด, ตาราง feed ใต้กราฟทำหน้าที่ table view
import { useMemo, useState } from "react";
import { formatSatangAsBaht } from "@/server/domain/money";

export interface PricePoint {
  /** ISO datetime */
  t: string;
  /** ราคาสตางค์ (bigint serialized) */
  satang: string;
}

const W = 640;
const H = 180;
const PAD = { top: 16, right: 12, bottom: 22, left: 64 };
const SERIES_1 = "#2a78d6";

export function PriceHistoryChart({
  points,
  title,
}: {
  points: PricePoint[];
  title: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const model = useMemo(() => {
    if (points.length < 2) return null;
    const values = points.map((p) => Number(BigInt(p.satang) / 100n)); // บาท (แสดงผลเท่านั้น)
    const times = points.map((p) => new Date(p.t).getTime());
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const span = maxV - minV || 1;
    const minT = times[0];
    const maxT = times[times.length - 1];
    const tSpan = maxT - minT || 1;

    const x = (t: number) =>
      PAD.left + ((t - minT) / tSpan) * (W - PAD.left - PAD.right);
    const y = (v: number) =>
      PAD.top + (1 - (v - minV) / span) * (H - PAD.top - PAD.bottom);

    const coords = points.map((_, i) => ({
      x: x(times[i]),
      y: y(values[i]),
    }));
    const path = coords
      .map(
        (c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`,
      )
      .join(" ");
    return { values, coords, path, minV, maxV };
  }, [points]);

  if (!model) {
    return (
      <p className="text-sm text-gray-500">
        ยังมีข้อมูลไม่พอสำหรับกราฟ (ต้องมี feed อย่างน้อย 2 รอบ)
      </p>
    );
  }

  const hover = hoverIndex !== null ? model.coords[hoverIndex] : null;
  const last = points[points.length - 1];

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    model!.coords.forEach((c, i) => {
      const d = Math.abs(c.x - px);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  return (
    <figure className="max-w-2xl">
      <figcaption className="mb-1 text-sm font-medium text-gray-700">
        {title}
      </figcaption>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          className="w-full rounded border border-gray-200 bg-white"
          onMouseMove={onMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* grid จาง ๆ: เส้น min/max */}
          {[model.minV, model.maxV].map((v, i) => {
            const gy = i === 0 ? H - PAD.bottom : PAD.top;
            return (
              <g key={v + "-" + i}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={gy}
                  y2={gy}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 6}
                  y={gy + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill="#6b7280"
                >
                  {v.toLocaleString("th-TH")}
                </text>
              </g>
            );
          })}

          <path
            d={model.path}
            fill="none"
            stroke={SERIES_1}
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {/* direct label ค่าล่าสุด */}
          <circle
            cx={model.coords[model.coords.length - 1].x}
            cy={model.coords[model.coords.length - 1].y}
            r={3.5}
            fill={SERIES_1}
            stroke="#ffffff"
            strokeWidth={2}
          />

          {hover && hoverIndex !== null && (
            <g>
              <line
                x1={hover.x}
                x2={hover.x}
                y1={PAD.top}
                y2={H - PAD.bottom}
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle
                cx={hover.x}
                cy={hover.y}
                r={4}
                fill={SERIES_1}
                stroke="#ffffff"
                strokeWidth={2}
              />
            </g>
          )}
        </svg>

        {hover && hoverIndex !== null && (
          <div
            className="pointer-events-none absolute -top-2 rounded border border-gray-200 bg-white px-2 py-1 text-xs shadow"
            style={{
              left: `${(hover.x / W) * 100}%`,
              transform:
                hover.x > W / 2 ? "translateX(-105%)" : "translateX(8px)",
            }}
          >
            <p className="text-gray-500">
              {new Date(points[hoverIndex].t).toLocaleString("th-TH", {
                timeZone: "Asia/Bangkok",
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
            <p className="font-mono font-medium text-gray-900">
              {formatSatangAsBaht(BigInt(points[hoverIndex].satang))} บาท
            </p>
          </div>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        ล่าสุด{" "}
        <span className="font-mono font-medium text-gray-700">
          {formatSatangAsBaht(BigInt(last.satang))}
        </span>{" "}
        บาท/บาททอง
      </p>
    </figure>
  );
}
