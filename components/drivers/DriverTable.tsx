"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { useFleetStore } from "@/lib/store/fleetStore";
import { useFilteredDrivers } from "@/hooks/useFilteredDrivers";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RouteId } from "@/types";

const ROUTE_META: Record<RouteId, { label: string; color: string }> = {
  L1: { label: "สายแดง", color: "#dc2626" },
  L2: { label: "สายน้ำเงิน", color: "#1e3a8a" },
  L3: { label: "สายเขียว", color: "#16a34a" },
};

function AssignmentStatusBadge({
  substitute,
  compact = false,
}: {
  substitute: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded px-1.5 py-0.5 font-semibold ${
        compact ? "text-[0.5625rem]" : "text-[0.675rem]"
      } ${substitute ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}
    >
      {substitute ? "สำรองแทน" : "ตามแผน"}
    </span>
  );
}

interface DriverTableProps {
  compact?: boolean;
  scrollable?: boolean;
}

export function DriverTable({ compact = false, scrollable = false }: DriverTableProps = {}) {
  const {
    routeFilter,
    statusFilter,
    searchQuery,
    setRouteFilter,
    setStatusFilter,
    setSearchQuery,
    openModal,
    panelsCollapsed,
    focusDriverId,
    setFocusDriverId,
  } = useFleetStore();

  const filtered = useFilteredDrivers();
  const expanded = panelsCollapsed && !compact;

  return (
    <div className={cn(scrollable && "flex min-h-0 flex-1 flex-col")}>
      <p
        className={
          expanded
            ? "mb-3 text-[1.05rem] font-bold text-[#1a1a2e]"
            : "mb-2.5 text-[0.9rem] font-bold text-[#1a1a2e]"
        }
      >
        ตารางรถและคนขับ
      </p>

      {/* Filters */}
      <div className={expanded ? "mb-3 flex gap-2" : "mb-2 flex gap-1.5"}>
        {[
          {
            value: routeFilter,
            onChange: setRouteFilter,
            options: [
              { value: "", label: "ทุกสาย" },
              { value: "L1", label: "สายสีแดง" },
              { value: "L2", label: "สายสีน้ำเงิน" },
              { value: "L3", label: "สายสีเขียว" },
            ],
          },
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "", label: "ทุกสถานะ" },
              { value: "planned", label: "ตามแผน" },
              { value: "substitute", label: "สำรองแทน" },
            ],
          },
        ].map((sel, i) => (
          <div key={i} className="flex-1 relative">
            <select
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              className={`w-full appearance-none rounded-lg px-2 py-1.5 pr-6 font-medium outline-none transition-all duration-200 ${expanded ? "py-2 text-[0.9rem]" : "text-[0.75rem]"}`}
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,249,252,0.9))",
                border: "1px solid rgba(26,26,46,0.10)",
                boxShadow: "0 1px 4px rgba(26,26,46,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
                color: "#0f172a",
              }}
            >
              {sel.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-2.5">
        <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาชื่อหรือรถ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full rounded-lg pl-7 pr-3 outline-none transition-all duration-200 ${expanded ? "py-2 text-[0.9rem]" : "py-1.5 text-[0.75rem]"}`}
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,249,252,0.9))",
            border: "1px solid rgba(26,26,46,0.10)",
            boxShadow: "0 1px 4px rgba(26,26,46,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
            color: "#0f172a",
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = "1px solid rgba(37,99,235,0.45)";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px rgba(37,99,235,0.08), 0 1px 4px rgba(15,23,42,0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = "1px solid rgba(26,26,46,0.10)";
            e.currentTarget.style.boxShadow =
              "0 1px 4px rgba(26,26,46,0.07), inset 0 1px 0 rgba(255,255,255,0.9)";
          }}
        />
      </div>

      {/* Table */}
      <div
        className={cn("rounded-xl overflow-hidden", scrollable && "min-h-0 flex-1 overflow-y-auto")}
        style={{
          border: "1px solid rgba(26,26,46,0.06)",
          boxShadow: "0 2px 8px rgba(26,26,46,0.05)",
        }}
      >
        <table className="w-full">
          <thead className={scrollable ? "sticky top-0 z-10" : undefined}>
            <tr
              style={{
                background: "linear-gradient(135deg, #0f172a, #1e293b)",
              }}
            >
              {(expanded
                ? [
                    { label: "สาย", w: "w-[102px]" },
                    { label: "คนขับ", w: "w-full" },
                    { label: "รถ", w: "w-[110px]" },
                    { label: "สถานะ", w: "w-[110px]" },
                    { label: "Cap.", w: "w-[140px]" },
                    { label: "", w: "w-[140px]" },
                  ]
                : [
                    { label: "สาย", w: "w-[76px]" },
                    { label: "คนขับ", w: "w-full" },
                    { label: "รถ", w: "w-[96px]" },
                    { label: "", w: "w-[132px]" },
                  ]
              ).map((col, i, arr) => {
                const isFirst = i === 0;
                const isLast = i === arr.length - 1;
                return (
                  <th
                    key={col.label || i}
                    className={`text-left font-bold tracking-wide text-slate-400 uppercase ${col.w} ${expanded ? "py-2.5 text-[0.75rem]" : "py-2 text-[0.675rem]"} ${isFirst ? "pl-4 pr-2" : isLast ? "pl-2 pr-4 text-right" : "px-2"}`}
                  >
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={expanded ? 6 : 4}
                  className="py-6 text-center text-[0.825rem] text-gray-400"
                >
                  ไม่พบข้อมูลคนขับ
                </td>
              </tr>
            ) : (
              filtered.map((assignment, idx) => {
                const { baseDriver, driver, status, vehicle, capacity, routeId, slot, note } =
                  assignment;
                const route = ROUTE_META[routeId];
                const rc = route.color;
                const isSubstitute = status === "Substitute";
                const isSelected = baseDriver.id === focusDriverId;
                const baseBg = idx % 2 === 0 ? "rgba(255,255,255,0.8)" : "rgba(248,249,252,0.7)";

                return (
                  <tr
                    key={`${baseDriver.id}-${routeId}-${slot}`}
                    className="transition-colors duration-150 cursor-pointer"
                    onClick={() => setFocusDriverId(baseDriver.id)}
                    style={{
                      background: isSelected ? `${rc}15` : baseBg,
                      borderBottom: "1px solid rgba(26,26,46,0.04)",
                      boxShadow: isSelected ? `inset 3px 0 0 ${rc}` : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          "rgba(37,99,235,0.04)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLTableRowElement).style.background = baseBg;
                      }
                    }}
                  >
                    {/* Daily route assignment */}
                    <td className="pl-4 pr-2 py-2 whitespace-nowrap">
                      <span
                        className={`inline-block min-w-[62px] rounded px-2 py-0.5 text-center font-bold whitespace-nowrap text-white ${expanded ? "text-[0.8rem]" : "text-[0.7rem]"}`}
                        style={{
                          background: `linear-gradient(135deg, ${rc}, ${rc}cc)`,
                          boxShadow: `0 1px 4px ${rc}40`,
                        }}
                      >
                        {route.label}
                      </span>
                    </td>
                    {/* Name */}
                    <td className="px-2 py-2 w-full">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <span
                            className={`block leading-tight break-words font-medium text-[#0f172a] ${expanded ? "text-[0.9rem]" : "text-[0.75rem]"}`}
                          >
                            {driver.name} {driver.surname}
                          </span>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1">
                            <span
                              className={`text-gray-400 ${expanded ? "text-[0.675rem]" : "text-[0.5625rem]"}`}
                            >
                              {note ? `${driver.code} · ${note}` : driver.code}
                            </span>
                            {!expanded ? (
                              <AssignmentStatusBadge substitute={isSubstitute} compact />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Vehicle, status, and capacity */}
                    {expanded ? (
                      <>
                        <td className="w-px px-2 py-2 text-[0.825rem] whitespace-nowrap text-gray-500">
                          {vehicle}
                        </td>
                        <td className="w-px px-2 py-2 whitespace-nowrap">
                          <AssignmentStatusBadge substitute={isSubstitute} />
                        </td>
                        <td className="w-px px-2 py-2 whitespace-nowrap">
                          <div className="w-20">
                            <ProgressBar value={capacity} height="h-1.5" />
                            <p className="mt-0.5 text-[0.675rem] text-gray-400">{capacity}%</p>
                          </div>
                        </td>
                      </>
                    ) : (
                      <td className="w-px px-2 py-2 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-[0.675rem] font-medium text-[#0f172a]">
                            {vehicle}
                          </span>
                          <div className="w-12">
                            <ProgressBar value={capacity} height="h-1" />
                            <p className="mt-0.5 text-[0.525rem] text-gray-400">{capacity}%</p>
                          </div>
                        </div>
                      </td>
                    )}
                    {/* Action */}
                    <td className="pl-2 pr-4 py-2 text-right w-px whitespace-nowrap">
                      {isSubstitute ? (
                        <span
                          className={`inline-block font-semibold text-indigo-600 ${expanded ? "text-[0.75rem]" : "text-[0.6rem]"}`}
                        >
                          แทนแล้ว
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(baseDriver.id);
                          }}
                          className={`rounded-md font-bold text-white transition-all duration-200 active:scale-95 ${expanded ? "px-3 py-1.5 text-[0.75rem]" : "px-2 py-1 text-[0.6rem]"}`}
                          style={{
                            background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
                            boxShadow: "0 2px 8px rgba(37,99,235,0.30)",
                          }}
                        >
                          Replace
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
