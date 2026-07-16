"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  Bus,
  CheckCircle2,
  Clock3,
  Coffee,
  PlayCircle,
  X,
} from "lucide-react";
import { ROUTES } from "@/lib/mock-data";
import { getVehicleOperationalTimeline, type OperationalTrip } from "@/lib/operationalFleet";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RouteId } from "@/types";
import { MOCK_ROUTE_VEHICLES, type VehiclePreviewStatus } from "./mockRouteVehicles";
import { useOperationalFleet } from "@/hooks/useOperationalFleet";
import { useFleetStore } from "@/lib/store/fleetStore";

interface RouteVehiclesDialogProps {
  open: boolean;
  initialRoute: RouteId;
  onClose: () => void;
}

const ROUTE_IDS: RouteId[] = ["L1", "L2", "L3"];

type OperationalVehiclePreviewStatus = VehiclePreviewStatus | "เสริมสาย" | "เลื่อนคิว" | "ไม่พร้อม";

const STATUS_META: Record<
  OperationalVehiclePreviewStatus,
  { icon: typeof PlayCircle; className: string }
> = {
  กำลังวิ่ง: { icon: PlayCircle, className: "bg-emerald-50 text-emerald-800" },
  กำลังจะออก: { icon: Clock3, className: "bg-blue-50 text-blue-800" },
  รอรอบ: { icon: Clock3, className: "bg-amber-50 text-amber-900" },
  พัก: { icon: Coffee, className: "bg-slate-100 text-slate-700" },
  จบรอบ: { icon: CheckCircle2, className: "bg-slate-100 text-slate-700" },
  เสริมสาย: { icon: ArrowRightLeft, className: "bg-indigo-50 text-indigo-800" },
  เลื่อนคิว: { icon: Clock3, className: "bg-amber-50 text-amber-900" },
  ไม่พร้อม: { icon: AlertTriangle, className: "bg-rose-50 text-rose-800" },
};

const getTripMinutes = (trip: OperationalTrip) => {
  const [hour, minute] = trip.time.split(":").map(Number);
  return hour * 60 + minute;
};

const getRouteLabel = (routeId: RouteId) =>
  ROUTES.find((route) => route.id === routeId)?.labelTh ?? routeId;

