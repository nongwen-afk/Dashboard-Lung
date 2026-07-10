"use client";

import React, { useMemo, useState } from "react";
import { useFleetStore } from "@/lib/store/fleetStore";
import { Driver, RouteId } from "@/types";
import { DriverDetailsModal } from "./DriverDetailsModal";
import { WeeklyDriverSchedule } from "./WeeklyDriverSchedule";
import { Search, ShieldCheck, Clock, Users } from "lucide-react";
import { FleetLoadingGate } from "@/components/FleetLoadingGate";

const DIRECTORY_ROUTE_GROUPS: Array<{
  id: RouteId;
  label: string;
  accentClass: string;
  headerClass: string;
  hoverClass: string;
  vehicleClass: string;
}> = [
  {
    id: "L1",
    label: "สายสีแดง",
    accentClass: "border-l-red-500",
    headerClass: "bg-red-50/80 text-red-950",
    hoverClass: "hover:bg-red-50/70 focus-within:bg-red-50/70",
    vehicleClass: "border-red-200 bg-red-50/70 text-red-950",
  },
  {
    id: "L2",
    label: "สายสีน้ำเงิน",
    accentClass: "border-l-blue-600",
    headerClass: "bg-blue-50/80 text-blue-950",
    hoverClass: "hover:bg-blue-50/70 focus-within:bg-blue-50/70",
    vehicleClass: "border-blue-200 bg-blue-50/70 text-blue-950",
  },
  {
    id: "L3",
    label: "สายสีเขียว",
    accentClass: "border-l-emerald-500",
    headerClass: "bg-emerald-50/80 text-emerald-950",
    hoverClass: "hover:bg-emerald-50/70 focus-within:bg-emerald-50/70",
    vehicleClass: "border-emerald-200 bg-emerald-50/70 text-emerald-950",
  },
];

const getOnTimeStatus = (onTimeRate: number) => (onTimeRate >= 90 ? "ปกติ" : "ควรติดตาม");

function SummaryMetric({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  iconClassName: string;
}) {
  return (
    <div className="flex min-h-[68px] items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 last:border-b-0 md:min-h-[112px] md:flex-col md:items-start md:justify-center md:border-b-0 md:border-r md:px-5 md:py-4 md:last:border-r-0">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="min-w-0 text-[15px] font-semibold leading-5 text-slate-700">{label}</p>
      </div>
      <p className="shrink-0 whitespace-nowrap text-[22px] font-bold leading-7 text-slate-950 md:text-2xl">
        {value}
      </p>
    </div>
  );
}

export const getRouteMeta = (route: string) => {
  const r = (route || "").toLowerCase();
  if (r.includes("red") || r.includes("แดง") || r.includes("l1")) {
    return {
      name: "สายสีแดง",
      color: "bg-red-500 text-white shadow-sm shadow-red-500/20 border-transparent",
      order: 1,
    };
  }
  if (r.includes("blue") || r.includes("น้ำเงิน") || r.includes("l2")) {
    return {
      name: "สายสีน้ำเงิน",
      color: "bg-blue-600 text-white shadow-sm shadow-blue-500/20 border-transparent",
      order: 2,
    };
  }
  if (r.includes("green") || r.includes("เขียว") || r.includes("l3")) {
    return {
      name: "สายสีเขียว",
      color: "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 border-transparent",
      order: 3,
    };
  }
  return {
    name: route,
    color: "bg-slate-500 text-white shadow-sm shadow-slate-500/20 border-transparent",
    order: 99,
  };
};

