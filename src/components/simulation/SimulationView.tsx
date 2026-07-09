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
import { SimDeparturesModal } from "./SimDeparturesModal";
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
  const [showDepartures, setShowDepartures] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  const [showBreaks, setShowBreaks] = useState(true);
  const [showOverlap, setShowOverlap] = useState(true);
  const [showIdle, setShowIdle] = useState(false);

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
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => {
    setAssignments(DEFAULT_DRIVER_ASSIGNMENTS);
    setConfig(defaultSharedConfig());
  }, []);

  // Combined coverage for header badge
  const routes = ["green", "blue", "red"] as RouteKey[];
  const totalCoverage = useMemo(() => {
    const total = routes.reduce((s, r) => s + multiResult[r].totalTrips, 0);
    const covered = routes.reduce((s, r) => s + Math.round(multiResult[r].coverageRate / 100 * multiResult[r].totalTrips), 0);
    return total > 0 ? Math.round((covered / total) * 100) : 0;
  }, [multiResult]);

  const poolCount = Object.values(assignments).filter(v => v === "pool").length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden min-h-0 relative">

        {/* ── Header ── */}
        <header
          className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0 px-4 md:px-5 py-3 md:py-2.5 relative z-20 bg-white border-b border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              className="flex w-8 h-8 rounded-lg items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isPanelCollapsed ? "แสดงแถบเครื่องมือ" : "ซ่อนแถบเครื่องมือ"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg relative overflow-hidden flex-shrink-0 bg-indigo-100 shadow-sm">
              <span className="relative z-10 text-indigo-600 font-black text-xs">SIM</span>
            </div>
            <div className="flex-shrink-0">
              <h1 className="text-sm font-bold text-slate-800 leading-none">Simulation</h1>
              <p className="text-sm mt-0.5 text-slate-500">ระบบจำลองแผนตารางเดินรถ</p>
            </div>
          </div>

          {/* Right: route coverage badges + pool indicator */}
          <div className="flex-1 min-w-0 flex justify-start md:justify-end">
            <div 
              className="flex items-center gap-2 overflow-x-auto overflow-y-hidden pb-1 -mb-1 max-w-full" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onWheel={(e) => {
                if (e.deltaY !== 0) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
            >
              
            {/* View Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
              <button 
                onClick={() => setActiveView("all")}
                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all whitespace-nowrap flex-shrink-0 ${activeView === "all" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
              >
                เส้นทางทั้งหมด
              </button>
              {(["green", "blue", "red"] as RouteKey[]).map(r => (
                <button 
                  key={r}
                  onClick={() => setActiveView(r)}
                  className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${activeView === r ? "bg-white shadow-sm" : "opacity-60 hover:opacity-100"}`}
                  style={{ color: activeView === r ? ROUTE_META[r].color : undefined }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: ROUTE_META[r].color }} />
                  {ROUTE_META[r].label}
                </button>
              ))}
            </div>


            {/* Filter toggles */}
            <div className="flex items-center gap-1.5 mr-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wide mr-1 whitespace-nowrap flex-shrink-0">แสดง:</span>
              <button
                onClick={() => setShowBreaks(!showBreaks)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap flex-shrink-0 ${
                  showBreaks ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                }`}
              >
                พัก
              </button>
              <button
                onClick={() => setShowOverlap(!showOverlap)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap flex-shrink-0 ${
                  showOverlap ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Overlap
              </button>
              <button
                onClick={() => setShowIdle(!showIdle)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap flex-shrink-0 ${
                  showIdle ? "bg-slate-100 text-slate-700 border-slate-300" : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                }`}
              >
                รอจัดสรร
              </button>
            </div>

            {/* Schedule Toggle Button */}
            <button
              onClick={() => setShowDepartures(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 transition-all whitespace-nowrap flex-shrink-0"
            >
              จัดการรอบการเดินรถ
            </button>

            <button
              onClick={() => setShowSchedule(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border bg-white text-slate-500 border-slate-200 hover:bg-slate-50 transition-all whitespace-nowrap flex-shrink-0"
            >
              ตารางปฏิบัติงาน
            </button>

            {/* Stats Toggle Button */}
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all whitespace-nowrap flex-shrink-0 ${
                showStats ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              วิเคราะห์
            </button>

            {/* Validation Alerts Toggle Button */}
            {(validationSummary.hasError || validationSummary.hasWarning) && (
              <button
                onClick={() => setShowAlerts(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all whitespace-nowrap flex-shrink-0 ${
                  validationSummary.hasError 
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                    : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                }`}
              >
                {validationSummary.errorCount > 0 ? `${validationSummary.errorCount} ปัญหา` : `${validationSummary.warningCount} แจ้งเตือน`}
              </button>
            )}
            </div>
          </div>
        </header>

        {/* ── Main body ── */}
        <div className="flex-1 min-h-0 flex overflow-hidden relative">

          {/* Mobile backdrop */}
          {!isPanelCollapsed && (
            <div 
              className="md:hidden absolute inset-0 bg-slate-900/30 z-30 backdrop-blur-sm"
              onClick={() => setIsPanelCollapsed(true)}
            />
          )}

          {/* Left control panel wrapper */}
          <div 
            className={`transition-all duration-300 ease-in-out flex-shrink-0 bg-white z-40 
              absolute md:relative inset-y-0 left-0 h-full border-r border-slate-200
              ${isPanelCollapsed ? "-translate-x-full md:translate-x-0 w-0 md:w-0 overflow-hidden border-r-0" : "translate-x-0 w-[85%] md:w-72 shadow-2xl md:shadow-none"
            }`}
          >
            <div className="w-full h-full">
              <SimControlPanel
                config={config}
                multiResult={multiResult}
                onChange={handleConfigChange}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* Right: board + stats + gantt */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden min-h-0 bg-white relative">

            {/* Driver assignment board (drag and drop) */}
            <DriverAssignmentBoard
              assignments={assignments}
              onChange={setAssignments}
            />

            {/* Gantt board */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <SimGanttBoard
                multiResult={multiResult}
                tripDurations={config.tripDurations}
                otThresholdHours={config.otThresholdHours}
                activeView={activeView}
                showBreaks={showBreaks}
                showOverlap={showOverlap}
                showIdle={showIdle}
              />
            </div>

            {/* Validation Modal Overlay */}
            {showAlerts && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => setShowAlerts(false)}>
                <div 
                  className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-full flex flex-col overflow-hidden border border-slate-200"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      ผลการตรวจสอบแผน
                    </h3>
                    <button onClick={() => setShowAlerts(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">&times;</button>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    <SimValidationAlerts summary={validationSummary} />
                  </div>
                </div>
              </div>
            )}

            {/* Stats Modal Overlay */}
            {showStats && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => setShowStats(false)}>
                <div 
                  className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden border border-slate-200"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-3 text-lg">
                      วิเคราะห์ข้อมูลการเดินรถ (Analytics)
                    </h3>
                    <button onClick={() => setShowStats(false)} className="text-slate-400 hover:text-slate-600 text-3xl font-bold leading-none">&times;</button>
                  </div>
                  <div className="flex-1 overflow-auto p-6 bg-slate-100">
                    <SimStatsBar multiResult={multiResult} />
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Modal Overlay */}
            {showSchedule && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => setShowSchedule(false)}>
                <div 
                  className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-full flex flex-col overflow-hidden border border-slate-200"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-3 text-lg">
                      ตารางปฏิบัติงาน (Schedule)
                    </h3>
                    <button onClick={() => setShowSchedule(false)} className="text-slate-400 hover:text-slate-600 text-3xl font-bold leading-none">&times;</button>
                  </div>
                  <div className="flex-1 overflow-auto bg-white">
                    <SimScheduleTable multiResult={multiResult} tripDurations={config.tripDurations} />
                  </div>
                </div>
              </div>
            )}

            {/* Departures Modal Overlay */}
            {showDepartures && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => setShowDepartures(false)}>
                <div 
                  className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden border border-slate-200"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-3 text-lg">
                      จัดการรอบวิ่ง (Manage Departures)
                    </h3>
                    <button onClick={() => setShowDepartures(false)} className="text-slate-400 hover:text-slate-600 text-3xl font-bold leading-none">&times;</button>
                  </div>
                  <div className="flex-1 overflow-hidden bg-white min-h-0">
                    <SimDeparturesModal 
                      customDepartures={config.customDepartures}
                      onChange={(newDeps) => handleConfigChange({ customDepartures: newDeps })}
                      onClose={() => setShowDepartures(false)}
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