export function RouteVehiclesDialog({ open, initialRoute, onClose }: RouteVehiclesDialogProps) {
  const [selectedRoute, setSelectedRoute] = useState<RouteId>(initialRoute);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { assignments, tripsByRoute, routeStats, isLive, now } = useOperationalFleet();
  const openDispatchPanel = useFleetStore((state) => state.openDispatchPanel);

  const route = ROUTES.find((candidate) => candidate.id === selectedRoute)!;
  const vehicles = useMemo(() => {
    const previews = new Map(
      Object.values(MOCK_ROUTE_VEHICLES)
        .flat()
        .map((vehicle) => [vehicle.code, vehicle])
    );

    const assignmentsByVehicle = new Map(
      assignments
        .filter(
          (assignment) =>
            assignment.homeRouteId === selectedRoute ||
            assignment.operatingRouteId === selectedRoute
        )
        .map((assignment) => [assignment.vehicle, assignment])
    );
    tripsByRoute[selectedRoute].forEach((trip) => {
      assignmentsByVehicle.set(trip.vehicle, trip.assignment);
    });
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return Array.from(assignmentsByVehicle.values())
      .map((assignment) => {
        const preview = previews.get(assignment.vehicle);
        const timeline = getVehicleOperationalTimeline({
          vehicle: assignment.vehicle,
          tripsByRoute,
          now,
          isLive,
        });
        const routeTrips = tripsByRoute[selectedRoute].filter(
          (trip) => trip.vehicle === assignment.vehicle
        );
        const activeRouteTrip =
          routeTrips.find((trip) => trip.id === timeline.activeTrip?.id) ?? null;
        const nextRouteTrip = routeTrips.find((trip) => getTripMinutes(trip) >= nowMinutes) ?? null;
        const routeTrip = activeRouteTrip ?? nextRouteTrip ?? routeTrips[0] ?? null;
        const timelineTrip = timeline.activeTrip ?? timeline.nextTrip;
        const status: OperationalVehiclePreviewStatus =
          assignment.operationalState === "unavailable"
            ? "ไม่พร้อม"
            : routeTrip?.kind === "replacement" || routeTrip?.kind === "supplemental"
              ? "เสริมสาย"
              : routeTrip?.note?.includes("รถคันถัดไป")
                ? "เลื่อนคิว"
                : assignment.operationalState === "borrowed"
                  ? "เสริมสาย"
                  : assignment.operationalState === "queue-shifted"
                    ? "เลื่อนคิว"
                    : timeline.activeTrip
                      ? "กำลังวิ่ง"
                      : timeline.nextTrip && getTripMinutes(timeline.nextTrip) - nowMinutes <= 10
                        ? "กำลังจะออก"
                        : isLive
                          ? (preview?.status ?? "รอรอบ")
                          : "รอรอบ";
        const eventNote =
          assignment.operationalNote ??
          routeTrip?.note ??
          (timelineTrip &&
          timelineTrip.routeId !== selectedRoute &&
          (timelineTrip.kind === "replacement" || timelineTrip.kind === "supplemental")
            ? `${timelineTrip.vehicle} ไป${timelineTrip.kind === "replacement" ? "รับรอบแทน" : "เสริม"}${getRouteLabel(timelineTrip.routeId)}`
            : undefined);

        return {
          code: assignment.vehicle,
          passengerCount:
            assignment.operationalState === "unavailable" ? 0 : (preview?.passengerCount ?? 0),
          status,
          driver: assignment.driver,
          currentTrip: timeline.activeTrip,
          nextTrip: timeline.nextTrip,
          nextTripMinutes: timeline.nextTrip
            ? getTripMinutes(timeline.nextTrip)
            : Number.POSITIVE_INFINITY,
          routeTrip,
          note: eventNote,
        };
      })
      .toSorted(
        (left, right) =>
          Number(left.status !== "กำลังวิ่ง") - Number(right.status !== "กำลังวิ่ง") ||
          left.nextTripMinutes - right.nextTripMinutes ||
          left.code.localeCompare(right.code)
      );
  }, [assignments, isLive, now, selectedRoute, tripsByRoute]);

  const statusSummary = useMemo(
    () =>
      Array.from(new Set(vehicles.map((vehicle) => vehicle.status))).map((status) => ({
        status,
        count: vehicles.filter((vehicle) => vehicle.status === status).length,
      })),
    [vehicles]
  );

  const selectTab = (routeId: RouteId) => {
    setSelectedRoute(routeId);
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? ROUTE_IDS.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + ROUTE_IDS.length) % ROUTE_IDS.length;
    const nextRoute = ROUTE_IDS[nextIndex];
    selectTab(nextRoute);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[950] bg-slate-950/55 backdrop-blur-sm"
        className="z-[951] fixed inset-x-0 bottom-0 top-auto flex max-h-[88dvh] max-w-none flex-col translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-t-2xl border-slate-200 bg-white p-0 shadow-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-[min(760px,calc(100dvh-2rem))] sm:max-h-[calc(100dvh-2rem)] sm:w-[min(760px,calc(100%-2rem))] sm:max-w-[760px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
      >
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${route.color}, ${route.color}99, #1e40af)`,
          }}
        />
        <DialogHeader className="border-b border-slate-200 bg-slate-50 px-5 py-4 pr-16 sm:py-2.5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ background: `linear-gradient(135deg, ${route.color}, ${route.color}cc)` }}
            >
              <Bus className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold leading-tight text-slate-900">
                รถและผู้โดยสารแต่ละสาย
              </DialogTitle>
              <DialogDescription className="text-sm font-medium leading-tight text-slate-600">
                {isLive
                  ? "สถานะรถ คนขับ รอบเดินรถ และผู้โดยสารของรถแต่ละคัน"
                  : "แผนรถและคนขับตามวันที่เลือก"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogClose asChild>
          <button
            type="button"
            aria-label="ปิดหน้าต่างข้อมูลรถ"
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </DialogClose>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600">
              คำสั่งย้ายรถจะมีผลกับรอบปัจจุบันเท่านั้น
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                openDispatchPanel();
              }}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 text-sm font-bold text-blue-900 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            >
              <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
              จัดการรถ
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="เลือกสายรถ">
            {ROUTE_IDS.map((routeId, index) => {
              const tabRoute = ROUTES.find((candidate) => candidate.id === routeId)!;
              const isSelected = selectedRoute === routeId;

              return (
                <button
                  key={routeId}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  id={`passenger-load-tab-${routeId}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="passenger-load-panel"
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => selectTab(routeId)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className="flex min-h-14 flex-col items-center justify-center rounded-lg border px-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
                  style={
                    isSelected
                      ? {
                          backgroundColor: tabRoute.color,
                          borderColor: tabRoute.color,
                          color: "white",
                        }
                      : { backgroundColor: "#f8fafc", borderColor: "#e2e8f0", color: "#475569" }
                  }
                >
                  <span>{tabRoute.labelTh}</span>
                  <span className="mt-0.5 text-xs font-medium opacity-80">
                    {routeStats[routeId].activeVehicles} คัน
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="passenger-load-panel"
            role="tabpanel"
            aria-labelledby={`passenger-load-tab-${selectedRoute}`}
            className="mt-2"
          >
            <div className="mb-2 rounded-lg bg-slate-100 px-3 py-2">
              <p className="text-sm font-semibold text-slate-800">
                รถใน{route.labelTh} · {vehicles.length} คัน
              </p>
              <p className="text-[13px] leading-4 text-slate-600">
                {statusSummary.map(({ status, count }) => `${status} ${count}`).join(" · ")}
              </p>
              {routeStats[selectedRoute].borrowedVehicles > 0 ||
              routeStats[selectedRoute].lentVehicles > 0 ? (
                <p className="mt-1 text-[13px] font-semibold text-slate-700">
                  {routeStats[selectedRoute].borrowedVehicles > 0
                    ? `รถเสริม ${routeStats[selectedRoute].borrowedVehicles} คัน`
                    : `ให้สายอื่นยืม ${routeStats[selectedRoute].lentVehicles} คัน`}
                </p>
              ) : null}
            </div>

            <div className="space-y-3 sm:space-y-0 sm:overflow-hidden sm:rounded-xl sm:border sm:border-slate-200 sm:divide-y sm:divide-slate-200">
              {vehicles.map((vehicle) => {
                const statusMeta = STATUS_META[vehicle.status];
                const StatusIcon = statusMeta.icon;
                const availableSeats = 20 - vehicle.passengerCount;

                return (
                  <article
                    key={vehicle.code}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:grid sm:min-h-[62px] sm:grid-cols-[72px_minmax(0,1fr)_88px_116px_64px] sm:items-center sm:gap-x-3 sm:gap-y-1 sm:rounded-none sm:border-0 sm:px-4 sm:py-2 sm:shadow-none sm:odd:bg-white sm:even:bg-slate-50/60"
                  >
                    <div className="flex items-start justify-between gap-3 sm:hidden">
                      <div className="min-w-0">
                        <p className="text-xl font-bold leading-6 text-slate-900">{vehicle.code}</p>
                        <p className="mt-1 text-base font-medium text-slate-700">
                          {vehicle.driver
                            ? `${vehicle.driver.name} ${vehicle.driver.surname}`
                            : "ไม่พบข้อมูลคนขับ"}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          {vehicle.currentTrip
                            ? `กำลังวิ่ง${getRouteLabel(vehicle.currentTrip.routeId)} · รอบ ${vehicle.currentTrip.time}`
                            : vehicle.nextTrip
                              ? `รอบถัดไป${getRouteLabel(vehicle.nextTrip.routeId)} · ${vehicle.nextTrip.time}`
                              : "ไม่มีรอบที่เหลือ"}
                        </p>
                        {vehicle.currentTrip && vehicle.nextTrip ? (
                          <p className="mt-1 text-sm font-medium text-slate-500">
                            ถัดไป {getRouteLabel(vehicle.nextTrip.routeId)} ·{" "}
                            {vehicle.nextTrip.time}
                          </p>
                        ) : null}
                        {vehicle.note ? (
                          <p className="mt-1 text-sm font-semibold text-indigo-700">
                            {vehicle.note}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-sm font-medium ${statusMeta.className}`}
                      >
                        <StatusIcon className="h-4 w-4" aria-hidden="true" />
                        {vehicle.status}
                      </span>
                    </div>

                    <p className="hidden text-[17px] font-bold leading-4 text-slate-900 sm:col-start-1 sm:block">
                      {vehicle.code}
                    </p>
                    <p className="hidden truncate text-[15px] font-semibold leading-4 text-slate-800 sm:col-start-2 sm:block">
                      {vehicle.driver
                        ? `${vehicle.driver.name} ${vehicle.driver.surname}`
                        : "ไม่พบข้อมูลคนขับ"}
                    </p>
                    <div className="hidden text-sm font-medium leading-4 text-slate-600 sm:col-start-3 sm:block">
                      <p>
                        {vehicle.currentTrip
                          ? `กำลังวิ่ง · ${vehicle.currentTrip.time}`
                          : vehicle.nextTrip
                            ? `รอบถัดไป · ${vehicle.nextTrip.time}`
                            : "ไม่มีรอบที่เหลือ"}
                      </p>
                      {vehicle.currentTrip && vehicle.nextTrip ? (
                        <p className="mt-1 text-[13px] text-slate-500">
                          ถัดไป {vehicle.nextTrip.time}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`hidden items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-medium leading-4 sm:col-start-4 sm:inline-flex sm:justify-self-start ${statusMeta.className}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {vehicle.status}
                    </span>
                    <p className="hidden text-right text-base font-bold leading-4 tabular-nums text-slate-900 sm:col-start-5 sm:block">
                      {vehicle.passengerCount}/20
                    </p>

                    {vehicle.note ? (
                      <p className="hidden text-[13px] font-semibold leading-4 text-indigo-700 sm:col-start-2 sm:col-end-6 sm:block">
                        {vehicle.note}
                      </p>
                    ) : null}

                    <div className="mt-4 border-t border-slate-100 pt-3 sm:col-start-2 sm:col-end-6 sm:mt-0 sm:grid sm:grid-cols-[155px_minmax(0,1fr)] sm:items-center sm:gap-3 sm:border-t-0 sm:pt-0">
                      <div className="flex items-center justify-between gap-3 sm:block">
                        <span className="text-sm font-medium text-slate-600 sm:hidden">
                          ผู้โดยสาร
                        </span>
                        <span className="text-lg font-bold tabular-nums text-slate-900 sm:hidden">
                          {vehicle.passengerCount}/20
                        </span>
                        <span className="hidden text-sm font-medium leading-4 text-slate-600 sm:block">
                          ใช้งาน {vehicle.passengerCount} · ว่าง {availableSeats}
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 sm:mt-0 sm:h-1.5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${vehicle.passengerCount * 5}%`,
                            backgroundColor: route.color,
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm font-medium text-slate-600 sm:hidden">
                        <span>ใช้งาน {vehicle.passengerCount}</span>
                        <span>ว่าง {availableSeats}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