export function DriverDashboard() {
  const drivers = useFleetStore((state) => state.drivers);
  const reserveDrivers = useFleetStore((state) => state.reserveDrivers);
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState<RouteId | "all">("all");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const filteredDrivers = useMemo(
    () =>
      drivers.filter((driver) => {
        const matchesSearch = `${driver.name} ${driver.surname} ${driver.code} ${driver.vehicle}`
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        const matchesRoute = routeFilter === "all" || driver.routeId === routeFilter;
        return matchesSearch && matchesRoute;
      }),
    [drivers, routeFilter, search]
  );

  const sortedDrivers = useMemo(
    () =>
      [...filteredDrivers].sort((a, b) => {
        const metaA = getRouteMeta(a.route);
        const metaB = getRouteMeta(b.route);
        if (metaA.order !== metaB.order) return metaA.order - metaB.order;
        return (a.vehicle || "").localeCompare(b.vehicle || "");
      }),
    [filteredDrivers]
  );

  const groupedDrivers = useMemo(
    () =>
      DIRECTORY_ROUTE_GROUPS.map((group) => ({
        ...group,
        drivers: sortedDrivers.filter((driver) => driver.routeId === group.id),
      })).filter((group) => group.drivers.length > 0),
    [sortedDrivers]
  );

  // Overall Stats Calculation
  const totalActive = drivers.filter((d) => d.status === "Active").length;
  const avgOnTime =
    drivers.reduce((acc, d) => acc + (d.performance?.onTimeRate || 0), 0) / (drivers.length || 1);
  const avgDelay =
    drivers.reduce((acc, d) => acc + (d.performance?.avgDelay || 0), 0) / (drivers.length || 1);

  return (
    <FleetLoadingGate>
      <div className="space-y-6">
        {/* Weekly Schedule Section */}
        <WeeklyDriverSchedule drivers={drivers} reserveDrivers={reserveDrivers} />

        {/* Unified driver overview */}
        <section
          aria-labelledby="driver-overview-title"
          className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm"
        >
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 id="driver-overview-title" className="text-base font-bold text-slate-900">
              ภาพรวมคนขับ
            </h2>
          </div>
          <div className="md:grid md:grid-cols-3">
            <SummaryMetric
              icon={Users}
              label="พนักงานพร้อมวิ่ง"
              value={`${totalActive} / ${drivers.length} คน`}
              iconClassName="bg-blue-50 text-blue-700"
            />
            <SummaryMetric
              icon={ShieldCheck}
              label="เข้าเป้าตรงเวลาเฉลี่ย"
              value={`${avgOnTime.toFixed(1)}%`}
              iconClassName="bg-emerald-50 text-emerald-700"
            />
            <SummaryMetric
              icon={Clock}
              label="ความล่าช้าเฉลี่ย"
              value={`${avgDelay.toFixed(1)} นาที`}
              iconClassName="bg-amber-50 text-amber-700"
            />
          </div>
        </section>

        {/* Route-grouped driver directory */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 shadow-sm sm:p-3">
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">รายชื่อพนักงานขับรถ</h2>
              <p className="mt-0.5 text-sm font-semibold text-slate-600">
                แสดง {sortedDrivers.length} คน
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative min-w-0 flex-1 sm:w-64" htmlFor="driver-directory-search">
                <span className="sr-only">ค้นหาชื่อ รหัส หรือรถ</span>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  id="driver-directory-search"
                  type="search"
                  placeholder="ค้นหาชื่อ รหัส หรือรถ..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-base text-slate-900 shadow-sm outline-none transition-shadow placeholder:text-slate-500 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-200 motion-reduce:transition-none"
                  autoComplete="off"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700" htmlFor="driver-route-filter">
                <span className="sr-only">กรองตามสายรถ</span>
                <select
                  id="driver-route-filter"
                  value={routeFilter}
                  onChange={(event) => setRouteFilter(event.target.value as RouteId | "all")}
                  className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base font-semibold text-slate-800 shadow-sm outline-none focus:border-indigo-700 focus:ring-2 focus:ring-indigo-200 sm:w-44"
                >
                  <option value="all">ทุกสาย</option>
                  <option value="L1">สายสีแดง</option>
                  <option value="L2">สายสีน้ำเงิน</option>
                  <option value="L3">สายสีเขียว</option>
                </select>
              </label>
            </div>
          </div>

          {groupedDrivers.length > 0 ? (
            <div className="mt-3 space-y-3">
              <div className="hidden space-y-3 md:block">
                {groupedDrivers.map((group) => (
                  <section
                    key={group.id}
                    aria-labelledby={`driver-route-${group.id}`}
                    className={`overflow-hidden rounded-xl border border-slate-200 border-l-4 bg-white shadow-sm ${group.accentClass}`}
                  >
                    <div
                      className={`flex min-h-12 items-center border-b border-slate-200 px-4 py-2.5 ${group.headerClass}`}
                    >
                      <h3 id={`driver-route-${group.id}`} className="text-base font-bold">
                        {group.label} · {group.drivers.length} คน
                      </h3>
                    </div>
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b-2 border-slate-200 bg-slate-100/90 text-sm font-semibold text-slate-700">
                          <th className="w-[46%] px-4 py-2.5">พนักงาน</th>
                          <th className="w-[18%] px-4 py-2.5">รถประจำ</th>
                          <th className="w-[18%] px-4 py-2.5">ตรงเวลา</th>
                          <th className="w-[18%] px-4 py-2.5">ล่าช้าเฉลี่ย</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.drivers.map((driver) => {
                          const performance = driver.performance;
                          const onTimeRate = Math.round(performance?.onTimeRate ?? 0);

                          return (
                            <tr
                              key={driver.id}
                              onClick={() => setSelectedDriver(driver)}
                              className={`min-h-14 cursor-pointer border-b border-slate-200/90 odd:bg-white even:bg-slate-50/70 transition-colors ${group.hoverClass}`}
                            >
                              <td className="px-4 py-2.5">
                                <p className="text-base font-semibold text-slate-900">
                                  {driver.name} {driver.surname}
                                </p>
                                <p className="text-sm font-medium text-slate-600">{driver.code}</p>
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`inline-flex min-h-8 items-center rounded-md border px-2.5 text-[15px] font-bold ${group.vehicleClass}`}
                                >
                                  {driver.vehicle}
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                <p className="text-base font-bold text-slate-900">{onTimeRate}%</p>
                                <p className="text-sm font-semibold text-slate-600">
                                  {getOnTimeStatus(onTimeRate)}
                                </p>
                              </td>
                              <td className="px-4 py-2.5 text-base font-semibold text-slate-800">
                                {(performance?.avgDelay ?? 0).toFixed(1)} นาที
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </section>
                ))}
              </div>

              <div className="space-y-3 md:hidden">
                {groupedDrivers.map((group) => (
                  <section
                    key={group.id}
                    aria-labelledby={`mobile-driver-route-${group.id}`}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 shadow-sm"
                  >
                    <div
                      className={`flex min-h-12 items-center border-b border-slate-200 px-4 py-2.5 ${group.headerClass}`}
                    >
                      <h3 id={`mobile-driver-route-${group.id}`} className="text-base font-bold">
                        {group.label} · {group.drivers.length} คน
                      </h3>
                    </div>
                    <div className="space-y-2.5 p-3">
                      {group.drivers.map((driver) => {
                        const performance = driver.performance;
                        const onTimeRate = Math.round(performance?.onTimeRate ?? 0);

                        return (
                          <button
                            key={driver.id}
                            type="button"
                            onClick={() => setSelectedDriver(driver)}
                            className={`grid min-h-[116px] w-full grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 rounded-xl border border-slate-200 border-l-4 bg-white p-4 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2 ${group.accentClass} ${group.hoverClass}`}
                          >
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-xl font-bold leading-[1.3] text-slate-900">
                                {driver.name} {driver.surname}
                              </p>
                              <p className="mt-1 text-sm font-medium leading-5 text-slate-600">
                                {driver.code} · {driver.vehicle}
                              </p>
                            </div>
                            <span className="self-start rounded-full bg-slate-100/80 px-2.5 py-1 text-[13px] font-medium leading-5 text-slate-600">
                              {getOnTimeStatus(onTimeRate)}
                            </span>
                            <div className="col-span-2 grid grid-cols-2 border-t border-slate-100 pt-3">
                              <div>
                                <p className="text-sm font-medium text-slate-600">ตรงเวลา</p>
                                <p className="mt-0.5 text-lg font-semibold leading-6 text-emerald-700">
                                  {onTimeRate}%
                                </p>
                              </div>
                              <div className="border-l border-slate-200 pl-3 text-right">
                                <p className="text-sm font-medium text-slate-600">ล่าช้าเฉลี่ย</p>
                                <p className="mt-0.5 text-lg font-semibold leading-6 text-slate-800">
                                  {(performance?.avgDelay ?? 0).toFixed(1)} นาที
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-base font-bold text-slate-800">ไม่พบข้อมูลคนขับ</p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                ลองค้นหาด้วยชื่อ รหัสพนักงาน หรือหมายเลขรถ
              </p>
            </div>
          )}
        </div>

        {/* Driver Details Modal */}
        {selectedDriver && (
          <DriverDetailsModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
        )}
      </div>
    </FleetLoadingGate>
  );
}
