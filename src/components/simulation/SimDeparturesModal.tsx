"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ROUTE_DEPARTURES,
  ROUTE_META,
  minToTime,
  type RouteKey,
  type DayTypeKey,
} from "@/lib/simulationEngine";

interface Props {
  customDepartures?: Record<RouteKey, Record<DayTypeKey, number[]>>;
  onChange: (newDepartures: Record<RouteKey, Record<DayTypeKey, number[]>> | undefined) => void;
  onClose: () => void;
}

export function SimDeparturesModal({ customDepartures, onChange, onClose }: Props) {
  const [activeRoute, setActiveRoute] = useState<RouteKey>("green");
  const [activeDayType, setActiveDayType] = useState<DayTypeKey>("weekday");
  const currentDepartures = customDepartures || ROUTE_DEPARTURES;
  const [newTimeStr, setNewTimeStr] = useState("");

  const activeList = currentDepartures[activeRoute][activeDayType];

  const handleAdd = () => {
    if (!newTimeStr) return;
    const parts = newTimeStr.split(":");
    if (parts.length !== 2) return;
    
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return;
    
    const minFromMid = h * 60 + m;
    
    if (activeList.includes(minFromMid)) return; // Prevent exact duplicates
    
    const newList = [...activeList, minFromMid].sort((a, b) => a - b);
    const updated = {
      ...currentDepartures,
      [activeRoute]: {
        ...currentDepartures[activeRoute],
        [activeDayType]: newList,
      }
    };
    
    onChange(updated);
    setNewTimeStr("");
  };

  const handleDelete = (index: number) => {
    const newList = [...activeList];
    newList.splice(index, 1);
    
    const updated = {
      ...currentDepartures,
      [activeRoute]: {
        ...currentDepartures[activeRoute],
        [activeDayType]: newList,
      }
    };
    
    onChange(updated);
  };

  const handleReset = () => {
    // Reset to defaults
    onChange(undefined);
  };

  return (
    <div className="flex flex-col h-full bg-white min-h-0">
      {/* Header controls inside modal body */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex gap-2">
          {(["green", "blue", "red"] as RouteKey[]).map(r => (
            <button
              key={r}
              onClick={() => setActiveRoute(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border ${activeRoute === r ? "bg-white shadow-sm" : "bg-transparent border-transparent opacity-60 hover:opacity-100"}`}
              style={{ 
                color: activeRoute === r ? ROUTE_META[r].color : undefined,
                borderColor: activeRoute === r ? `${ROUTE_META[r].color}40` : undefined,
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: ROUTE_META[r].color }} />
              {ROUTE_META[r].label}
            </button>
          ))}
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-lg">
          {(["weekday", "weekend"] as DayTypeKey[]).map(d => (
            <button
              key={d}
              onClick={() => setActiveDayType(d)}
              className={`px-3 py-1 text-[0.65rem] font-bold rounded-md transition-all ${activeDayType === d ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
            >
              {d === "weekday" ? "วันธรรมดา (Weekday)" : "เสาร์-อาทิตย์ (Weekend)"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 bg-slate-100/50 flex-1 overflow-y-auto min-h-0 overscroll-contain touch-pan-y">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: ROUTE_META[activeRoute].color }}></span>
              ตารางรอบวิ่ง {ROUTE_META[activeRoute].label} — {activeDayType === "weekday" ? "วันธรรมดา" : "วันหยุด"}
            </h4>
            <p className="text-xs text-slate-500 mt-1">ทั้งหมด {activeList.length} รอบ</p>
          </div>
          
          <div className="flex gap-2 items-center">
            <input 
              type="time" 
              value={newTimeStr}
              onChange={(e) => setNewTimeStr(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={handleAdd}
              disabled={!newTimeStr}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              + เพิ่มรอบใหม่
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {activeList.map((dep, index) => (
            <div 
              key={`${dep}-${index}`}
              className="relative group bg-white border border-slate-200 rounded-lg p-2 text-center hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <span className="text-xs font-bold text-slate-700">{minToTime(dep)}</span>
              <button 
                onClick={() => handleDelete(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-100 text-red-600 rounded-full text-[0.6rem] font-bold border border-red-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>
          ))}
          {activeList.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-xl">
              ไม่มีรอบวิ่งในวันนี้
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between">
        <button 
          onClick={handleReset}
          className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          คืนค่าเริ่มต้น (Excel)
        </button>
        
        <button 
          onClick={onClose}
          className="px-6 py-2 text-sm font-bold text-white bg-slate-800 rounded-lg shadow-sm hover:bg-slate-700 transition-colors"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}
