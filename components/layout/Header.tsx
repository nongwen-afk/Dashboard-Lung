"use client";

import { useClock } from "@/hooks/useClock";
import { Bell, Search, Wifi, User, ChevronDown } from "lucide-react";
import { useFleetStore } from "@/lib/store/fleetStore";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const time = useClock();
  const { speedingLogs, clearSpeedingLogs, userRole, setUserRole } = useFleetStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="relative bg-white border-b border-gray-100/80 px-3 md:px-5 py-2 md:py-3 flex items-center justify-between flex-shrink-0"
      style={{
        boxShadow: "0 1px 0 rgba(255,255,255,0.9), 0 2px 12px rgba(26,26,46,0.07)",
        zIndex: 900,
      }}
    >
      {/* Subtle top gradient line */}
      <div
        className="absolute inset-x-0 top-0 h-[0.125rem] rounded-none"
        style={{
          background: "linear-gradient(90deg, #1e3a8a 0%, #1e40af 40%, #475569 70%, #0f172a 100%)",
        }}
      />

      <div>
        <h1 className="text-base md:text-xl font-bold text-[#0f172a] flex items-center gap-2 md:gap-3 pt-0.5">
          <span
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Dashboard
          </span>
          <span className="hidden sm:inline text-sm font-normal text-gray-400">หน้าแดชบอร์ด</span>
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search — hidden on mobile */}
        <div className="relative group hidden md:block">
          <Search className="w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1e3a8a] absolute left-2.5 top-1/2 -translate-y-1/2 transition-colors" />
          <input
            type="text"
            placeholder="ค้นหา..."
            className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none w-40 transition-all duration-200 focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
            style={{ background: "rgba(248,249,252,0.8)" }}
          />
        </div>

        {/* Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:shadow-sm"
            style={{ transition: "all 0.2s ease" }}
          >
            <Bell className="w-4 h-4 text-gray-500" />
            {speedingLogs.length > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
                style={{ boxShadow: "0 0 0 2px white, 0 0 6px rgba(239,68,68,0.5)" }}
              />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[25rem]">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-sm text-gray-800">การแจ้งเตือนความเร็ว</h3>
                {speedingLogs.length > 0 && (
                  <button
                    onClick={clearSpeedingLogs}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ล้างทั้งหมด
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {speedingLogs.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm">
                    ไม่มีการแจ้งเตือนใหม่
                  </div>
                ) : (
                  speedingLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg hover:bg-red-50/50 border border-transparent hover:border-red-100 transition-colors flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm text-gray-800">{log.driverName}</span>
                        <span className="text-[0.625rem] text-gray-400">{log.time}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">รถ: {log.vehicle}</span>
                        <span className="font-bold text-red-500">{log.speed} km/h</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clock */}
        <div
          className="px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums text-[#0f172a] font-semibold"
          style={{
            background: "linear-gradient(135deg, #f8f9fc, #f0f2f8)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,1), 0 1px 3px rgba(15,23,42,0.10)",
            border: "1px solid rgba(15,23,42,0.07)",
            minWidth: "76px",
            textAlign: "center",
          }}
        >
          {time}
        </div>

        {/* Mock Login / Role Switcher */}
        <div className="relative hidden md:block" ref={roleRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ background: "rgba(248,249,252,0.8)" }}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${userRole === "dispatcher" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}
            >
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[0.65rem] font-semibold text-gray-700 leading-tight whitespace-nowrap">
                {userRole === "dispatcher" ? "นายท่า" : "คนขับ"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-gray-50 bg-gray-50/50">
                <span className="text-[0.65rem] font-semibold text-gray-500 uppercase tracking-wider">
                  จำลองเข้าสู่ระบบ
                </span>
              </div>
              <div className="p-1.5 flex flex-col gap-0.5">
                <button
                  onClick={() => {
                    setUserRole("dispatcher");
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 text-xs rounded-lg flex items-center gap-2.5 transition-all ${
                    userRole === "dispatcher"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${userRole === "dispatcher" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-gray-300"}`}
                  />
                  นายท่า (Dispatcher)
                </button>
                <button
                  onClick={() => {
                    setUserRole("driver");
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 text-xs rounded-lg flex items-center gap-2.5 transition-all ${
                    userRole === "driver"
                      ? "bg-green-50 text-green-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${userRole === "driver" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-300"}`}
                  />
                  คนขับ (Driver)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
