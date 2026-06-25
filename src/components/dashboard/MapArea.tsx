"use client";

import { MapBackground } from "./MapBackground";
import { RouteOverviewPanel } from "@/components/routes/RouteOverviewPanel";
import { FleetChart } from "@/components/charts/FleetChart";
import { useFleetStore } from "@/store/fleetStore";
import { Maximize, Minimize } from "lucide-react";

export function MapArea() {
  const { mapOnly, toggleMapOnly } = useFleetStore();

  return (
    // Fills the entire parent container — RightPanel and toggle button are siblings (not inside here)
    <div className="absolute inset-0">
      {/* Full-bleed map */}
      <div className="absolute inset-0 overflow-hidden">
        <MapBackground />
      </div>

      {/* Floating button to restore panels when Map Only mode is active */}
      {mapOnly && (
        <div className="absolute bottom-6 right-6 z-[900] hidden md:block">
          <button
            onClick={toggleMapOnly}
            title="แสดงหน้าต่าง (Show Panels)"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)", border: "1px solid rgba(0,0,0,0.05)" }}
          >
            <Minimize className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      )}

      {/* Left curtain overlay */}
      <RouteOverviewPanel />

      {/* Fleet chart overlay (top area) */}
      <div style={{ transition: "opacity 0.3s", opacity: mapOnly ? 0 : 1, pointerEvents: mapOnly ? "none" : "auto" }}>
        <FleetChart />
      </div>
    </div>
  );
}
