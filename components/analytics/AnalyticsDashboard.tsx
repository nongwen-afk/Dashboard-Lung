/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Clock, Bus, Activity, Users } from "lucide-react";
import { CHART_DATA } from "@/lib/mock-data";
import { useFleetStore } from "@/lib/store/fleetStore";
import { FleetLoadingGate } from "@/components/FleetLoadingGate";
import { ScheduleSimulator } from "./ScheduleSimulator";

const BAR_COLORS = {
  efficiency: "#1e40af", // Blue
  trips: "#10b981", // Emerald
  delay: "#ef4444", // Red
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-lg p-3 text-lg">
      <p className="font-bold text-slate-800 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="font-medium">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export function AnalyticsDashboard() {
  const routes = useFleetStore((state) => state.routes);
  const drivers = useFleetStore((state) => state.drivers);
  const reserveDrivers = useFleetStore((state) => state.reserveDrivers);

  const [mounted, setMounted] = useState(false);
  const [selectedMobileChart, setSelectedMobileChart] = useState<string>("main_chart");
  const [selectedDay, setSelectedDay] = useState<string>("All");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const displayChartData = mounted && isMobile && selectedDay !== "All"
    ? CHART_DATA.filter((d) => d.name === selectedDay)
    : CHART_DATA;

  // Prepare Driver Status Data (Donut Chart)
  const activeCount = drivers.filter(d => d.status === 'Active').length;
  const leaveCount = drivers.filter(d => d.status === 'Leave').length;
  const availableCount = reserveDrivers.filter(r => r.status === 'Available').length;
  
  const driverStatusData = [
    { name: 'Active', value: activeCount, fill: '#10b981' }, // Emerald
    { name: 'On Leave', value: leaveCount, fill: '#ef4444' }, // Red
    { name: 'Reserve', value: availableCount, fill: '#f59e0b' }, // Amber
  ];

  // Prepare Trips per Route Data
  const tripsPerRouteData = routes.map((r) => {
    const totalTrips = drivers.reduce((sum, d) => {
      const trips = d.performance?.tripsByRoute?.[r.id] || 0;
      return sum + trips;
    }, 0);
    return {
      name: r.labelTh,
      trips: totalTrips,
      fill: r.color,
    };
  });

  return (
    <FleetLoadingGate>
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* KPI 1 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg text-slate-500 font-medium">ประสิทธิภาพเฉลี่ย</p>
              <p className="text-4xl font-bold text-slate-800">83.8%</p>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg text-slate-500 font-medium">รอบวิ่งรถรวม (สัปดาห์)</p>
              <p className="text-4xl font-bold text-slate-800">252 รอบ</p>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 text-red-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg text-slate-500 font-medium">เวลาล่าช้าเฉลี่ย</p>
              <p className="text-4xl font-bold text-slate-800">7.8 นาที</p>
            </div>
          </div>
        </div>

        {/* Mobile Chart Selector */}
        {mounted && isMobile && (
          <div className="md:hidden bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4 flex flex-col gap-3">
            <h2 className="text-xl font-bold text-slate-800">เลือกข้อมูลเพื่อแสดงผล</h2>
            <select
              value={selectedMobileChart}
              onChange={(e) => setSelectedMobileChart(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm md:text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 md:p-3 outline-none tracking-tight"
            >
              <option value="main_chart">แนวโน้มการดำเนินงานตลอดสัปดาห์</option>
              <option value="routes_table">สถิติแยกตามสายการเดินรถ</option>
              <option value="trips_chart">จำนวนรอบวิ่งรวมแยกตามสายรถ</option>
              <option value="driver_status">สัดส่วนสถานะพนักงานขับรถ</option>
            </select>
          </div>
        )}

        {/* Main Chart */}
        <div className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex-col ${selectedMobileChart === 'main_chart' ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm md:text-2xl font-bold text-slate-800 whitespace-nowrap tracking-tighter md:tracking-normal">แนวโน้มการดำเนินงานตลอดสัปดาห์</h2>
            </div>
            
            {/* Mobile Only: Day Selector */}
            {mounted && isMobile && (
              <div className="md:hidden w-full md:w-auto">
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm md:text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 md:p-2.5 outline-none tracking-tight"
                >
                  <option value="All">รวมทั้งสัปดาห์</option>
                  {CHART_DATA.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="h-[28rem] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 16 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fill: "#64748b", fontSize: 16 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Legend wrapperStyle={{ fontSize: "16px", paddingTop: "10px" }} />
                  <Bar
                    dataKey="efficiency"
                    name="ประสิทธิภาพ (%)"
                    fill={BAR_COLORS.efficiency}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="trips"
                    name="จำนวนรอบ (รอบ)"
                    fill={BAR_COLORS.trips}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="delay"
                    name="ความล่าช้า (นาที)"
                    fill={BAR_COLORS.delay}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        {/* Secondary Charts Grid */}
        <div className={`grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 ${selectedMobileChart === 'trips_chart' || selectedMobileChart === 'driver_status' ? 'grid' : 'hidden md:grid'}`}>
          {/* Trips per Route Chart */}
          <div className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex-col ${selectedMobileChart === 'trips_chart' ? 'flex' : 'hidden md:flex'}`}>
            <div className="flex items-center gap-2 mb-6">
              <Bus className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm md:text-2xl font-bold text-slate-800 whitespace-nowrap tracking-tighter md:tracking-normal">จำนวนรอบวิ่งรวมแยกตามสายรถ</h2>
            </div>
            <div className="h-[18.75rem] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tripsPerRouteData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 16 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 16 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="trips" name="จำนวนรอบรวม (รอบ)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Driver Status Donut Chart */}
          <div className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex-col ${selectedMobileChart === 'driver_status' ? 'flex' : 'hidden md:flex'}`}>
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm md:text-2xl font-bold text-slate-800 whitespace-nowrap tracking-tighter md:tracking-normal">สัดส่วนสถานะพนักงานขับรถ</h2>
            </div>
            <div className="h-[18.75rem] w-full mt-auto relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={driverStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {driverStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={44} wrapperStyle={{ fontSize: "16px", paddingTop: "20px" }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Text for Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-5xl font-bold text-slate-800">{drivers.length + reserveDrivers.length}</span>
                <span className="text-base font-medium text-slate-500">คนขับทั้งหมด</span>
              </div>
            </div>
          </div>
        </div>

        {/* Routes Performance Table */}
        <div className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex-col ${selectedMobileChart === 'routes_table' ? 'flex' : 'hidden md:flex'}`}>
          <h2 className="text-sm md:text-2xl font-bold text-slate-800 mb-4 whitespace-nowrap tracking-tighter md:tracking-normal">สถิติแยกตามสายการเดินรถ</h2>
          <div className="overflow-x-hidden md:overflow-x-auto">
            <table className="w-full text-left border-collapse block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="border-b border-slate-100 text-lg text-slate-500">
                  <th className="pb-3 font-semibold px-2">สายรถ</th>
                  <th className="pb-3 font-semibold px-2">จำนวนรถ</th>
                  <th className="pb-3 font-semibold px-2">จำนวนผู้โดยสารเฉลี่ย</th>
                  <th className="pb-3 font-semibold px-2">สถานะการเดินรถ</th>
                </tr>
              </thead>
              <tbody className="text-lg block md:table-row-group">
                {routes.map((route, i) => (
                  <tr
                    key={route.id}
                    className="border-b border-slate-100 md:border-slate-50 hover:bg-slate-50 transition-colors block md:table-row py-4 md:py-0"
                  >
                    <td className="block md:table-cell py-2 md:py-4 px-2">
                      <div className="flex items-center justify-between md:justify-start gap-2">
                        <span className="md:hidden font-semibold text-slate-500 text-sm">สายรถ</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: route.color }}
                          />
                          <span className="font-semibold text-slate-800">{route.labelTh}</span>
                        </div>
                      </div>
                    </td>
                    <td className="block md:table-cell py-2 md:py-4 px-2">
                      <div className="flex items-center justify-between md:justify-start gap-2">
                        <span className="md:hidden font-semibold text-slate-500 text-sm">จำนวนรถ</span>
                        <span className="text-slate-600">{route.vehicles} คัน</span>
                      </div>
                    </td>
                    <td className="block md:table-cell py-2 md:py-4 px-2">
                      <div className="flex items-center justify-between md:justify-start gap-2 w-full md:w-auto">
                        <span className="md:hidden font-semibold text-slate-500 text-sm">ผู้โดยสาร</span>
                        <div className="flex items-center gap-2 w-1/2 md:w-auto ml-auto md:ml-0">
                          <div className="w-full md:w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${route.passengerLoad}%`,
                                backgroundColor: route.color,
                              }}
                            />
                          </div>
                          <span className="text-slate-600 font-medium whitespace-nowrap">{route.passengerLoad}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="block md:table-cell py-2 md:py-4 px-2">
                      <div className="flex items-center justify-between md:justify-start gap-2">
                        <span className="md:hidden font-semibold text-slate-500 text-sm">สถานะ</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-lg font-bold bg-emerald-50 text-emerald-600">
                          ปกติ (Normal)
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Driver Statistics Table */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-2xl font-bold text-slate-800">
              สถิติพนักงานขับรถแยกบุคคล <span className="block md:inline text-slate-500">(รวม OT)</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {drivers
              .slice()
              .sort((a, b) => (b.performance?.totalTrips || 0) - (a.performance?.totalTrips || 0))
              .map((driver) => {
                return (
                  <div key={driver.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
                    {/* Header: Name, Code, and Rating */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-xl">{driver.name} {driver.surname}</h3>
                        <span className="text-base text-slate-500 font-medium">{driver.code}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg text-amber-600 font-bold text-lg">
                        <span>★</span> {driver.performance?.rating?.toFixed(1) || "N/A"}
                      </div>
                    </div>

                    {/* Routes */}
                    <div className="mb-5">
                      <div className="text-sm text-slate-500 mb-2 font-semibold">สายรถที่วิ่งประจำ</div>
                      <div className="flex gap-2 flex-wrap">
                        {routes.map(r => {
                          const trips = driver.performance?.tripsByRoute?.[r.id] || 0;
                          if (trips === 0) return null;
                          return (
                            <span
                              key={r.id}
                              className="inline-flex items-center px-2 py-1 rounded-md text-sm font-bold whitespace-nowrap"
                              style={{ backgroundColor: `${r.color}15`, color: r.color }}
                              title={`${r.labelTh}: ${trips} รอบ`}
                            >
                              {r.id}: {trips} รอบ
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1 font-medium">รอบวิ่งสะสม</div>
                        <div className="font-bold text-slate-800 text-xl">{driver.performance?.totalTrips || 0}</div>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <div className="text-sm text-emerald-600 mb-1 font-medium">วัน OT (เหมาวัน)</div>
                        <div className="font-bold text-emerald-700 text-xl">{driver.performance?.otDays || 0}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1 font-medium">ตรงเวลา</div>
                        <div className="font-bold text-slate-800 text-xl">{driver.performance?.onTimeRate || 0}%</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1 font-medium">ล่าช้าเฉลี่ย</div>
                        <div className="font-bold text-slate-800 text-xl">{driver.performance?.avgDelay || 0} <span className="text-sm font-normal text-slate-500">นาที</span></div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-lg text-slate-500">
                  <th className="pb-3 font-semibold px-2 whitespace-nowrap">ชื่อพนักงาน</th>
                  <th className="pb-3 font-semibold px-2 whitespace-nowrap">สายรถ</th>
                  <th className="pb-3 font-semibold px-2 text-center whitespace-nowrap">รอบวิ่งสะสม</th>
                  <th className="pb-3 font-semibold px-2 text-center whitespace-nowrap">วัน OT (เหมาวัน)</th>
                  <th className="pb-3 font-semibold px-2 text-center whitespace-nowrap">ตรงเวลา (%)</th>
                  <th className="pb-3 font-semibold px-2 text-center whitespace-nowrap">ล่าช้าเฉลี่ย (นาที)</th>
                  <th className="pb-3 font-semibold px-2 text-center whitespace-nowrap">คะแนน</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                {drivers
                  .slice()
                  .sort((a, b) => (b.performance?.totalTrips || 0) - (a.performance?.totalTrips || 0))
                  .map((driver) => {
                    const route = routes.find(r => r.id === driver.routeId);
                    return (
                      <tr key={driver.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-2">
                          <div className="font-semibold text-slate-800 whitespace-nowrap text-lg">{driver.name} {driver.surname}</div>
                          <div className="text-base text-slate-500">{driver.code}</div>
                        </td>
                        <td className="py-4 px-2 text-slate-600">
                          <div className="flex gap-1.5 flex-wrap">
                            {routes.map(r => {
                              const trips = driver.performance?.tripsByRoute?.[r.id] || 0;
                              if (trips === 0) return null;
                              return (
                                <span
                                  key={r.id}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-sm font-bold whitespace-nowrap"
                                  style={{ backgroundColor: `${r.color}15`, color: r.color }}
                                  title={`${r.labelTh}: ${trips} รอบ`}
                                >
                                  {r.id}: {trips}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center font-medium text-slate-800">{driver.performance?.totalTrips || 0}</td>
                        <td className="py-4 px-2 text-center text-emerald-600 font-bold">{driver.performance?.otDays || 0}</td>
                        <td className="py-4 px-2 text-center text-slate-600">{driver.performance?.onTimeRate || 0}%</td>
                        <td className="py-4 px-2 text-center text-slate-600">{driver.performance?.avgDelay || 0}</td>
                        <td className="py-4 px-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-amber-500 font-medium">
                            <span>★</span> {driver.performance?.rating?.toFixed(1) || "N/A"}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Simulator Section */}
        <ScheduleSimulator />
      </div>
    </FleetLoadingGate>
  );
}
