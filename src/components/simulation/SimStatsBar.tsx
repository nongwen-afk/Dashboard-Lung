"use client";

import { useMemo } from "react";
import { ROUTE_META, type MultiRouteSimResult, type RouteKey } from "@/lib/simulationEngine";

interface Props {
  multiResult: MultiRouteSimResult;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}

function StatCard({ icon, label, value, sub, color }: StatCardProps) {
  return (
    <div
      className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm border border-slate-100 relative overflow-hidden"
    >
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none opacity-5" style={{ background: color, filter: "blur(24px)" }} />
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 relative z-10" style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
        {icon}
      </div>
      <div className="min-w-0 relative z-10">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-black leading-none" style={{ color }}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1.5 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

interface RouteStatProps {
  route: RouteKey;
  result: MultiRouteSimResult[RouteKey];
}

function RouteStat({ route, result }: RouteStatProps) {
  const meta = ROUTE_META[route];
  const avgH = (result.avgWorkHours).toFixed(1);
  const coverColor = result.coverageRate >= 95 ? "#16a34a" : result.coverageRate >= 80 ? "#d97706" : "#dc2626";

  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 bottom-0 w-1.5" style={{ background: meta.color }} />
      
      <div className="flex items-center justify-between ml-2">
        <span className="text-lg font-black flex items-center gap-2" style={{ color: meta.color }}>
          <span className="text-2xl">{route === "green" ? "🟢" : route === "blue" ? "🔵" : "🔴"}</span> {meta.label}
        </span>
        <span className="text-lg font-black px-3 py-1 rounded-lg" style={{ color: coverColor, background: `${coverColor}15` }}>
          {result.coverageRate.toFixed(0)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2 ml-2">
        <div>
          <p className="text-xs text-slate-500 font-semibold mb-1">คนขับ</p>
          <p className="text-xl font-bold text-slate-800">{result.totalDrivers} <span className="text-sm text-slate-500">คน</span></p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold mb-1">รอบวิ่ง</p>
          <p className="text-xl font-bold text-slate-800">{result.totalTrips} <span className="text-sm text-slate-500">รอบ</span></p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold mb-1">เวลาเฉลี่ย</p>
          <p className="text-xl font-bold text-slate-800">{avgH} <span className="text-sm text-slate-500">ชม./คน</span></p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold mb-1">ทำ OT</p>
          <p className="text-xl font-bold text-slate-800">{result.totalOTCount > 0 ? <span className="text-amber-600">{result.totalOTCount} <span className="text-sm">ครั้ง</span></span> : "0 ครั้ง"}</p>
        </div>
      </div>

      {/* Coverage bar */}
      <div className="mt-2 ml-2">
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
          <span>ความครอบคลุมเที่ยววิ่ง</span>
        </div>
        <div className="h-2 rounded-full w-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${result.coverageRate}%`, background: meta.color }}
          />
        </div>
      </div>
    </div>
  );
}

export function SimStatsBar({ multiResult }: Props) {
  const combined = useMemo(() => {
    const routes = ["green", "blue", "red"] as RouteKey[];
    const totalTrips = routes.reduce((s, r) => s + multiResult[r].totalTrips, 0);
    const covered = routes.reduce((s, r) => s + Math.round(multiResult[r].coverageRate * multiResult[r].totalTrips / 100), 0);
    const totalDrivers = routes.reduce((s, r) => s + multiResult[r].totalDrivers, 0);
    const totalOT = routes.reduce((s, r) => s + multiResult[r].totalOTCount, 0);
    const totalPay = routes.reduce((s, r) => s + multiResult[r].totalOTPay, 0);
    const allDriversFlat = routes.flatMap(r => multiResult[r].drivers);
    const avgHours = allDriversFlat.length > 0
      ? allDriversFlat.reduce((s, d) => s + d.workMinutes, 0) / allDriversFlat.length / 60
      : 0;
    const allTrips = allDriversFlat.map(d => d.trips.length);
    const sdTrips = allTrips.length > 1
      ? Math.sqrt(allTrips.reduce((s, v, _, a) => { const m = a.reduce((x, y) => x + y, 0) / a.length; return s + (v - m) ** 2; }, 0) / allTrips.length)
      : 0;
    const coverPct = totalTrips > 0 ? (covered / totalTrips) * 100 : 0;

    return { totalTrips, totalDrivers, totalOT, totalPay, avgHours, sdTrips, coverPct };
  }, [multiResult]);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Combined KPIs */}
      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">ข้อมูลสรุปรวมทั้งหมด (Overview)</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🚌" label="รอบรวมทั้งหมด" value={combined.totalTrips} sub={`ครอบคลุม ${combined.coverPct.toFixed(0)}%`} color={combined.coverPct >= 90 ? "#16a34a" : "#d97706"} />
        <StatCard icon="👥" label="คนขับทั้งหมด" value={combined.totalDrivers} sub={`3 สายพร้อมกัน`} color="#4f46e5" />
        <StatCard icon="⏱️" label="เวลาเฉลี่ย/คน" value={`${combined.avgHours.toFixed(1)} ชม.`} sub={`SD (กระจายงาน) ${combined.sdTrips.toFixed(1)} รอบ`} color="#7c3aed" />
        <StatCard icon="💰" label="ค่าใช้จ่าย OT รวม" value={`฿${combined.totalPay.toLocaleString()}`} sub={`เกิด OT ${combined.totalOT} ครั้ง`} color="#ea580c" />
      </div>

      <hr className="border-slate-200 my-2" />

      {/* Per-route detail stats */}
      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">แยกตามสายการเดินรถ (Per Route)</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["green", "blue", "red"] as RouteKey[]).map(r => (
          <RouteStat key={r} route={r} result={multiResult[r]} />
        ))}
      </div>
      
    </div>
  );
}
