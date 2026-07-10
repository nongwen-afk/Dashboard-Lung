"use client";

import React from "react";
import { Driver } from "@/types";
import { X, User, Bus, Star, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRouteMeta } from "./DriverDashboard";

interface DriverDetailsModalProps {
  driver: Driver;
  onClose: () => void;
}

export function DriverDetailsModal({ driver, onClose }: DriverDetailsModalProps) {
  const p = driver.performance;
  const routeMeta = getRouteMeta(driver.route);

  if (!p) return null;

  const isGood = p.onTimeRate >= 90;
  const isOk = p.onTimeRate >= 80 && p.onTimeRate < 90;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-md w-[95%] sm:w-full max-w-xl rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold border border-blue-100/50 shadow-sm flex-shrink-0">
              {driver.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-800 truncate">
                {driver.name} {driver.surname}
              </h3>
              <p className="text-sm text-slate-500 font-medium truncate mt-0.5">
                รหัส: {driver.code} &middot; ประสบการณ์ {driver.experience} ปี
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Top Assignment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 flex items-center gap-3 transition-colors hover:bg-slate-50">
              <div className="p-2 bg-blue-100/50 rounded-lg">
                <Bus className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">สายประจำ / รถ</p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-bold border uppercase tracking-wide ${routeMeta.color}`}
                  >
                    {routeMeta.name}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    &middot; {driver.vehicle}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 flex items-center gap-3 transition-colors hover:bg-slate-50">
              <div className="p-2 bg-amber-100/50 rounded-lg">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">คะแนนประเมินรวม</p>
                <p className="text-sm font-bold text-slate-800">
                  {(p.rating ?? 0).toFixed(1)} / 5.0
                </p>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              สถิติการเดินรถ (เดือนปัจจุบัน)
            </h4>

            <div className="space-y-6 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              {/* On-time Rate Bar */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-slate-700">เข้าป้ายตรงเวลา</span>
                  <span
                    className={cn(
                      "text-lg font-bold tracking-tight",
                      isGood ? "text-emerald-600" : isOk ? "text-amber-600" : "text-red-600"
                    )}
                  >
                    {Math.round(p.onTimeRate ?? 0)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      isGood ? "bg-emerald-500" : isOk ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${Math.round(p.onTimeRate ?? 0)}%` }}
                  />
                </div>
                <p className="text-[0.8rem] text-slate-500 mt-2 font-medium">
                  {isGood
                    ? "ประสิทธิภาพยอดเยี่ยม เกินเป้าหมาย 90%"
                    : isOk
                      ? "ประสิทธิภาพระดับปานกลาง ควรระวังช่วงรถติด"
                      : "ประสิทธิภาพต่ำกว่าเกณฑ์ ต้องติดตามสาเหตุความล่าช้า"}
                </p>
              </div>

              <div className="h-px w-full bg-slate-100" />

              {/* Lateness Stats */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">ความล่าช้าเฉลี่ย</p>
                  <div className="flex items-center gap-2">
                    {p.avgDelay <= 3 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                      {(p.avgDelay ?? 0).toFixed(1)}{" "}
                      <span className="text-xs sm:text-sm text-slate-500 font-medium tracking-normal">
                        นาที
                      </span>
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">จำนวนรอบวิ่งรวม</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight pl-1">
                    {Math.round(p.totalTrips ?? 0)}{" "}
                    <span className="text-xs sm:text-sm text-slate-500 font-medium tracking-normal">
                      รอบ
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
