/* eslint-disable react-hooks/set-state-in-effect */

/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState, useEffect } from "react";
import { X, CalendarIcon, ArrowUp, ArrowDown, Save } from "lucide-react";
import { useFleetStore } from "@/lib/store/fleetStore";
import { ROUTES } from "@/lib/mock-data";
import type { RouteId, RouteRotationConfig } from "@/types";

interface RotationConfigModalProps {
  open: boolean;
  onClose: () => void;
  initialRoute: RouteId;
}

export function RotationConfigModal({ open, onClose, initialRoute }: RotationConfigModalProps) {
  const { drivers, rotationConfigs, setRotationConfig } = useFleetStore();
  const [activeRoute, setActiveRoute] = useState<RouteId>(initialRoute);

  // Local state for the form
  const [startDateStr, setStartDateStr] = useState<string>("");
  const [orderedDrivers, setOrderedDrivers] = useState<
    { id: number; name: string; code: string }[]
  >([]);

  // Initialize or reset form when route changes or modal opens
  useEffect(() => {
    if (open) {
      const existingConfig = rotationConfigs[activeRoute];
      const routeDrivers = drivers.filter((d) => d.routeId === activeRoute);

      if (existingConfig && existingConfig.driverIds.length === routeDrivers.length) {
        setStartDateStr(existingConfig.startDate);
        // Map saved IDs back to driver objects for display
        const mapped = existingConfig.driverIds
          .map((id) => {
            const d = routeDrivers.find((driver) => driver.id === id);
            return d ? { id: d.id, name: d.name, code: d.code } : null;
          })
          .filter(Boolean) as any[];
        setOrderedDrivers(mapped);
      } else {
        // Default to today
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        setStartDateStr(`${yyyy}-${mm}-${dd}`);

        // Default order
        setOrderedDrivers(routeDrivers.map((d) => ({ id: d.id, name: d.name, code: d.code })));
      }
    }
  }, [open, activeRoute, drivers, rotationConfigs]);

  if (!open) return null;

  const routeObj = ROUTES.find((r) => r.id === activeRoute)!;

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...orderedDrivers];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    setOrderedDrivers(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === orderedDrivers.length - 1) return;
    const newOrder = [...orderedDrivers];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    setOrderedDrivers(newOrder);
  };

  const handleSave = () => {
    if (!startDateStr) {
      alert("กรุณาเลือกวันที่เริ่มต้น");
      return;
    }
    const config: RouteRotationConfig = {
      routeId: activeRoute,
      startDate: startDateStr,
      driverIds: orderedDrivers.map((d) => d.id),
    };
    setRotationConfig(activeRoute, config);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-[1000]"
      style={{
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">ตั้งค่าคิวเดินรถ</h2>
            <p className="text-xs text-slate-500">กำหนดลำดับคนขับและวันเริ่มต้น</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Route Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
              1. เลือกสายการเดินรถ
            </label>
            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              {ROUTES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveRoute(r.id)}
                  className="flex-1 text-[0.75rem] font-bold py-2 rounded-lg transition-all duration-200"
                  style={
                    activeRoute === r.id
                      ? {
                          background: "white",
                          color: r.color,
                          boxShadow: "0 2px 8px rgba(26,26,46,0.06)",
                        }
                      : {
                          background: "transparent",
                          color: "#64748b",
                        }
                  }
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
              2. วันที่เริ่มต้นใช้คิวนี้
            </label>
            <div className="relative">
              <CalendarIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <p className="text-[0.625rem] text-slate-400 mt-1.5">
              คิวคนขับที่คุณจัดเรียงด้านล่าง จะถูกนำไปใช้เป็นลำดับแรก (คิวเช้าสุด) ของวันที่คุณเลือก
            </p>
          </div>

          {/* Driver Ordering */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
              3. จัดเรียงลำดับคนขับ
            </label>
            <div className="space-y-2">
              {orderedDrivers.map((driver, index) => (
                <div
                  key={driver.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white"
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: index === 0 ? routeObj.color : "#e2e8f0",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[0.625rem] font-bold text-slate-500">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{driver.name}</p>
                      <p className="text-[0.625rem] text-slate-400">{driver.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === orderedDrivers.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[0.625rem] text-slate-400 mt-2 text-center">
              ใช้ลูกศร ขึ้น/ลง เพื่อสลับตำแหน่ง
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${routeObj.color}, ${routeObj.color}dd)`,
            }}
          >
            <Save className="w-4 h-4" />
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
}
