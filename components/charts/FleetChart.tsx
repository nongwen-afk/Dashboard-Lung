/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CHART_DATA, UTILIZATION_DATA } from "@/lib/mock-data";
import { TrendingUp, ChevronRight, BarChart2 } from "lucide-react";

const BAR_COLORS = {
  efficiency: "#1e3a8a",
  trips: "#1e40af",
  delay: "#d97706",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(26,26,46,0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "6px 10px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        fontSize: 9,
        color: "#fff",
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 2, color: "#cbd5e1" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export function FleetChart() {
  const [pilten, setPilten] = useState(true);
  const [open, setOpen] = useState(true);

  /* ── Collapsed: แสดงแค่ปุ่มเล็กๆ ── */
  if (!open) {
    return (
      /* Hidden on mobile — chart is accessible via MobilePanel bottom sheet */
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex absolute top-3 right-3 items-center gap-2 rounded-2xl px-3 py-2.5 overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.93)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow:
            "0 8px 32px rgba(26,26,46,0.14), 0 2px 8px rgba(26,26,46,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
          zIndex: 800,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 8px 32px rgba(15,23,42,0.22), 0 2px 8px rgba(37,99,235,0.12), inset 0 1px 0 rgba(255,255,255,0.9)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 8px 32px rgba(26,26,46,0.14), 0 2px 8px rgba(26,26,46,0.08), inset 0 1px 0 rgba(255,255,255,0.9)";
        }}
        title="เปิดหน้าต่าง Fleet"
      >
        {/* gradient line */}
        <div
          className="absolute inset-x-0 top-0 h-[0.1875rem] rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, #1e40af, #1e3a8a, #d97706)" }}
        />
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            boxShadow: "0 2px 6px rgba(15,23,42,0.35)",
          }}
        >
          <BarChart2 className="w-2.5 h-2.5 text-white" />
        </div>
        <span
          className="text-[0.625rem] font-bold"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Fleet
        </span>
        <ChevronRight className="w-3 h-3 text-gray-400" style={{ transform: "rotate(180deg)" }} />
      </button>
    );
  }

  /* ── Expanded: panel เต็ม ── */
  return (
    <div
      className="hidden md:block absolute top-3 right-3 rounded-2xl p-3 w-[10.5rem] overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.93)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow:
          "0 8px 32px rgba(26,26,46,0.14), 0 2px 8px rgba(26,26,46,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        zIndex: 800,
      }}
    >
      {/* Decorative top gradient bar */}
      <div
        className="absolute inset-x-0 top-0 h-[0.1875rem] rounded-t-2xl"
        style={{ background: "linear-gradient(90deg, #1e40af, #1e3a8a, #d97706)" }}
      />

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2 mt-1">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            boxShadow: "0 2px 6px rgba(15,23,42,0.35)",
          }}
        >
          <TrendingUp className="w-2.5 h-2.5 text-white" />
        </div>
        <p
          className="text-[0.625rem] font-bold leading-tight flex-1"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Fleet
        </p>

        {/* ปุ่มปิด */}
        <button
          onClick={() => setOpen(false)}
          title="ซ่อนหน้าต่าง Fleet"
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
          style={{ background: "rgba(26,26,46,0.06)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,99,235,0.10)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(26,26,46,0.06)";
          }}
        >
          <ChevronRight className="w-3 h-3 text-gray-500" />
        </button>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={62}>
        <BarChart data={CHART_DATA} margin={{ top: 2, right: 0, left: -28, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 7, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 7, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 70]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(26,26,46,0.04)" }} />
          <Bar
            dataKey="efficiency"
            fill={BAR_COLORS.efficiency}
            radius={[3, 3, 0, 0]}
            name="Efficiency"
          />
          <Bar dataKey="trips" fill={BAR_COLORS.trips} radius={[3, 3, 0, 0]} name="Trips" />
          <Bar dataKey="delay" fill={BAR_COLORS.delay} radius={[3, 3, 0, 0]} name="Delay" />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend dots */}
      <div className="flex gap-2 mb-2 justify-center">
        {Object.entries(BAR_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: color, boxShadow: `0 0 4px ${color}80` }}
            />
            <span className="text-[0.4375rem] text-gray-400 capitalize">{key}</span>
          </div>
        ))}
      </div>

      {/* Pilten toggle */}
      <div
        className="flex items-center justify-between mb-2 px-2 py-1.5 rounded-lg"
        style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.05)" }}
      >
        <span className="text-[0.5625rem] text-gray-500 font-semibold">Pilten</span>
        <button
          onClick={() => setPilten((v) => !v)}
          className="relative inline-flex h-4 w-7 items-center rounded-full transition-all duration-300 focus:outline-none"
          style={{
            background: pilten ? "linear-gradient(135deg, #1e3a8a, #1e40af)" : "#e2e8f0",
            boxShadow: pilten
              ? "0 2px 8px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.2)"
              : "none",
          }}
          aria-label="Toggle Pilten"
        >
          <span
            className="inline-block h-3 w-3 transform rounded-full bg-white shadow-md transition-transform duration-300"
            style={{
              transform: pilten ? "translateX(14px)" : "translateX(2px)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          />
        </button>
      </div>

      {/* Divider */}
      <div
        className="h-[0.0625rem] mb-2"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(26,26,46,0.08), transparent)",
        }}
      />

      {/* Fleet utilization */}
      <div>
        <p
          className="text-[0.5625rem] font-bold mb-1.5"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Fleet utilization
        </p>
        <ResponsiveContainer width="100%" height={48}>
          <BarChart data={UTILIZATION_DATA} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 6, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(26,26,46,0.04)" }} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]} name="Utilization %">
              {UTILIZATION_DATA.map((_: unknown, i: number) => (
                <Cell key={i} fill={`hsl(${210 + i * 15}, 70%, ${55 + i * 3}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
