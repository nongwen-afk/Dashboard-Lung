"use client";

import { useMemo } from "react";
import { BusFront } from "lucide-react";
import { useFleetStore } from "@/lib/store/fleetStore";
import { getNextDepartures } from "@/lib/mock-data/timetables";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import type { RouteId } from "@/types";
import {
  MOCK_ROUTE_VEHICLES,
  VEHICLE_STATUS_ORDER,
  type VehiclePreviewStatus,
} from "./mockRouteVehicles";

interface ActiveTripsSectionProps {
  onShowVehicles: (routeId: RouteId) => void;
}

export function ActiveTripsSection({ onShowVehicles }: ActiveTripsSectionProps) {
  const routes = useFleetStore((state) => state.routes);
  const now = useCurrentTime(1000);

  const routeSummaries = useMemo(
    () =>
      routes.map((route) => {
        const vehicles = MOCK_ROUTE_VEHICLES[route.id];
        const statusCounts = Object.keys(VEHICLE_STATUS_ORDER)
          .map((status) => ({
            status: status as VehiclePreviewStatus,
            count: vehicles.filter((vehicle) => vehicle.status === status).length,
          }))
          .filter(({ count }) => count > 0);
        const nextVehicle =
          vehicles.find((vehicle) => vehicle.status === "กำลังจะออก") ?? vehicles[0];
        const nextDeparture = getNextDepartures(route.id, now, 1)[0]?.time ?? "-";
        const passengerTotal = vehicles.reduce(
          (total, vehicle) => total + vehicle.passengerCount,
          0
        );

        return {
          route,
          statusText: statusCounts.map(({ status, count }) => `${count} ${status}`).join(" · "),
          nextVehicle: nextVehicle.code,
          nextDeparture,
          averagePassengers: Math.round(passengerTotal / vehicles.length),
          maxPassengers: Math.max(...vehicles.map((vehicle) => vehicle.passengerCount)),
        };
      }),
    [now, routes]
  );

  return (
    <section aria-labelledby="route-operations-heading">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 id="route-operations-heading" className="text-base font-bold text-slate-900">
            สถานะรถแต่ละสาย
          </h3>
          <p className="text-[13px] text-slate-500">ภาพรวมรถทั้ง 5 คันต่อสาย</p>
        </div>
      </div>

      <div className="space-y-2">
        {routeSummaries.map(
          ({ route, statusText, nextVehicle, nextDeparture, averagePassengers, maxPassengers }) => (
            <article
              key={route.id}
              className="min-h-[96px] rounded-xl border border-slate-200 border-l-4 bg-white px-3 py-2.5"
              style={{ borderLeftColor: route.color, backgroundColor: route.bgColor }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] font-bold text-slate-900">
                  {route.labelTh} <span className="font-medium text-slate-600">· รถ 5 คัน</span>
                </p>
                <button
                  type="button"
                  title="ดูรถในสายนี้ 5 คัน"
                  aria-label={`ดูรถใน${route.labelTh} 5 คัน`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onShowVehicles(route.id);
                  }}
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#1e3a8a] shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  <BusFront className="h-4 w-4" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1e3a8a] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                    5
                  </span>
                </button>
              </div>
              <p className="mt-1 truncate text-[13px] font-medium text-slate-700">{statusText}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-[13px] text-slate-600">
                <span className="truncate">
                  รอบถัดไป {nextVehicle} · {nextDeparture}
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  เฉลี่ย {averagePassengers}/20 · สูงสุด {maxPassengers}/20
                </span>
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}
