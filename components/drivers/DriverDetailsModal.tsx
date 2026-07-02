"use client";

import React from "react";
import { Driver } from "@/types";
import { X, User, Bus, Star, Activity, CheckCircle2, AlertCircle } from "lucide-react";

interface DriverDetailsModalProps {
  driver: Driver;
  onClose: () => void;
}

export function DriverDetailsModal({ driver, onClose }: DriverDetailsModalProps) {
  const p = driver.performance;

  if (!p) return null;

  const isGood = p.onTimeRate >= 90;
  const isOk = p.onTimeRate >= 80 && p.onTimeRate < 90;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm">
              {driver.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {driver.name} {driver.surname}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                รหัส: {driver.code} • ประสบการณ์ {driver.experience} ปี
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Assignment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
              <Bus className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">สายประจำ / รถ</p>
                <p className="text-sm font-bold text-slate-800">
                  {driver.route} • {driver.vehicle}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div>
                <p className="text-xs text-slate-500">คะแนนประเมินรวม</p>
                <p className="text-sm font-bold text-slate-800">{p.rating} / 5.0</p>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              สถิติการเดินรถ (เดือนปัจจุบัน)
            </h4>

            <div className="space-y-5">
              {/* On-time Rate Bar */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-medium text-slate-600">เข้าป้ายตรงเวลา</span>
                  <span
                    className={`text-sm font-bold ${
                      isGood ? "text-emerald-600" : isOk ? "text-amber-600" : "text-red-600"
                    }`}
                  >
                    {p.onTimeRate}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isGood ? "bg-emerald-500" : isOk ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${p.onTimeRate}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isGood
                    ? "ประสิทธิภาพยอดเยี่ยม เกินเป้าหมาย 90%"
                    : isOk
                      ? "ประสิทธิภาพระดับปานกลาง ควรระวังช่วงรถติด"
                      : "ประสิทธิภาพต่ำกว่าเกณฑ์ ต้องติดตามสาเหตุความล่าช้า"}
                </p>
              </div>

              <hr className="border-slate-100" />

              {/* Lateness Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">ความล่าช้าเฉลี่ย</p>
                  <div className="flex items-center gap-2">
                    {p.avgDelay <= 3 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    )}
                    <span className="text-xl font-bold text-slate-800">
                      {p.avgDelay} <span className="text-sm text-slate-500 font-medium">นาที</span>
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">จำนวนรอบวิ่งรวม</p>
                  <p className="text-xl font-bold text-slate-800">
                    {p.totalTrips} <span className="text-sm text-slate-500 font-medium">รอบ</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
