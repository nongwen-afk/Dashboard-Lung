"use client";

import { ReserveDriverCard } from "./ReserveDriverCard";
import { useFleetStore } from "@/store/fleetStore";
import { Users } from "lucide-react";

export function ReservePool() {
  const { reserveDrivers, panelsCollapsed } = useFleetStore();

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex items-baseline gap-1.5 flex-1"
        >
          <p className="text-[0.975rem] font-bold text-[#0f172a]">Reserve Pool</p>
          <p className="text-[0.825rem] text-gray-400">กลุ่มคนสำรอง</p>
        </div>
        <span
          className="text-[0.675rem] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.10), rgba(59,130,246,0.06))",
            color: "#1e3a8a",
            border: "1px solid rgba(37,99,235,0.18)",
          }}
        >
          {reserveDrivers.filter(d => d.status !== "Assigned").length} available
        </span>
      </div>
      <div
        className="grid gap-2.5"
        style={{
          gridTemplateColumns: panelsCollapsed
            ? "repeat(auto-fill, minmax(132px, 1fr))"
            : "repeat(2, 1fr)",
        }}
      >
        {reserveDrivers.map((r) => (
          <ReserveDriverCard key={r.id} driver={r} />
        ))}
      </div>
    </div>
  );
}
