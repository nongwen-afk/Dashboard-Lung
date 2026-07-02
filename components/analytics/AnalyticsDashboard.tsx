/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, Clock, Bus, Activity } from "lucide-react";
import { CHART_DATA, ROUTES } from "@/lib/mock-data";
import { ScheduleSimulator } from "./ScheduleSimulator";

const BAR_COLORS = {
  efficiency: "#1e40af", // Blue
  trips: "#10b981", // Emerald
  delay: "#ef4444", // Red
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-lg p-3 text-sm">
      <p className="font-bold text-slate-800 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="font-medium">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">ประสิทธิภาพเฉลี่ย</p>
            <p className="text-2xl font-bold text-slate-800">83.8%</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">รอบวิ่งรถรวม (สัปดาห์)</p>
            <p className="text-2xl font-bold text-slate-800">252 รอบ</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 text-red-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">เวลาล่าช้าเฉลี่ย</p>
            <p className="text-2xl font-bold text-slate-800">7.8 นาที</p>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">แนวโน้มการดำเนินงานตลอดสัปดาห์</h2>
        </div>
        <div className="h-[18.75rem] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar
                dataKey="efficiency"
                name="ประสิทธิภาพ (%)"
                fill={BAR_COLORS.efficiency}
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="trips"
                name="จำนวนรอบ (รอบ)"
                fill={BAR_COLORS.trips}
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="delay"
                name="ความล่าช้า (นาที)"
                fill={BAR_COLORS.delay}
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Routes Performance Table */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">สถิติแยกตามสายการเดินรถ</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-sm text-slate-500">
                <th className="pb-3 font-semibold px-2">สายรถ</th>
                <th className="pb-3 font-semibold px-2">จำนวนรถ</th>
                <th className="pb-3 font-semibold px-2">จำนวนผู้โดยสารเฉลี่ย</th>
                <th className="pb-3 font-semibold px-2">สถานะการเดินรถ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {ROUTES.map((route, i) => (
                <tr
                  key={route.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: route.color }}
                      />
                      <span className="font-semibold text-slate-800">{route.labelTh}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-slate-600">{route.vehicles} คัน</td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${route.passengerLoad}%`,
                            backgroundColor: route.color,
                          }}
                        />
                      </div>
                      <span className="text-slate-600 font-medium">{route.passengerLoad}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[0.6875rem] font-bold bg-emerald-50 text-emerald-600">
                      ปกติ (Normal)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Simulator Section */}
      <ScheduleSimulator />
    </div>
  );
}
