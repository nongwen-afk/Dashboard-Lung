"use client";

import React, { useState } from "react";
import { useFleetStore } from "@/lib/store/fleetStore";
import { useHydrateFleet } from "@/hooks/useHydrateFleet";
import { Driver } from "@/types";
import { DriverDetailsModal } from "./DriverDetailsModal";
import { Search, ShieldCheck, Clock, Users, Loader2 } from "lucide-react";

export function DriverDashboard() {
  const { isLoading, error } = useHydrateFleet();
  const drivers = useFleetStore((state) => state.drivers);

  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-600 font-medium">Loading Drivers Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 w-full items-center justify-center flex-col gap-4">
        <p className="text-red-500 font-medium text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredDrivers = drivers.filter((d) =>
    `${d.name} ${d.surname} ${d.code} ${d.vehicle}`.toLowerCase().includes(search.toLowerCase())
  );

  // Overall Stats Calculation
  const totalActive = drivers.filter((d) => d.status === "Active").length;
  const avgOnTime =
    drivers.reduce((acc, d) => acc + (d.performance?.onTimeRate || 0), 0) / (drivers.length || 1);
  const avgDelay =
    drivers.reduce((acc, d) => acc + (d.performance?.avgDelay || 0), 0) / (drivers.length || 1);

  return (
    <div className="space-y-6">
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
                <th className="py-3 px-4 font-semibold">ชื่อ - นามสกุล</th>
                <th className="py-3 px-4 font-semibold">รหัสพนักงาน</th>
                <th className="py-3 px-4 font-semibold">สายที่ประจำ</th>
                <th className="py-3 px-4 font-semibold">รถหมายเลข</th>
                <th className="py-3 px-4 font-semibold text-center">เข้าป้ายตรงเวลา</th>
                <th className="py-3 px-4 font-semibold text-center">ความล่าช้า (เฉลี่ย)</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {filteredDrivers.map((driver) => {
                const p = driver.performance;
                const isOnTimeGood = p && p.onTimeRate >= 90;
                const isOnTimeOk = p && p.onTimeRate >= 80 && p.onTimeRate < 90;

                return (
                  <tr
                    key={driver.id}
                    onClick={() => setSelectedDriver(driver)}
                    className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {driver.name.charAt(0)}
                      </div>
                      {driver.name} {driver.surname}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{driver.code}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                        {driver.route}
                      </span>
                    </td>
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
                        {p?.onTimeRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-slate-600 font-medium">{p?.avgDelay} นาที</span>
                    </td>
                  </tr>
                );
              })}
              {filteredDrivers.length === 0 && (
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
  );
}
