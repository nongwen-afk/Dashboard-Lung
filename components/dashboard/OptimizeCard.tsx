"use client";

import { Settings2 } from "lucide-react";
import { useFleetStore } from "@/lib/store/fleetStore";

export function OptimizeCard() {
  const { showToast } = useFleetStore();

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-gradient-to-br from-[#e8590c] to-[#f5941e] rounded-2xl px-5 py-3 text-white shadow-xl shadow-orange-500/30 min-w-[13.125rem]">
        <div className="flex items-center gap-2 mb-2.5">
          <Settings2 className="w-5 h-5" />
          <span className="font-bold text-[0.9375rem]">Optimize Routes</span>
        </div>
        <p className="text-[0.625rem] text-orange-100 mb-3">(โยกย้าย/จัดคิวใหม่)</p>
        <div className="flex gap-2">
          <button
            onClick={() => showToast("กำลังจัดคนขับใหม่...")}
            className="bg-white/20 hover:bg-white/35 text-white text-[0.625rem] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95"
          >
            Reassign Driver
          </button>
          <button
            onClick={() => showToast("กำลังจัดรถใหม่...")}
            className="bg-white/20 hover:bg-white/35 text-white text-[0.625rem] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95"
          >
            Reassign Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}
