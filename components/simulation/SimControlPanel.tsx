"use client";

import { useMemo } from "react";
import {
  ROUTE_META,
  type SharedSimConfig,
  type MultiRouteSimResult,
  type RouteKey,
  type DayTypeKey,
  type BreakMode,
  type FairnessMode,
  type ShortStaffPolicy,
} from "@/lib/simulationEngine";

interface Props {
  config: SharedSimConfig;
  multiResult: MultiRouteSimResult;
  onChange: (updates: Partial<SharedSimConfig>) => void;
  onReset: () => void;
}

// ── Reusable Slider ───────────────────────────────────────────────────

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  color?: string;
  onChange: (v: number) => void;
  hint?: string;
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  color = "#6366f1",
  onChange,
  hint,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[0.6875rem] font-semibold text-slate-700">{label}</span>
        <span className="text-[0.75rem] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
          {value}
          {unit}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none shadow-sm"
          style={{ left: `${pct}%`, background: color }}
        />
      </div>
      {hint && <p className="text-[0.5625rem] text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2.5 mt-3">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-[0.5rem] font-bold uppercase tracking-wider text-slate-400">
        {children}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────

function Toggle({
  label,
  hint,
  value,
  color,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  color: string;
  onChange: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer select-none transition-all duration-200 mb-2"
      style={{
        background: value ? `${color}10` : "#f8fafc",
        border: value ? `1px solid ${color}40` : "1px solid #e2e8f0",
      }}
      onClick={onChange}
    >
      <div>
        <p className="text-[0.6875rem] font-semibold text-slate-700">{label}</p>
        {hint && <p className="text-[0.5rem] text-slate-500 mt-0.5">{hint}</p>}
      </div>
      <div
        className="w-9 h-5 rounded-full relative shadow-inner flex-shrink-0"
        style={{ background: value ? color : "#cbd5e1" }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
          style={{ left: value ? "calc(100% - 1.15rem)" : "0.15rem" }}
        />
      </div>
    </div>
  );
}

// ── Segmented control ─────────────────────────────────────────────────

interface SegmentOption<T> {
  value: T;
  label: string;
  hint?: string;
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accent,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-1 mb-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex items-start gap-2 p-2 rounded-lg text-left transition-all duration-150 border"
          style={
            value === opt.value
              ? {
                  background: `${accent ?? "#6366f1"}12`,
                  border: `1px solid ${accent ?? "#6366f1"}40`,
                  color: accent ?? "#6366f1",
                }
              : { background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b" }
          }
        >
          <span
            className="mt-0.5 w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all"
            style={
              value === opt.value
                ? { background: accent ?? "#6366f1", borderColor: accent ?? "#6366f1" }
                : { background: "white", borderColor: "#cbd5e1" }
            }
          />
          <div>
            <p className="text-[0.625rem] font-bold leading-tight">{opt.label}</p>
            {opt.hint && (
              <p className="text-[0.5rem] opacity-70 mt-0.5 leading-tight">{opt.hint}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Preset definitions ────────────────────────────────────────────────

type Preset = Partial<SharedSimConfig>;
const PRESETS: { label: string; desc: string; values: Preset }[] = [
  {
    label: "ตามชีทมหาลัย",
    desc: "ค่ามาตรฐานตามที่กำหนด",
    values: {
      breakMode: "sheet",
      fairnessMode: "fewest-trips",
      shortStaffPolicy: "overlap",
      otThresholdHours: 8,
      restAfterHours: 4,
      tripDurations: { green: 20, blue: 25, red: 20 },
      otPayPerSession: 400,
      enableDayOff: false,
      rotateRoutes: false,
      crossLineAssist: false,
    },
  },
  {
    label: "ประหยัดค่าใช้จ่าย",
    desc: "เน้นลด OT ทุกสาย",
    values: {
      breakMode: "sheet",
      fairnessMode: "earliest-free",
      shortStaffPolicy: "overlap",
      otThresholdHours: 8, // เปลี่ยนจาก 6 เป็น 8 เพื่อลดการเกิด OT โดยไม่จำเป็น
      restAfterHours: 4,
      otPayPerSession: 400,
      enableDayOff: false, // ไม่บังคับหยุด เพื่อให้มีคนขับเพียงพอและไม่เกิด OT
    },
  },
  {
    label: "Coverage สูงสุด",
    desc: "ไม่พักบังคับ — ครอบคลุมทุกรอบ",
    values: {
      breakMode: "continuous",
      fairnessMode: "earliest-free",
      shortStaffPolicy: "overlap",
      otThresholdHours: 10,
      restAfterHours: 6,
      crossLineAssist: true,
      enableDayOff: false,
    },
  },
  {
    label: "Peak Hour Focus",
    desc: "อิงเวลาชีท เน้นจ่ายงานเร็วที่สุด",
    values: {
      breakMode: "sheet", // ใช้เวลาพักตามชีทเพื่อไม่ให้ตรงกับช่วงเร่งด่วน
      fairnessMode: "earliest-free", // ให้คนที่ว่างเร็วที่สุดรับงาน เพื่อลด Overlap
      shortStaffPolicy: "overlap",
      otThresholdHours: 8,
      restAfterHours: 4,
      crossLineAssist: false, // ปิดการช่วยสายข้ามเพราะกวนสัดส่วนคนขับหลัก
      rotateRoutes: false, // ปิดวนสายที่ทำให้คิวเสียสมดุล
    },
  },
];

// ── Main component ────────────────────────────────────────────────────

export function SimControlPanel({ config, multiResult, onChange, onReset }: Props) {
  const allDriverWorkloads = useMemo(() => {
    return (["green", "blue", "red"] as RouteKey[])
      .flatMap((route) =>
        multiResult[route].drivers.map((d) => ({
          name: d.name,
          trips: d.trips.length,
          hours: +(d.workMinutes / 60).toFixed(1),
          route,
          color: ROUTE_META[route].color,
        }))
      )
      .sort((a, b) => b.trips - a.trips);
  }, [multiResult]);

  const maxTrips = Math.max(...allDriverWorkloads.map((d) => d.trips), 1);
  const totalOTPay = (["green", "blue", "red"] as RouteKey[]).reduce(
    (s, r) => s + multiResult[r].totalOTPay,
    0
  );
  const totalBreaks = (["green", "blue", "red"] as RouteKey[]).reduce(
    (s, r) => s + multiResult[r].drivers.reduce((ss, d) => ss + d.breaks.length, 0),
    0
  );
  const totalOverlap = (["green", "blue", "red"] as RouteKey[]).reduce(
    (s, r) => s + multiResult[r].overlappedTrips,
    0
  );

  const breakModeOptions: SegmentOption<BreakMode>[] = [
    { value: "sheet", label: "ตามชีท (Excel)", hint: "พักตรงเวลาที่กำหนดแบบเป๊ะ" },
    {
      value: "cumulative",
      label: "สะสมเวลา (รวมรอ)",
      hint: "นับเวลาตั้งแต่เริ่มงาน รวมช่วงรอด้วย",
    },
    { value: "continuous", label: "สะสมวิ่งจริง", hint: "นับเฉพาะตอนวิ่งรถ ช่วงรอไม่นับ" },
  ];

  const fairnessModeOptions: SegmentOption<FairnessMode>[] = [
    { value: "fewest-trips", label: "น้อยที่สุดก่อน", hint: "คนวิ่งน้อยสุดได้คิวถัดไป (แฟร์)" },
    { value: "round-robin", label: "วนตามลำดับ", hint: "วนชื่อตามลำดับตายตัว" },
    { value: "earliest-free", label: "ว่างก่อนได้งาน", hint: "ใครว่างก่อนได้คิวก่อนเลย" },
  ];

  return (
    <div className="w-full md:w-72 flex-shrink-0 flex flex-col overflow-hidden border-r border-slate-200 bg-white">
      <div
        className="flex-1 overflow-y-auto px-4 pt-3 pb-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.1) transparent" }}
      >
        {/* ── Live KPI bar ── */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-center">
            <p className="text-[0.5rem] text-emerald-600 font-semibold">ค่า OT รวม</p>
            <p className="text-[0.875rem] font-black text-emerald-700">
              ฿{totalOTPay.toLocaleString()}
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-center">
            <p className="text-[0.5rem] text-amber-600 font-semibold">พักรวม</p>
            <p className="text-[0.875rem] font-black text-amber-700">{totalBreaks} ครั้ง</p>
          </div>
          <div
            className={`border rounded-xl p-2 text-center ${totalOverlap > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}
          >
            <p
              className={`text-[0.5rem] font-semibold ${totalOverlap > 0 ? "text-red-600" : "text-slate-500"}`}
            >
              Overlap
            </p>
            <p
              className={`text-[0.875rem] font-black ${totalOverlap > 0 ? "text-red-700" : "text-slate-400"}`}
            >
              {totalOverlap} รอบ
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2 text-center">
            <p className="text-[0.5rem] text-indigo-600 font-semibold">Fairness SD</p>
            <p className="text-[0.875rem] font-black text-indigo-700">
              {(
                (["green", "blue", "red"] as RouteKey[]).reduce(
                  (s, r) => s + multiResult[r].fairnessSD,
                  0
                ) / 3
              ).toFixed(2)}
            </p>
          </div>
        </div>

        {/* ── Presets ── */}
        <SectionLabel>โหลด Preset</SectionLabel>
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onChange(p.values)}
              className="flex flex-col items-center p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-150 text-center"
            >
              <p className="text-[0.5625rem] font-bold text-slate-700 leading-tight">{p.label}</p>
              <p className="text-[0.45rem] text-slate-400 leading-tight mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>

        {/* ── Day type ── */}
        <SectionLabel>ประเภทวัน</SectionLabel>
        <div className="flex gap-1.5 mb-3">
          {(["weekday", "weekend"] as DayTypeKey[]).map((d) => (
            <button
              key={d}
              onClick={() => onChange({ dayType: d })}
              className="flex-1 py-2 rounded-xl text-[0.5625rem] font-bold transition-all duration-200"
              style={
                config.dayType === d
                  ? {
                      background: "#4f46e5",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                    }
                  : { background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }
              }
            >
              {d === "weekday" ? "จ–ศ (Weekday)" : "ส–อา (Weekend)"}
            </button>
          ))}
        </div>

        {/* ── Simulation Day ── */}
        <Slider
          label="วันที่จำลอง"
          value={config.simulationDay}
          min={1}
          max={30}
          color="#8b5cf6"
          onChange={(v) => onChange({ simulationDay: v })}
          hint="ปรับเพื่อดูการหมุนเวียนคิวคนขับในวันถัดๆ ไป"
        />

        {/* ── Break logic ── */}
        <SectionLabel>กฎการพัก</SectionLabel>
        <SegmentedControl<BreakMode>
          options={breakModeOptions}
          value={config.breakMode}
          onChange={(v) => onChange({ breakMode: v })}
          accent="#f59e0b"
        />
        {config.breakMode !== "sheet" && (
          <Slider
            label="ทำงานถึงพัก"
            value={config.restAfterHours}
            min={2}
            max={8}
            unit=" ชม."
            color="#f59e0b"
            onChange={(v) => onChange({ restAfterHours: v })}
            hint={
              config.breakMode === "cumulative"
                ? "นับจากเริ่มงาน (รวมช่วงรอ)"
                : "นับเฉพาะเวลาวิ่งรถจริง"
            }
          />
        )}

        {/* ── Fairness mode ── */}
        <SectionLabel>วิธีจัดคิว</SectionLabel>
        <SegmentedControl<FairnessMode>
          options={fairnessModeOptions}
          value={config.fairnessMode}
          onChange={(v) => onChange({ fairnessMode: v })}
          accent="#6366f1"
        />

        {/* ── Rotation options ── */}
        <SectionLabel>การหมุนเวียน</SectionLabel>
        <Toggle
          label="หมุนเวียนวัน (วนรายชื่อ)"
          hint="สลับคิวคนขับตามวัน (หมุนเวียนคิวแบบเดิม)"
          value={config.enableDayOff}
          color="#16a34a"
          onChange={() => onChange({ enableDayOff: !config.enableDayOff })}
        />
        <Toggle
          label="วนสาย (ข้ามสาย)"
          hint="เฉลี่ยคนขับให้หมุนเวียนไปทุกสาย"
          value={config.rotateRoutes}
          color="#ef4444"
          onChange={() => onChange({ rotateRoutes: !config.rotateRoutes })}
        />

        {/* ── Work rules ── */}
        <SectionLabel>กฎการทำงาน</SectionLabel>
        <Slider
          label="OT Threshold"
          value={config.otThresholdHours}
          min={4}
          max={12}
          unit=" ชม."
          color="#64748b"
          onChange={(v) => onChange({ otThresholdHours: v })}
          hint="เกินกี่ชั่วโมงถึงนับ OT"
        />
        <Slider
          label="ค่า OT ต่อครั้ง"
          value={config.otPayPerSession}
          min={100}
          max={1000}
          step={50}
          unit=" ฿"
          color="#64748b"
          onChange={(v) => onChange({ otPayPerSession: v })}
        />

        {/* ── Trip durations ── */}
        <SectionLabel>ระยะเวลา/รอบ (นาที)</SectionLabel>
        <Slider
          label="สายสีเขียว"
          value={config.tripDurations.green}
          min={10}
          max={40}
          unit=" น."
          color="#16a34a"
          onChange={(v) => onChange({ tripDurations: { ...config.tripDurations, green: v } })}
        />
        <Slider
          label="สายสีน้ำเงิน"
          value={config.tripDurations.blue}
          min={10}
          max={40}
          unit=" น."
          color="#1d4ed8"
          onChange={(v) => onChange({ tripDurations: { ...config.tripDurations, blue: v } })}
        />
        <Slider
          label="สายสีแดง"
          value={config.tripDurations.red}
          min={10}
          max={40}
          unit=" น."
          color="#dc2626"
          onChange={(v) => onChange({ tripDurations: { ...config.tripDurations, red: v } })}
        />

        {/* ── Cross-line assist ── */}
        <SectionLabel>ตัวเลือกพิเศษ</SectionLabel>
        <Toggle
          label="Cross-Line Assist"
          hint="สายเขียวช่วยสีน้ำเงินช่วง 07:50 - 08:50"
          value={config.crossLineAssist}
          color="#16a34a"
          onChange={() => onChange({ crossLineAssist: !config.crossLineAssist })}
        />

        {/* ── Reset ── */}
        <button
          onClick={onReset}
          className="w-full py-2.5 rounded-xl text-[0.6875rem] font-bold transition-all duration-200 mt-2 mb-4 bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
        >
          รีเซ็ตค่าเริ่มต้น
        </button>

        {/* ── Per-driver workload bars ── */}
        <SectionLabel>ภาระงานแต่ละคน</SectionLabel>
        <div className="space-y-1.5">
          {allDriverWorkloads.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: d.color }}
              />
              <span className="text-[0.5rem] text-slate-600 w-14 truncate">{d.name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(d.trips / maxTrips) * 100}%`, background: d.color }}
                />
              </div>
              <span className="text-[0.5rem] font-bold text-slate-700 w-6 text-right">
                {d.trips}
              </span>
              <span className="text-[0.45rem] text-slate-500 w-8 text-right">{d.hours}h</span>
            </div>
          ))}
          {allDriverWorkloads.length === 0 && (
            <p className="text-[0.5rem] text-slate-400 text-center italic py-2">
              ยังไม่มีคนขับถูกจัดสาย
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
