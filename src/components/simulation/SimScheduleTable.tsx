import React from "react";
import { type MultiRouteSimResult, type RouteKey, ROUTE_META, minToTime } from "@/lib/simulationEngine";

interface Props {
  multiResult: MultiRouteSimResult;
  tripDurations: Record<RouteKey, number>;
}

export function SimScheduleTable({ multiResult, tripDurations }: Props) {
  // Flatten drivers from all routes
  const allDrivers = (["green", "blue", "red"] as RouteKey[]).flatMap(route => 
    multiResult[route].drivers.map(d => ({
      ...d,
      route,
    }))
  );

  // Sort by start time, then by route
  allDrivers.sort((a, b) => {
    if (a.startMin !== b.startMin) return a.startMin - b.startMin;
    return a.route.localeCompare(b.route);
  });

  if (allDrivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="font-bold">ยังไม่มีข้อมูลการเดินรถ</p>
        <p className="text-xs mt-1">กรุณาจัดคนขับลงสายรถเพื่อดูตารางเวร</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 sticky top-0 z-10">
              <th className="px-4 py-3">ชื่อคนขับ</th>
              <th className="px-4 py-3">สายรถ</th>
              <th className="px-4 py-3 text-center">จำนวนรอบ</th>
              <th className="px-4 py-3 text-center">เวลาทำงาน</th>
              <th className="px-4 py-3 min-w-[300px]">ตารางวิ่งรถ (เวลาออกรถ)</th>
            </tr>
          </thead>
          <tbody className="text-[0.8rem] text-slate-700 divide-y divide-slate-100">
            {allDrivers.map((driver, idx) => {
              const meta = ROUTE_META[driver.route];
              const workHours = Math.floor(driver.workMinutes / 60);
              const workMins = driver.workMinutes % 60;
              
              return (
                <tr key={`${driver.route}-${driver.driverIndex}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                  {/* Name */}
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-black text-white shrink-0"
                        style={{ background: meta.color }}
                      >
                        {driver.name.substring(0, 2)}
                      </div>
                      <span className="truncate max-w-[100px]">{driver.name}</span>
                    </div>
                  </td>
                  
                  {/* Route Badge */}
                  <td className="px-4 py-3">
                    <span 
                      className="px-2 py-1 rounded-md text-[0.6rem] font-bold whitespace-nowrap"
                      style={{ background: meta.bgColor, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </td>
                  
                  {/* Total Trips */}
                  <td className="px-4 py-3 text-center font-bold text-slate-700">
                    {driver.trips.length}
                  </td>
                  
                  {/* Work Hours */}
                  <td className="px-4 py-3 text-center font-medium text-slate-600">
                    {workHours}h {workMins > 0 ? `${workMins}m` : ''}
                  </td>
                  
                  {/* Timeline blocks */}
                  <td className="px-4 py-3">
                    {driver.trips.length === 0 ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.65rem] font-bold bg-green-50 text-green-700 border border-green-200">
                        🌴 วันหยุดพักผ่อน
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {driver.trips.map(trip => (
                          <div 
                            key={trip.tripIndex}
                            className={`px-1.5 py-1 rounded text-[0.65rem] font-bold flex items-center justify-center min-w-[42px] transition-all hover:scale-110 ${
                              trip.isOverlapping ? 'border-2 border-dashed border-red-500 bg-red-50 text-red-700 animate-pulse' : 'border'
                            }`}
                            title={`รอบที่ ${trip.tripIndex + 1} (${trip.isOT ? 'OT' : 'ปกติ'})${trip.isOverlapping ? ' [เวลาทับซ้อน/จัดคนไม่พอ]' : ''}`}
                            style={trip.isOverlapping ? undefined : {
                              background: trip.isOT ? '#fffbeb' : '#f8fafc',
                              borderColor: trip.isOT ? '#fcd34d' : '#e2e8f0',
                              color: trip.isOT ? '#d97706' : '#475569',
                              boxShadow: trip.isRushHour ? '0 0 0 1px #ef4444' : 'none'
                            }}
                          >
                            {minToTime(trip.departureMin)}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
