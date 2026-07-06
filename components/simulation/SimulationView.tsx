"use client";

import { useState, useMemo, useCallback } from "react";
import {
  runAllRoutes,
  defaultSharedConfig,
  DEFAULT_DRIVER_ASSIGNMENTS,
  ROUTE_META,
  type AssignmentMap,
  type SharedSimConfig,
  type MultiRouteSimResult,
  type RouteKey,
} from "@/lib/simulationEngine";
import { SimControlPanel } from "./SimControlPanel";
import { SimGanttBoard } from "./SimGanttBoard";
import { SimStatsBar } from "./SimStatsBar";
import { DriverAssignmentBoard } from "./DriverAssignmentBoard";
import { SimValidationAlerts } from "./SimValidationAlerts";
import { SimScheduleTable } from "./SimScheduleTable";
import { validateSimulation } from "@/lib/simulationValidation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export type SimActiveView = "all" | "green" | "blue" | "red";

export function SimulationView() {
  const [assignments, setAssignments] = useState<AssignmentMap>(DEFAULT_DRIVER_ASSIGNMENTS);
  const [config, setConfig] = useState<SharedSimConfig>(defaultSharedConfig());
  const [activeView, setActiveView] = useState<SimActiveView>("all");
  const [showAlerts, setShowAlerts] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  // Reactive simulation — re-runs instantly whenever assignments or config changes
  const multiResult: MultiRouteSimResult = useMemo(
    () => runAllRoutes(assignments, config),
    [assignments, config]
  );

  const validationSummary = useMemo(
    () => validateSimulation(multiResult, assignments, config),
    [multiResult, assignments, config]
  );

  const handleConfigChange = useCallback((updates: Partial<SharedSimConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => {
    setAssignments(DEFAULT_DRIVER_ASSIGNMENTS);
    setConfig(defaultSharedConfig());
  }, []);

  // Combined coverage for header badge
  const routes = ["green", "blue", "red"] as RouteKey[];
  const totalCoverage = useMemo(() => {
    const total = routes.reduce((s, r) => s + multiResult[r].totalTrips, 0);
    const covered = routes.reduce(
      (s, r) => s + Math.round((multiResult[r].coverageRate / 100) * multiResult[r].totalTrips),
      0
    );
    return total > 0 ? Math.round((covered / total) * 100) : 0;
  }, [multiResult]);

  const poolCount = Object.values(assignments).filter((v) => v === "pool").length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden min-h-0 relative">
        {/* ── Header ── */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 relative z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg relative overflow-hidden flex-shrink-0 bg-indigo-100 shadow-sm">
              <span className="relative z-10 text-indigo-600 font-black text-xs">SIM</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-none">Simulation</h1>
              <p className="text-[0.55rem] mt-0.5 text-slate-500">
                จำลองแผนตารางเดินรถ — Round-Robin Fairness
              </p>
            </div>
          </div>

          {/* Right: route coverage badges + pool indicator */}
          <div className="flex items-center gap-2">
            {/* View Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
              <button
                onClick={() => setActiveView("all")}
                className={`px-3 py-1 text-[0.55rem] font-bold rounded-md transition-all ${activeView === "all" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
              >
                ทั้งหมด
              </button>
              {(["green", "blue", "red"] as RouteKey[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveView(r)}
                  className={`px-3 py-1 text-[0.55rem] font-bold rounded-md transition-all flex items-center gap-1 ${activeView === r ? "bg-white shadow-sm" : "opacity-60 hover:opacity-100"}`}
                  style={{ color: activeView === r ? ROUTE_META[r].color : undefined }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: ROUTE_META[r].color }}
                  />
                  {ROUTE_META[r].label}
                </button>
              ))}
            </div>

            {routes.map((r) => {
              const cov = multiResult[r].coverageRate;
              const covColor = cov >= 95 ? "#16a34a" : cov >= 80 ? "#d97706" : "#dc2626";
              return (
                <div
                  key={r}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.5rem] font-bold"
                  style={{
                    background: `${ROUTE_META[r].color}15`,
                    border: `1px solid ${ROUTE_META[r].color}30`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: ROUTE_META[r].color }}
                  />
                  <span style={{ color: ROUTE_META[r].color }}>
                    {multiResult[r].totalDrivers}คน
                  </span>
                  <span style={{ color: covColor }}>{cov.toFixed(0)}%</span>
                </div>
              );
            })}

            {poolCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.5rem] font-bold bg-slate-100 border border-slate-200 text-slate-600">
                Pool {poolCount}คน
              </div>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.5rem] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Live · {totalCoverage}%
            </div>

            {/* Schedule Toggle Button */}
            <button
              onClick={() => setShowSchedule(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.5rem] font-bold border bg-white text-slate-500 border-slate-200 hover:bg-slate-50 transition-all"
            >
              ตารางเวรคนขับ
            </button>

            {/* Stats Toggle Button */}
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.5rem] font-bold border transition-all ${
                showStats
                  ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              วิเคราะห์ข้อมูล
            </button>

            {/* Validation Alerts Toggle Button */}
            {(validationSummary.hasError || validationSummary.hasWarning) && (
              <button
                onClick={() => setShowAlerts(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.5rem] font-bold border transition-all ${
                  validationSummary.hasError
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                }`}
              >
                {validationSummary.errorCount > 0
                  ? `${validationSummary.errorCount} ปัญหา`
                  : `${validationSummary.warningCount} แจ้งเตือน`}
              </button>
            )}
          </div>
        </header>

        {/* ── Main body ── */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left control panel */}
          <SimControlPanel
            config={config}
            multiResult={multiResult}
            onChange={handleConfigChange}
            onReset={handleReset}
          />

          {/* Right: board + stats + gantt */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden min-h-0 bg-white relative">
            {/* Driver assignment board (drag and drop) */}
            <DriverAssignmentBoard assignments={assignments} onChange={setAssignments} />

            {/* Gantt board */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <SimGanttBoard
                multiResult={multiResult}
                tripDurations={config.tripDurations}
                otThresholdHours={config.otThresholdHours}
                activeView={activeView}
              />
            </div>

            {/* Validation Modal Overlay */}
            {showAlerts && (
              <div
                className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6"
                onClick={() => setShowAlerts(false)}
              >
                <div
                  className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-full flex flex-col overflow-hidden border border-slate-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      ผลการตรวจสอบแผน
                    </h3>
                    <button
                      onClick={() => setShowAlerts(false)}
                      className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    <SimValidationAlerts summary={validationSummary} />
                  </div>
                </div>
              </div>
            )}

            {/* Stats Modal Overlay */}
            {showStats && (
              <div
                className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6"
                onClick={() => setShowStats(false)}
              >
                <div
                  className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden border border-slate-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-3 text-lg">
                      วิเคราะห์ข้อมูลการเดินรถ (Analytics)
                    </h3>
                    <button
                      onClick={() => setShowStats(false)}
                      className="text-slate-400 hover:text-slate-600 text-3xl font-bold leading-none"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-6 bg-slate-100">
                    <SimStatsBar multiResult={multiResult} />
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Modal Overlay */}
            {showSchedule && (
              <div
                className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6"
                onClick={() => setShowSchedule(false)}
              >
                <div
                  className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-full flex flex-col overflow-hidden border border-slate-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-3 text-lg">
                      ตารางเวรคนขับ
                    </h3>
                    <button
                      onClick={() => setShowSchedule(false)}
                      className="text-slate-400 hover:text-slate-600 text-3xl font-bold leading-none"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto bg-white">
                    <SimScheduleTable
                      multiResult={multiResult}
                      tripDurations={config.tripDurations}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="block md:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
}
