"use client";

import { useEffect, useState } from "react";
import { useFleetStore } from "@/lib/store/fleetStore";
import { getAllDepartures } from "@/lib/mock-data/timetables";
import { getDriverForTrip } from "@/lib/shiftRotation";
import {
  LogOut,
  MapPin,
  Clock,
  Bus,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function DriverView() {
  const { currentUser, logout, routes } = useFleetStore();
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    // Update time every second for the countdown
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  const routeDetails = routes.find((r) => r.id === currentUser.routeId);

  // Check if selected date is today
  const isToday = selectedDate.toDateString() === now.toDateString();

  // Helper to check if trip is in the past (only relevant for today)
  const isPastTrip = (timeStr: string) => {
    if (!isToday) return false;
    const [hStr, mStr] = timeStr.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    return h < now.getHours() || (h === now.getHours() && m <= now.getMinutes());
  };

  // Get all departures for this route and filter to only this driver's assigned trips (matching the rotation logic)
  const allDepartures = getAllDepartures(currentUser.routeId, selectedDate);
  const departuresList = allDepartures
    .map((dept) => {
      const assignedDriver = getDriverForTrip(currentUser.routeId, dept.tripIndex, selectedDate);
      return {
        ...dept,
        assignedDriver,
      };
    })
    // Match by employee code because DB-backed users and mock rotation drivers use different numeric id systems
    .filter((item) => item.assignedDriver?.code === currentUser.code);

  // Find the first upcoming trip for the logged-in driver today
  const nextTrip = isToday ? departuresList.find((dept) => !isPastTrip(dept.time)) : null;

  // Calculate countdown to the next trip
  let nextDepartureInfo: {
    minutes: number;
    seconds: number;
    time: string;
    tripIndex: number;
  } | null = null;
  if (isToday && nextTrip) {
    const [hStr, mStr] = nextTrip.time.split(":");
    const depHour = parseInt(hStr, 10);
    const depMinute = parseInt(mStr, 10);

    const depDate = new Date(now);
    depDate.setHours(depHour, depMinute, 0, 0);

    const diffMs = depDate.getTime() - now.getTime();
    if (diffMs > 0) {
      const totalSec = Math.floor(diffMs / 1000);
      nextDepartureInfo = {
        minutes: Math.floor(totalSec / 60),
        seconds: totalSec % 60,
        time: nextTrip.time,
        tripIndex: nextTrip.tripIndex,
      };
    }
  }

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-y-auto pb-12 font-sans">
      {/* Header wrapper for centering on desktop */}
      <div className="w-full bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border-b border-gray-100 rounded-b-[2.5rem]">
        <header className="max-w-2xl mx-auto px-6 py-8 pb-10 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full border-4 border-white shadow-[0_0_20px_rgba(0,0,0,0.05)] flex items-center justify-center overflow-hidden">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-500">
                    {currentUser.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {currentUser.name} {currentUser.surname}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                  Driver ID: <span className="font-medium text-gray-700">{currentUser.code}</span>
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100 flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner"
                style={{ backgroundColor: routeDetails?.bgColor, color: routeDetails?.color }}
              >
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                  เส้นทาง (Route)
                </p>
                <p className="font-bold text-sm text-gray-900 leading-tight">
                  {routeDetails?.labelTh || currentUser.route}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100 flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                  รถประจำ (Vehicle)
                </p>
                <p className="font-bold text-sm text-gray-900 leading-tight">
                  {currentUser.vehicle}
                </p>
              </div>
            </div>
          </div>
        </header>
      </div>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 mt-6 space-y-6">
        {/* Date Selector */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 flex items-center justify-between border border-white/40 ring-1 ring-gray-900/5">
          <button
            onClick={handlePrevDay}
            className="p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            className="flex flex-col items-center flex-1 cursor-pointer group"
            onClick={handleToday}
            role="button"
          >
            <div className="flex items-center gap-2 text-gray-900 font-bold group-hover:text-blue-600 transition-colors">
              <CalendarIcon className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
              {isToday ? "วันนี้ (Today)" : formatDate(selectedDate)}
            </div>
            {!isToday && (
              <span className="text-[10px] text-blue-500/70 font-medium uppercase tracking-widest mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                แตะเพื่อกลับไปวันนี้
              </span>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Next Departure Card (Only show if viewing today) */}
        {isToday && (
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[2rem] p-7 text-white shadow-[0_20px_40px_-10px_rgba(17,24,39,0.5)] mb-8 border border-gray-700 overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/20 rounded-full blur-[40px] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2 tracking-wide uppercase">
                  <Clock className="w-4 h-4 text-green-400 animate-pulse" /> รอบวิ่งถัดไป
                </h2>
                {nextDepartureInfo && (
                  <span className="px-3.5 py-1.5 bg-white/10 rounded-full text-xs font-bold backdrop-blur-md border border-white/10 shadow-inner">
                    รอบที่ {nextDepartureInfo.tripIndex + 1}
                  </span>
                )}
              </div>

              {nextDepartureInfo ? (
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-6xl font-black tracking-tighter mb-1 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300">
                      {nextDepartureInfo.time}
                    </p>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
                      เวลาออกรถ (Departure)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1.5 text-green-400 justify-end mb-1">
                      <span className="text-4xl font-bold tracking-tight shadow-green-400/20">
                        {nextDepartureInfo.minutes}
                      </span>
                      <span className="text-sm font-semibold">นาที</span>
                    </div>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
                      นับถอยหลัง
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-3 opacity-90 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                  <p className="font-bold text-xl text-white">หมดรอบวิ่งของวันนี้แล้ว</p>
                  <p className="text-sm text-gray-400 mt-1 font-medium">
                    พักผ่อนให้เพียงพอ เจอกันพรุ่งนี้ครับ
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule List */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center justify-between">
            <span className="text-lg">ตารางเวลา{isToday ? "ที่เหลือวันนี้" : "ทั้งหมด"}</span>
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100/80 px-3 py-1.5 rounded-full uppercase tracking-wider">
              {routeDetails?.labelTh}
            </span>
          </h3>

          {departuresList.length > 0 ? (
            <div className="space-y-0 relative before:absolute before:inset-y-3 before:left-[15px] before:w-[2px] before:bg-gray-100">
              {departuresList.map((dept, idx) => {
                const isPast = isToday && isPastTrip(dept.time);
                const isNext = isToday && nextTrip && dept.time === nextTrip.time;
                const isSubstitute = dept.assignedDriver?.status === "Substitute";

                // Destination mocking based on route type
                let destName = "ปลายทาง";
                if (currentUser.routeId === "L1") destName = "สถานีรถไฟศาลายา";
                else if (currentUser.routeId === "L2") destName = "ศาลายาคอนโด";
                else if (currentUser.routeId === "L3") destName = "คณะวิศวกรรมศาสตร์";

                return (
                  <div
                    key={idx}
                    className={`relative flex gap-5 p-4 hover:bg-gray-50/50 rounded-2xl transition-colors group ${
                      isPast ? "opacity-50" : ""
                    }`}
                  >
                    {/* Timeline circle */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isNext
                            ? "bg-green-50 border-green-500 text-green-600 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                            : isPast
                              ? "bg-gray-100 border-gray-300 text-gray-400"
                              : "bg-white border-gray-200 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-400"
                        }`}
                      >
                        {isNext ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                        )}
                      </div>
                    </div>

                    {/* Content inside timeline row */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
                      <div>
                        <p
                          className={`font-black text-2xl leading-none ${
                            isNext
                              ? "text-green-600"
                              : isPast
                                ? "text-gray-400 line-through"
                                : "text-gray-800"
                          }`}
                        >
                          {dept.time}
                        </p>
                        <p className="text-[11px] font-semibold text-gray-400 mt-1.5">
                          รอบที่ {dept.tripIndex + 1}
                        </p>
                      </div>

                      {/* Route Details and Info */}
                      <div className="flex flex-wrap items-center gap-4 sm:text-right">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700">
                            ม.มหิดล ศาลายา → {destName}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">
                            รถประจำ: {currentUser.vehicle}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${
                              isNext
                                ? "bg-green-100 border-green-200 text-green-700 shadow-sm animate-pulse"
                                : isPast
                                  ? "bg-gray-100 border-gray-200 text-gray-400"
                                  : isSubstitute
                                    ? "bg-amber-50 border-amber-200 text-amber-700"
                                    : "bg-gray-50 border-gray-200 text-gray-500"
                            }`}
                          >
                            {isNext
                              ? "รอบต่อไป"
                              : isPast
                                ? "เสร็จสิ้นแล้ว"
                                : isSubstitute
                                  ? `คนแทน: ${dept.assignedDriver?.name}`
                                  : "รอดำเนินการ"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">
                ไม่มีรอบวิ่ง{isToday ? "เหลือในวันนี้" : "ในวันนี้"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
