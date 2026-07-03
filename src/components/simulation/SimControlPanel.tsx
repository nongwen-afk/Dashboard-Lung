"use client";

import { useMemo } from "react";
import {
  ROUTE_META,
  type SharedSimConfig,
  type MultiRouteSimResult,
  type RouteKey,
  type DayTypeKey,
} from "@/lib/simulationEngine";

interface Props {
  config: SharedSimConfig;
  multiResult: MultiRouteSimResult;
  onChange: (updates: Partial<SharedSimConfig>) => void;
  onReset: () => void;
}

// ── Slider component ─────────────────────────────────────────────────

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  color: string;
  onChange: (v: number) => void;
  hint?: string;
}

function Slider({ label, value, min, max, step = 1, unit = "", color, onChange, hint }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[0.6875rem] font-semibold text-slate-700">{label}</span>
        <span className="text-[0.75rem] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
          {value}{unit}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-200">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: color }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer h-2" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none shadow-sm" style={{ left: `${pct}%`, background: color }} />
      </div>
      {hint && <p className="text-[0.5625rem] text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-[0.5rem] font-bold uppercase tracking-wider text-slate-400">{children}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

export function SimControlPanel({ config, multiResult, onChange, onReset }: Props) {

  // Per-driver workload for all routes combined
  const allDriverWorkloads = useMemo(() => {
    return (["green", "blue", "red"] as RouteKey[]).flatMap(route =>
      multiResult[route].drivers.map(d => ({
        name: d.name,
        trips: d.trips.length,
        hours: +(d.workMinutes / 60).toFixed(1),
        route,
        color: ROUTE_META[route].color,
      }))
    ).sort((a, b) => b.trips - a.trips);
  }, [multiResult]);

  const maxTrips = Math.max(...allDriverWorkloads.map(d => d.trips), 1);

  return (
    <div
      className="w-full md:w-64 flex-shrink-0 flex flex-col overflow-hidden border-r border-slate-200 bg-white"
    >
      <div
        className="flex-1 overflow-y-auto px-4 pt-4 pb-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.1) transparent" }}
      >

        {/* ── Day type ── */}
        <SectionLabel>ประเภทวัน</SectionLabel>
        <div className="flex gap-1.5 mb-5">
          {(["weekday", "weekend"] as DayTypeKey[]).map(d => (
            <button
              key={d}
              onClick={() => onChange({ dayType: d })}
              className="flex-1 py-2 rounded-xl text-[0.5625rem] font-bold transition-all duration-200"
              style={config.dayType === d
                ? { background: "#4f46e5", color: "white", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }
                : { background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }
              }
            >
              {d === "weekday" ? "🗓️ จ–ศ" : "🌅 ส–อา"}
            </button>
          ))}
        </div>

        {/* ── Work rules ── */}
        <SectionLabel>กฎการทำงาน</SectionLabel>

        <Slider label="OT Threshold" value={config.otThresholdHours} min={4} max={12} unit=" ชม." color="#f97316" onChange={v => onChange({ otThresholdHours: v })} hint="เกินกี่ชั่วโมงถึงนับ OT" />
        <Slider label="พักบังคับหลัง" value={config.restAfterHours} min={2} max={6} unit=" ชม." color="#06b6d4" onChange={v => onChange({ restAfterHours: v })} hint="ทำงานต่อเนื่องกี่ชม. ถึงพัก 30 นาที" />
        <Slider label="ระยะเวลา/รอบ" value={config.tripDurationMin} min={10} max={40} unit=" นาที" color="#8b5cf6" onChange={v => onChange({ tripDurationMin: v })} hint="เวลาที่ใช้ต่อรอบ (ไป-กลับ)" />
        <Slider label="ค่า OT ต่อครั้ง" value={config.otPayPerSession} min={100} max={1000} step={50} unit=" ฿" color="#ec4899" onChange={v => onChange({ otPayPerSession: v })} />

        {/* ── Cross-line toggle ── */}
        <SectionLabel>ตัวเลือกพิเศษ</SectionLabel>

        <div
          className="flex items-center justify-between p-3 rounded-xl mb-4 cursor-pointer select-none transition-all duration-200"
          style={{ background: config.crossLineAssist ? "#f0fdf4" : "#f8fafc", border: config.crossLineAssist ? "1px solid #bbf7d0" : "1px solid #e2e8f0" }}
          onClick={() => onChange({ crossLineAssist: !config.crossLineAssist })}
        >
          <div>
            <p className="text-[0.6875rem] font-semibold text-slate-700">Cross-Line Assist</p>
            <p className="text-[0.5rem] text-slate-500 mt-0.5">สายเขียวช่วยสีน้ำเงินช่วง 07:50 - 08:50</p>
          </div>
          <div className="w-11 h-6 rounded-full relative shadow-inner" style={{ background: config.crossLineAssist ? "#16a34a" : "#cbd5e1" }}>
            <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300" style={{ left: config.crossLineAssist ? "calc(100% - 1.25rem)" : "0.25rem" }} />
          </div>
        </div>

        {/* ── Reset ── */}
        <button
          onClick={onReset}
          className="w-full py-2.5 rounded-xl text-[0.6875rem] font-bold transition-all duration-200 mb-5 bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
        >
          ↺ รีเซ็ตค่าเริ่มต้น
        </button>

        {/* ── Per-driver workload bars ── */}
        <SectionLabel>ภาระงานแต่ละคน</SectionLabel>

        <div className="space-y-1.5">
          {allDriverWorkloads.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-[0.5rem] text-slate-600 w-14 truncate">{d.name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(d.trips / maxTrips) * 100}%`, background: d.color }}
                />
              </div>
              <span className="text-[0.5rem] font-bold text-slate-700 w-6 text-right">{d.trips}</span>
              <span className="text-[0.45rem] text-slate-500 w-8 text-right">{d.hours}h</span>
            </div>
          ))}
          {allDriverWorkloads.length === 0 && (
            <p className="text-[0.5rem] text-slate-400 text-center italic py-2">ยังไม่มีคนขับถูกจัดสาย</p>
          )}
        </div>

      </div>
    </div>
  );
}
