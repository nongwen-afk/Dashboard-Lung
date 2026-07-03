"use client";

import { useState, useCallback } from "react";
import {
  ROUTE_META,
  ALL_DRIVERS,
  type AssignmentMap,
  type RouteKey,
} from "@/lib/simulationEngine";

interface Props {
  assignments: AssignmentMap;
  onChange: (next: AssignmentMap) => void;
}

const ZONES: Array<{ key: RouteKey | "pool"; label: string; emoji: string; color: string; border: string; bg: string }> = [
  { key: "green", label: "สายสีเขียว", emoji: "🟢", color: "#16a34a", border: "#bbf7d0", bg: "#f0fdf4" },
  { key: "blue",  label: "สายสีน้ำเงิน", emoji: "🔵", color: "#2563eb", border: "#bfdbfe", bg: "#eff6ff" },
  { key: "red",   label: "สายสีแดง",   emoji: "🔴", color: "#dc2626", border: "#fecaca",  bg: "#fef2f2" },
  { key: "pool",  label: "คลังสำรอง",  emoji: "📦", color: "#64748b", border: "#e2e8f0", bg: "#f8fafc" },
];

export function DriverAssignmentBoard({ assignments, onChange }: Props) {
  const [draggedDriver, setDraggedDriver] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  // Reassign a driver to a new zone
  const assignDriver = useCallback((name: string, target: RouteKey | "pool") => {
    onChange({ ...assignments, [name]: target });
  }, [assignments, onChange]);

  // Drag handlers
  const onDragStart = useCallback((name: string) => {
    setDraggedDriver(name);
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggedDriver(null);
    setDragOverZone(null);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent, zoneKey: string) => {
    e.preventDefault();
    setDragOverZone(zoneKey);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOverZone(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent, zoneKey: RouteKey | "pool") => {
    e.preventDefault();
    if (draggedDriver) {
      assignDriver(draggedDriver, zoneKey);
    }
    setDraggedDriver(null);
    setDragOverZone(null);
  }, [draggedDriver, assignDriver]);

  // Group drivers by zone
  const grouped = ALL_DRIVERS.reduce<Record<string, string[]>>((acc, name) => {
    const z = assignments[name] ?? "pool";
    if (!acc[z]) acc[z] = [];
    acc[z].push(name);
    return acc;
  }, {});

  return (
    <div
      className="flex-shrink-0 border-b border-slate-200 bg-white"
    >
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-[0.5625rem] font-black uppercase tracking-widest text-slate-700">👥 จัดสรรคนขับ</span>
          <span className="text-[0.45rem] text-slate-500 italic">— ลากการ์ดเพื่อย้ายสาย</span>
        </div>
        <span className="text-[0.45rem] text-slate-500 font-bold">
          {ALL_DRIVERS.filter(n => (assignments[n] ?? "pool") === "pool").length} คนใน Pool
        </span>
      </div>

      {/* 4 drop zones */}
      <div className="flex items-stretch gap-0">
        {ZONES.map((zone, zi) => {
          const driversHere = grouped[zone.key] ?? [];
          const isOver = dragOverZone === zone.key;
          const count = driversHere.length;

          // Required count hint
          const reqMap: Record<string, number> = { green: 5, blue: 5, red: 4, pool: 0 };
          const req = reqMap[zone.key];
          const deficit = Math.max(0, req - count);
          const excess  = req > 0 ? Math.max(0, count - req) : 0;

          return (
            <div
              key={zone.key}
              className="flex-1 flex flex-col min-w-0 transition-all duration-150 relative"
              style={{
                background: isOver ? "#fff" : zone.bg,
                borderRight: zi < 3 ? `1px solid #e2e8f0` : undefined,
                boxShadow: isOver ? `inset 0 0 0 2px ${zone.color}` : "none",
              }}
              onDragOver={e => onDragOver(e, zone.key)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, zone.key as RouteKey | "pool")}
            >
              {/* Zone header */}
              <div
                className="flex items-center justify-between px-2.5 py-1.5"
                style={{ borderBottom: `1px solid ${zone.border}` }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{zone.emoji}</span>
                  <span className="text-[0.5625rem] font-black" style={{ color: zone.color }}>{zone.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "#fff",
                      color: zone.color,
                      border: `1px solid ${zone.color}40`,
                    }}
                  >
                    {count}{req > 0 ? `/${req}` : ""}
                  </span>
                  {deficit > 0 && (
                    <span className="text-[0.45rem] font-bold text-amber-600 bg-amber-100 px-1 rounded-sm border border-amber-200">-{deficit}</span>
                  )}
                  {excess > 0 && (
                    <span className="text-[0.45rem] font-bold text-cyan-700 bg-cyan-100 px-1 rounded-sm border border-cyan-200">+{excess}</span>
                  )}
                </div>
              </div>

              {/* Driver cards */}
              <div className="flex flex-wrap gap-1 p-2 min-h-[52px] content-start">
                {driversHere.map(name => {
                  const isDragging = draggedDriver === name;
                  return (
                    <DriverCard
                      key={name}
                      name={name}
                      zone={zone}
                      isDragging={isDragging}
                      onDragStart={() => onDragStart(name)}
                      onDragEnd={onDragEnd}
                      onDoubleClick={() => assignDriver(name, "pool")}
                    />
                  );
                })}

                {/* Empty drop hint */}
                {driversHere.length === 0 && !isOver && (
                  <p className="text-[0.45rem] text-slate-400 italic self-center w-full text-center py-1">
                    ลากการ์ดมาวางที่นี่
                  </p>
                )}
                {isOver && draggedDriver && (
                  <div
                    className="flex items-center justify-center px-2 py-1 rounded-lg border-2 border-dashed bg-white shadow-sm"
                    style={{ borderColor: zone.color }}
                  >
                    <span className="text-[0.45rem] font-bold" style={{ color: zone.color }}>
                      + {draggedDriver}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Driver Card ─────────────────────────────────────────────────────────

interface CardProps {
  name: string;
  zone: typeof ZONES[0];
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDoubleClick: () => void;
}

function DriverCard({ name, zone, isDragging, onDragStart, onDragEnd, onDoubleClick }: CardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDoubleClick={onDoubleClick}
      className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-grab active:cursor-grabbing select-none transition-all duration-100 shadow-sm"
      style={{
        background: isDragging ? "#ffffff" : "linear-gradient(to bottom, #ffffff, #f8fafc)",
        border: `1px solid ${zone.color}${isDragging ? "aa" : "30"}`,
        boxShadow: isDragging
          ? `0 10px 25px rgba(0,0,0,0.1), 0 0 0 2px ${zone.color}40`
          : `0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 #ffffff`,
        opacity: isDragging ? 0.7 : 1,
        transform: isDragging ? "scale(0.95)" : "scale(1)",
      }}
      title={`${name} (${zone.label}) — ลากเพื่อย้าย, ดับเบิลคลิกส่งไป Pool`}
    >
      {/* Drag handle dots */}
      <span className="text-[0.55rem] text-slate-300 leading-none">⠿</span>
      {/* Avatar circle */}
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center text-[0.4rem] font-black text-white flex-shrink-0 shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${zone.color}, ${zone.color}dd)`,
        }}
      >
        {name.charAt(0)}
      </div>
      {/* Name */}
      <span className="text-[0.5625rem] font-semibold leading-none" style={{ color: zone.color }}>
        {name}
      </span>
    </div>
  );
}
