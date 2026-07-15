"use client";

import { BusFront, Clock3, Coffee, UsersRound } from "lucide-react";
import { MOCK_ROUTE_VEHICLES } from "@/components/routes/mockRouteVehicles";
import { useFleetStore } from "@/lib/store/fleetStore";

export function FleetOverviewSummary() {
  const reserveDrivers = useFleetStore((state) => state.reserveDrivers);
  const vehicles = Object.values(MOCK_ROUTE_VEHICLES).flat();
  const inService = vehicles.filter(
    (vehicle) => vehicle.status !== "พัก" && vehicle.status !== "จบรอบ"
  ).length;
  const aboutToLeave = vehicles.filter((vehicle) => vehicle.status === "กำลังจะออก").length;
  const resting = vehicles.filter((vehicle) => vehicle.status === "พัก").length;
  const reserveReady = reserveDrivers.filter((driver) => driver.status === "Available").length;

  const metrics = [
    {
      label: "รถให้บริการ",
      value: `${inService}/${vehicles.length}`,
      icon: BusFront,
      color: "#1e3a8a",
    },
    { label: "กำลังจะออก", value: aboutToLeave, icon: Clock3, color: "#2563eb" },
    { label: "รถพัก", value: resting, icon: Coffee, color: "#64748b" },
    { label: "สำรองพร้อม", value: reserveReady, icon: UsersRound, color: "#15803d" },
  ];

  return (
    <section aria-label="ภาพรวมกองรถ">
      <div className="grid grid-cols-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`flex min-h-[58px] min-w-0 items-center gap-1.5 px-2 py-2 ${index > 0 ? "border-l border-slate-100" : ""}`}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: metric.color }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-600">{metric.label}</p>
                <p className="text-lg font-bold leading-tight text-slate-900">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
