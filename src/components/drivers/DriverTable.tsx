"use client";

import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useFleetStore } from "@/store/fleetStore";
import { useFilteredDrivers } from "@/hooks/useFilteredDrivers";
import { Search, ChevronDown } from "lucide-react";

const ROUTE_COLORS: Record<string, string> = {
  "Line 1": "#dc2626",
  "Line 2": "#1e3a8a",
  "Line 3": "#16a34a",
};

export function DriverTable() {
  const {
    routeFilter, statusFilter, searchQuery,
    setRouteFilter, setStatusFilter, setSearchQuery,
    openModal, panelsCollapsed,
  } = useFleetStore();

  const filtered = useFilteredDrivers();
  const exp = panelsCollapsed; // shorthand

  return (
    <div>
      <p className={exp ? "text-[14px] font-bold text-[#1a1a2e] mb-3" : "text-[12px] font-bold text-[#1a1a2e] mb-2.5"}>
        Driver Assignment
      </p>

      {/* Filters */}
      <div className={exp ? "flex gap-2 mb-3" : "flex gap-1.5 mb-2"}>
        {[
          {
            value: routeFilter,
            onChange: setRouteFilter,
            options: [
              { value: "", label: "All Lines" },
              { value: "Line 1", label: "Line 1" },
              { value: "Line 2", label: "Line 2" },
              { value: "Line 3", label: "Line 3" },
            ],
          },
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "", label: "All Status" },
              { value: "Active", label: "Active" },
              { value: "Leave", label: "Leave" },
            ],
          },
        ].map((sel, i) => (
          <div key={i} className="flex-1 relative">
            <select
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              className={`w-full rounded-lg px-2 py-1.5 outline-none appearance-none pr-6 font-medium transition-all duration-200 ${exp ? "text-[12px] py-2" : "text-[10px]"}`}
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,249,252,0.9))",
                border: "1px solid rgba(26,26,46,0.10)",
                boxShadow: "0 1px 4px rgba(26,26,46,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
                color: "#0f172a",
              }}
            >
              {sel.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
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
          placeholder="Search driver..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full rounded-lg pl-7 pr-3 outline-none transition-all duration-200 ${exp ? "text-[12px] py-2" : "text-[10px] py-1.5"}`}
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,249,252,0.9))",
            border: "1px solid rgba(26,26,46,0.10)",
            boxShadow: "0 1px 4px rgba(26,26,46,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
            color: "#0f172a",
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = "1px solid rgba(37,99,235,0.45)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08), 0 1px 4px rgba(15,23,42,0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = "1px solid rgba(26,26,46,0.10)";
            e.currentTarget.style.boxShadow = "0 1px 4px rgba(26,26,46,0.07), inset 0 1px 0 rgba(255,255,255,0.9)";
          }}
        />
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid rgba(26,26,46,0.06)",
          boxShadow: "0 2px 8px rgba(26,26,46,0.05)",
        }}
      >
        <table className="w-full">
          <thead>
            <tr
              style={{
                background: "linear-gradient(135deg, #0f172a, #1e293b)",
              }}
            >
              {(exp
                ? ["Lin.", "Name", "Vehicle", "Status", "Cap.", ""]
                : ["Lin.", "Name", "Drivers", "Cap.", ""]
              ).map((h) => (
                <th
                  key={h}
                  className={`font-bold text-slate-400 text-left px-2 uppercase tracking-wide ${exp ? "text-[10px] py-2.5" : "text-[9px] py-2"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-[11px] text-gray-400">
                  ไม่พบข้อมูลคนขับ
                </td>
              </tr>
            ) : (
              filtered.map((d, idx) => {
                const rc = ROUTE_COLORS[d.route] ?? "#8899bb";
                const isLeave = d.status === "Leave";
                return (
                  <tr
                    key={d.id}
                    className="transition-colors duration-150"
                    style={{
                      background: idx % 2 === 0 ? "rgba(255,255,255,0.8)" : "rgba(248,249,252,0.7)",
                      borderBottom: "1px solid rgba(26,26,46,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = "rgba(37,99,235,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        idx % 2 === 0 ? "rgba(255,255,255,0.8)" : "rgba(248,249,252,0.7)";
                    }}
                  >
                    {/* Line badge */}
                    <td className="px-2 py-1.5 w-[10%]">
                      <span
                        className={`inline-block whitespace-nowrap font-bold text-white px-1.5 py-0.5 rounded ${exp ? "text-[10px]" : "text-[8px]"}`}
                        style={{
                          background: `linear-gradient(135deg, ${rc}, ${rc}cc)`,
                          boxShadow: `0 1px 4px ${rc}40`,
                        }}
                      >
                        {d.route.replace("Line", "L")}
                      </span>
                    </td>
                    {/* Name */}
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={d.name} size="xs" color={isLeave ? "#94a3b8" : rc} />
                        <div className="min-w-0">
                          <span className={`block leading-tight ${isLeave ? "text-gray-400" : "text-[#0f172a] font-medium"} ${exp ? "text-[12px]" : "text-[10px]"}`}>
                            {d.name} {d.surname}
                          </span>
                          <span className={exp ? "text-[9px] text-gray-400" : "text-[7.5px] text-gray-400"}>{d.code}</span>
                        </div>
                      </div>
                    </td>
                    {/* Vehicle */}
                    <td className={`px-2 py-1.5 text-gray-500 ${exp ? "text-[11px]" : "text-[9px]"}`}>{d.vehicle}</td>
                    {/* Status column — only in expanded mode */}
                    {exp && (
                      <td className="px-2 py-1.5">
                        <StatusBadge status={d.status as "Active" | "Leave"} />
                      </td>
                    )}
                    {/* Capacity bar */}
                    <td className="px-2 py-1.5">
                      <div className={exp ? "w-20" : "w-10"}>
                        <ProgressBar value={d.capacity} height={exp ? "h-1.5" : "h-1"} />
                        <p className={exp ? "text-[9px] text-gray-400 mt-0.5" : "text-[7px] text-gray-400 mt-0.5"}>{d.capacity}%</p>
                      </div>
                    </td>
                    {/* Action */}
                    <td className="px-2 py-1.5">
                      {isLeave ? (
                        <span className={`text-gray-400 font-semibold ${exp ? "text-[10px]" : "text-[8px]"}`}>On Leave</span>
                      ) : (
                        <button
                          onClick={() => openModal(d.id)}
                          className={`text-white font-bold rounded-md transition-all duration-200 active:scale-95 ${exp ? "text-[10px] px-3 py-1.5" : "text-[8px] px-2 py-1"}`}
                          style={{
                            background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
                            boxShadow: "0 2px 8px rgba(37,99,235,0.30)",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(37,99,235,0.45)";
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(37,99,235,0.30)";
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
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
