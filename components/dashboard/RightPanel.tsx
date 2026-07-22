"use client";

import { useState } from "react";
import { ReservePool } from "@/components/drivers/ReservePool";
import { DriverTable } from "@/components/drivers/DriverTable";
import { ArrowRightLeft, BusFront, Users } from "lucide-react";
import { RouteVehiclesDialog } from "@/components/routes/RouteVehiclesDialog";
import { useFleetStore } from "@/lib/store/fleetStore";
import { ROUTES } from "@/lib/mock-data";
import { useOperationalFleet } from "@/hooks/useOperationalFleet";
import type { RouteId } from "@/types";

export function RightPanel() {
  const { panelsCollapsed, mapOnly, openDispatchPanel } = useFleetStore();
  const { routeStats, serviceDate } = useOperationalFleet();
  const [vehiclesOpen, setVehiclesOpen] = useState(false);
  const [vehiclesRoute, setVehiclesRoute] = useState<RouteId>("L1");

  const openVehicles = (routeId: RouteId) => {
    setVehiclesRoute(routeId);
    setVehiclesOpen(true);
  };

  return (
    <aside
      style={{
        /* Absolutely positioned overlay anchored to the right edge */
        position: "absolute",
        right: panelsCollapsed ? 0 : 12,
        top: panelsCollapsed ? 0 : 12,
        bottom: panelsCollapsed ? 0 : 12,
        zIndex: 800,
        /* Curtain animation: expands from 23.125rem → 50 % when closing */
        width: panelsCollapsed ? "50%" : "var(--right-panel-width)",
        borderRadius: panelsCollapsed ? "16px 0px 0px 16px" : "16px",
        transform: mapOnly ? "translateX(120%)" : "translateX(0)",
        opacity: mapOnly ? 0 : 1,
        pointerEvents: mapOnly ? "none" : "auto",
        transition:
          "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), width 0.5s cubic-bezier(0.4, 0, 0.2, 1), right 0.5s cubic-bezier(0.4, 0, 0.2, 1), top 0.5s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%)",
        border: panelsCollapsed ? "none" : "1px solid rgba(26,26,46,0.06)",
        boxShadow: panelsCollapsed
          ? "-4px 0 32px rgba(26,26,46,0.08)"
          : "0 8px 32px rgba(26,26,46,0.14), 0 2px 8px rgba(26,26,46,0.08)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        willChange: "transform, width, right, top, bottom, opacity",
        contain: "layout paint style",
      }}
    >
      {/* Panel Header */}
      <div
        className="px-4 py-3 flex-shrink-0 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
          boxShadow: "0 2px 16px rgba(26,26,46,0.3)",
        }}
      >
        {/* Decorative gradient blob */}
        <div
          className="absolute -top-4 -right-4 w-24 h-24 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-32 h-8 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(71,85,105,0.10) 0%, transparent 70%)",
          }}
        />

        <div className="flex items-center gap-2.5 relative z-10">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.9), rgba(59,130,246,0.9))",
              boxShadow: "0 2px 12px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-[1.05rem] font-bold text-white leading-tight">
              Fleet Management &amp; Reserve Pool
            </h2>
            <p className="text-[0.75rem] text-slate-400 mt-0.5">การจัดการรถ คนขับ และกำลังสำรอง</p>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-[0.0625rem]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(37,99,235,0.30), rgba(71,85,105,0.25), transparent)",
          }}
        />
      </div>

      {/* Panel Body */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-24">
        <div className="space-y-3">
          <section aria-labelledby="route-vehicles-heading">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h3 id="route-vehicles-heading" className="text-sm font-bold text-slate-900">
                  รถรายสาย
                </h3>
                <p className="text-xs text-slate-500">เลือกสายเพื่อดูรถและผู้โดยสาร</p>
              </div>
              <button
                type="button"
                onClick={openDispatchPanel}
                className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 text-xs font-bold text-blue-900 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden="true" />
                จัดการรถ
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ROUTES.map((route) => {
                const stats = routeStats[route.id];
                const vehicleCount = stats.activeVehicles;

                return (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => openVehicles(route.id)}
                    aria-label={`ดูรถใน${route.labelTh} ${vehicleCount} คัน`}
                    className="flex min-h-16 min-w-0 flex-col items-center justify-center rounded-xl border px-1.5 py-2 text-center transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                    style={{ borderColor: `${route.color}40`, backgroundColor: route.bgColor }}
                  >
                    <BusFront
                      className="mb-1 h-4 w-4 shrink-0"
                      style={{ color: route.color }}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-bold leading-tight text-slate-800">
                      {route.labelTh}
                    </span>
                    <span className="mt-0.5 text-xs font-medium text-slate-600">
                      {vehicleCount} คัน
                    </span>
                    {stats.borrowedVehicles > 0 || stats.lentVehicles > 0 ? (
                      <span className="mt-0.5 text-[10px] font-semibold text-slate-600">
                        {stats.borrowedVehicles > 0
                          ? `ยืม ${stats.borrowedVehicles}`
                          : `ให้ยืม ${stats.lentVehicles}`}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-label="จัดการคนขับ" className="space-y-3 border-t border-slate-100 pt-3">
            <ReservePool compact />

            <div className="border-t border-slate-100 pt-3">
              <DriverTable />
            </div>
          </section>
        </div>
      </div>
      <RouteVehiclesDialog
        key={`${vehiclesOpen}-${vehiclesRoute}-${serviceDate}`}
        open={vehiclesOpen}
        onClose={() => setVehiclesOpen(false)}
        initialRoute={vehiclesRoute}
      />
    </aside>
  );
}
