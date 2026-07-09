"use client";

import React, { useState } from "react";
import { useFleetStore } from "@/lib/store/fleetStore";
import { Driver } from "@/types";
import { DriverDetailsModal } from "./DriverDetailsModal";
import { WeeklyDriverSchedule } from "./WeeklyDriverSchedule";
import { Search, ShieldCheck, Clock, Users } from "lucide-react";
import { FleetLoadingGate } from "@/components/FleetLoadingGate";

export const getRouteMeta = (route: string) => {
  const r = (route || "").toLowerCase();
  if (r.includes("red") || r.includes("แดง") || r.includes("l1")) {
    return {
      name: "สายสีแดง",
      color: "bg-red-500 text-white shadow-sm shadow-red-500/20 border-transparent",
      order: 1,
    };
  }
  if (r.includes("blue") || r.includes("น้ำเงิน") || r.includes("l2")) {
    return {
      name: "สายสีน้ำเงิน",
      color: "bg-blue-600 text-white shadow-sm shadow-blue-500/20 border-transparent",
      order: 2,
    };
  }
  if (r.includes("green") || r.includes("เขียว") || r.includes("l3")) {
    return {
      name: "สายสีเขียว",
      color: "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 border-transparent",
      order: 3,
    };
  }
  return {
    name: route,
    color: "bg-slate-500 text-white shadow-sm shadow-slate-500/20 border-transparent",
    order: 99,
  };
};

export function DriverDashboard() {
  const drivers = useFleetStore((state) => state.drivers);
  const reserveDrivers = useFleetStore((state) => state.reserveDrivers);
  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const filteredDrivers = drivers.filter((d) =>
    `${d.name} ${d.surname} ${d.code} ${d.vehicle}`.toLowerCase().includes(search.toLowerCase())
  );

  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    const metaA = getRouteMeta(a.route);
    const metaB = getRouteMeta(b.route);
    if (metaA.order !== metaB.order) return metaA.order - metaB.order;
    return (a.vehicle || "").localeCompare(b.vehicle || "");
  });

  // Overall Stats Calculation
  const totalActive = drivers.filter((d) => d.status === "Active").length;
  const avgOnTime =
    drivers.reduce((acc, d) => acc + (d.performance?.onTimeRate || 0), 0) / (drivers.length || 1);
  const avgDelay =
    drivers.reduce((acc, d) => acc + (d.performance?.avgDelay || 0), 0) / (drivers.length || 1);

  return (
    <FleetLoadingGate>
      <div className="space-y-6">
        {/* Weekly Schedule Section */}
        <WeeklyDriverSchedule drivers={drivers} reserveDrivers={reserveDrivers} />

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">พนักงานพร้อมวิ่ง</p>
              <p className="text-2xl font-bold text-slate-800">
                {totalActive} / {drivers.length} คน
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">เข้าป้ายตรงเวลา (เฉลี่ย)</p>
              <p className="text-2xl font-bold text-slate-800">{avgOnTime.toFixed(1)}%</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">ความล่าช้าเฉลี่ย</p>
              <p className="text-2xl font-bold text-slate-800">{avgDelay.toFixed(1)} นาที</p>
            </div>
          </div>
        </div>

        {/* Driver Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800">รายชื่อพนักงานขับรถ</h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส, รถ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="py-3 px-4 font-semibold">สายที่ประจำ</th>
                  <th className="py-3 px-4 font-semibold">ชื่อ - นามสกุล</th>
                  <th className="py-3 px-4 font-semibold">รหัสพนักงาน</th>
                  <th className="py-3 px-4 font-semibold">รถหมายเลข</th>
                  <th className="py-3 px-4 font-semibold text-center">เข้าป้ายตรงเวลา</th>
                  <th className="py-3 px-4 font-semibold text-center">ความล่าช้า (เฉลี่ย)</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {sortedDrivers.map((driver) => {
                  const p = driver.performance;
                  const isOnTimeGood = p && p.onTimeRate >= 90;
                  const isOnTimeOk = p && p.onTimeRate >= 80 && p.onTimeRate < 90;
                  const routeMeta = getRouteMeta(driver.route);

                  return (
                    <tr
                      key={driver.id}
                      onClick={() => setSelectedDriver(driver)}
                      className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 h-7 rounded-lg text-xs font-semibold border ${routeMeta.color}`}
                        >
                          {routeMeta.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200/60">
                          {driver.name.charAt(0)}
                        </div>
                        {driver.name} {driver.surname}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{driver.code}</td>
                      <td className="py-3 px-4 font-medium">{driver.vehicle}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            isOnTimeGood
                              ? "bg-emerald-50 text-emerald-600"
                              : isOnTimeOk
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-600"
                          }`}
                        >
                          {Math.round(p?.onTimeRate ?? 0)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-slate-600 font-medium">
                          {(p?.avgDelay ?? 0).toFixed(1)} นาที
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {sortedDrivers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      ไม่พบข้อมูลคนขับ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Driver Details Modal */}
        {selectedDriver && (
          <DriverDetailsModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
        )}
      </div>
    </FleetLoadingGate>
  );
}
