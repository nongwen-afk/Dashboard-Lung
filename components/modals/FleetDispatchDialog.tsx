"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BusFront, CheckCircle2, ClipboardList, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCrossRouteCandidates,
  getNextOperationalTrip,
  type OperationalTrip,
} from "@/lib/operationalFleet";
import { useOperationalFleet } from "@/hooks/useOperationalFleet";
import { useFleetStore } from "@/lib/store/fleetStore";
import type {
  FleetOperationRecord,
  FleetOperationType,
  RouteId,
  VehicleUnavailableEvent,
} from "@/types";

const ROUTES: Array<{ id: RouteId; label: string }> = [
  { id: "L1", label: "สายสีแดง" },
  { id: "L2", label: "สายสีน้ำเงิน" },
  { id: "L3", label: "สายสีเขียว" },
];

const getRouteLabel = (routeId: RouteId) =>
  ROUTES.find((route) => route.id === routeId)?.label ?? routeId;

const tripMinutes = (trip: OperationalTrip) => {
  const [hour, minute] = trip.time.split(":").map(Number);
  return hour * 60 + minute;
};

type DispatchMode = "unavailable" | "supplement" | "history";

const HISTORY_TYPE_OPTIONS: Array<{ value: "all" | FleetOperationType; label: string }> = [
  { value: "all", label: "ทุกเหตุการณ์" },
  { value: "vehicle-unavailable", label: "รถไม่พร้อม" },
  { value: "queue-advanced", label: "เลื่อนคิว" },
  { value: "cross-route-replacement", label: "รถรับรอบแทน" },
  { value: "supplemental-transfer", label: "ย้ายรถเสริม" },
  { value: "vehicle-restored", label: "รถกลับเข้าคิว" },
  { value: "reserve-driver-replacement", label: "คนขับสำรอง" },
  { value: "dispatch-reverted", label: "ยกเลิกคำสั่ง" },
];

export function FleetDispatchDialog() {
  const {
    dispatchPanelOpen,
    closeDispatchPanel,
    reportVehicleNotReady,
    restoreVehicleToQueue,
    transferVehicle,
    removeDispatchEvent,
    resetOperationalTestData,
  } = useFleetStore();
  const routes = useFleetStore((state) => state.routes);
  const operationHistory = useFleetStore((state) => state.operationHistory);
  const hasOperationalTestData = useFleetStore(
    (state) =>
      state.dispatchEvents.length > 0 ||
      state.operationHistory.length > 0 ||
      state.transferHistory.length > 0
  );
  const { serviceDate, now, isLive, assignments, tripsByRoute, events } = useOperationalFleet();
  const [mode, setMode] = useState<DispatchMode>("unavailable");
  const [affectedTripId, setAffectedTripId] = useState("");
  const [supplementTripId, setSupplementTripId] = useState("");
  const [resolution, setResolution] = useState<"queue-shift" | "cross-route-replacement">(
    "queue-shift"
  );
  const [replacementVehicle, setReplacementVehicle] = useState("");
  const [supplementVehicle, setSupplementVehicle] = useState("");
  const [historyType, setHistoryType] = useState<"all" | FleetOperationType>("all");
  const [historyRoute, setHistoryRoute] = useState<"all" | RouteId>("all");

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const dispatchTrips = useMemo(
    () =>
      ROUTES.flatMap((route) => tripsByRoute[route.id])
        .filter((trip) => trip.kind === "scheduled")
        .filter((trip) => !isLive || tripMinutes(trip) >= currentMinutes)
        .toSorted((left, right) => tripMinutes(left) - tripMinutes(right))
        .slice(0, 36),
    [currentMinutes, isLive, tripsByRoute]
  );
  const affectedTrip =
    dispatchTrips.find((trip) => trip.id === affectedTripId) ?? dispatchTrips[0] ?? null;
  const supplementTrip =
    dispatchTrips.find((trip) => trip.id === supplementTripId) ??
    getNextOperationalTrip(tripsByRoute.L2, now, isLive) ??
    dispatchTrips[0] ??
    null;
  const activeUnavailable = affectedTrip
    ? events.find(
        (event): event is VehicleUnavailableEvent =>
          event.type === "unavailable" &&
          event.routeId === affectedTrip.routeId &&
          event.tripIndex === affectedTrip.tripIndex &&
          !event.readyAt
      )
    : undefined;
  const nextSameRouteVehicle = affectedTrip
    ? tripsByRoute[affectedTrip.routeId].find(
        (trip) => trip.kind === "scheduled" && trip.tripIndex > affectedTrip.tripIndex
      )
    : null;
  const replacementCandidates = useMemo(
    () =>
      getCrossRouteCandidates({
        targetTrip: affectedTrip,
        assignments,
        tripsByRoute,
        now,
        isLive,
      }),
    [affectedTrip, assignments, isLive, now, tripsByRoute]
  );
  const supplementCandidates = useMemo(
    () =>
      getCrossRouteCandidates({
        targetTrip: supplementTrip,
        assignments,
        tripsByRoute,
        now,
        isLive,
      }),
    [assignments, isLive, now, supplementTrip, tripsByRoute]
  );
  const selectedReplacement = replacementCandidates.find(
    (candidate) => candidate.vehicle === replacementVehicle && candidate.eligible
  );
  const selectedSupplement = supplementCandidates.find(
    (candidate) => candidate.vehicle === supplementVehicle && candidate.eligible
  );
  const targetLoad = supplementTrip
    ? (routes.find((route) => route.id === supplementTrip.routeId)?.passengerLoad ?? 0)
    : 0;
  const historyRecords = useMemo(
    () =>
      operationHistory
        .filter((record) => record.date === serviceDate)
        .filter((record) => historyType === "all" || record.type === historyType)
        .filter(
          (record) =>
            historyRoute === "all" ||
            record.routeId === historyRoute ||
            record.sourceRouteId === historyRoute ||
            record.targetRouteId === historyRoute
        )
        .toSorted((left, right) => right.occurredAt.localeCompare(left.occurredAt)),
    [historyRoute, historyType, operationHistory, serviceDate]
  );

  const handleUnavailable = () => {
    if (!affectedTrip) return;
    reportVehicleNotReady({
      date: serviceDate,
      vehicle: affectedTrip.vehicle,
      routeId: affectedTrip.routeId,
      tripIndex: affectedTrip.tripIndex,
      resolution,
      replacementVehicle:
        resolution === "cross-route-replacement" ? selectedReplacement?.vehicle : undefined,
      replacementSourceRouteId:
        resolution === "cross-route-replacement"
          ? selectedReplacement?.assignment.homeRouteId
          : undefined,
      note:
        resolution === "queue-shift"
          ? "รถไม่พร้อมออก จัดรถคันถัดไปในสายรับรอบทันที"
          : "รถไม่พร้อมออก ใช้รถต่างสายรับรอบแทน",
    });
  };

  const handleSupplement = () => {
    if (!supplementTrip || !selectedSupplement) return;
    transferVehicle({
      date: serviceDate,
      vehicle: selectedSupplement.vehicle,
      sourceRouteId: selectedSupplement.assignment.homeRouteId,
      targetRouteId: supplementTrip.routeId,
      targetTripIndex: supplementTrip.tripIndex,
      note: "เสริมกำลังรถตามช่วงว่างของรถและคนขับ",
    });
  };

  const handleResetOperationalTestData = () => {
    resetOperationalTestData();
    setAffectedTripId("");
    setSupplementTripId("");
    setReplacementVehicle("");
    setSupplementVehicle("");
    setHistoryType("all");
    setHistoryRoute("all");
  };

  return (
    <Dialog open={dispatchPanelOpen} onOpenChange={(open) => !open && closeDispatchPanel()}>
      <DialogContent
        overlayClassName="z-[1000] bg-slate-950/35 backdrop-blur-sm"
        className="z-[1001] max-h-[90dvh] overflow-y-auto border-slate-200 bg-white p-0 sm:max-w-[700px]"
      >
        <DialogHeader className="border-b border-slate-200 bg-slate-50 px-5 py-4 pr-14">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <BusFront className="h-5 w-5 text-blue-800" aria-hidden="true" />
            จัดการกำลังรถ
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            เลือกรถและรอบที่ได้รับผลกระทบ คำสั่งมีผลเฉพาะวันที่ {serviceDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 p-5">
          {!isLive ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-900">
              เปลี่ยนกำลังรถได้เฉพาะวันปฏิบัติการปัจจุบัน เพื่อไม่ให้แก้แผนของวันอื่น
            </div>
          ) : null}

          <div
            className="grid grid-cols-3 rounded-lg border border-slate-200 bg-slate-100 p-1"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "unavailable"}
              onClick={() => setMode("unavailable")}
              className={`min-h-11 rounded-md px-3 text-sm font-bold transition-colors ${
                mode === "unavailable"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              รถไม่พร้อมออก
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "supplement"}
              onClick={() => setMode("supplement")}
              className={`min-h-11 rounded-md px-3 text-sm font-bold transition-colors ${
                mode === "supplement"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ย้ายรถเสริมสาย
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "history"}
              onClick={() => setMode("history")}
              className={`min-h-11 rounded-md px-3 text-sm font-bold transition-colors ${
                mode === "history"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ประวัติ
            </button>
          </div>

          {mode === "unavailable" ? (
            <section className="space-y-4" aria-label="จัดการรถไม่พร้อมออก">
              <div>
                <label className="block text-sm font-bold text-slate-800" htmlFor="affected-trip">
                  รถและรอบที่ไม่พร้อมออก
                </label>
                <select
                  id="affected-trip"
                  value={affectedTrip?.id ?? ""}
                  onChange={(event) => {
                    setAffectedTripId(event.target.value);
                    setReplacementVehicle("");
                  }}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                >
                  {dispatchTrips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.vehicle} · {getRouteLabel(trip.routeId)} · รอบ {trip.time} ·{" "}
                      {trip.assignment.driver.name}
                    </option>
                  ))}
                </select>
              </div>

              {affectedTrip ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-base font-bold text-amber-950">
                        {affectedTrip.vehicle} · {getRouteLabel(affectedTrip.routeId)} · รอบ{" "}
                        {affectedTrip.time}
                      </p>
                      <p className="mt-1 text-sm text-amber-900">
                        คนขับ {affectedTrip.assignment.driver.name}{" "}
                        {affectedTrip.assignment.driver.surname}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
                  ไม่มีรอบที่รอจัดการ
                </p>
              )}

              {activeUnavailable ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <p className="text-sm font-bold text-rose-950">
                    {activeUnavailable.vehicle} ถูกพักจากคิวแล้ว
                  </p>
                  <p className="mt-1 text-sm text-rose-900">
                    {activeUnavailable.resolution === "queue-shift"
                      ? "รถคันถัดไปรับรอบแทน และรถคันนี้จะไม่ถูกจัดลงรอบจนกว่าจะกดพร้อมกลับเข้าคิว"
                      : `${activeUnavailable.replacementVehicle} รับรอบนี้แทน รถคันเดิมยังถูกพักจากคิว`}
                  </p>
                  <button
                    type="button"
                    onClick={() => restoreVehicleToQueue(activeUnavailable.id)}
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    พร้อมกลับเข้าคิว
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                    role="group"
                    aria-label="วิธีแก้รถไม่พร้อม"
                  >
                    <button
                      type="button"
                      onClick={() => setResolution("queue-shift")}
                      className={`min-h-20 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                        resolution === "queue-shift"
                          ? "border-blue-700 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span className="block text-sm font-bold text-slate-900">
                        เลื่อนคิวในสายทันที
                      </span>
                      <span className="mt-1 block text-sm text-slate-600">
                        {nextSameRouteVehicle
                          ? `${nextSameRouteVehicle.vehicle} รับรอบ ${affectedTrip?.time ?? ""} แทน`
                          : "ใช้รถคันถัดไปที่พร้อมในสายเดียวกัน"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolution("cross-route-replacement")}
                      className={`min-h-20 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                        resolution === "cross-route-replacement"
                          ? "border-blue-700 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span className="block text-sm font-bold text-slate-900">
                        ใช้รถต่างสายแทน
                      </span>
                      <span className="mt-1 block text-sm text-slate-600">
                        เลือกรถและคนขับที่มีช่วงว่างจริงสำหรับรอบนี้
                      </span>
                    </button>
                  </div>

                  {resolution === "cross-route-replacement" ? (
                    <CandidateList
                      candidates={replacementCandidates}
                      selectedVehicle={replacementVehicle}
                      onSelect={setReplacementVehicle}
                    />
                  ) : null}

                  <button
                    type="button"
                    disabled={
                      !isLive ||
                      !affectedTrip ||
                      (resolution === "cross-route-replacement" && !selectedReplacement)
                    }
                    onClick={handleUnavailable}
                    className="min-h-11 w-full rounded-lg bg-amber-600 px-4 text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {resolution === "queue-shift"
                      ? "รายงานรถไม่พร้อมและเลื่อนคิวทันที"
                      : selectedReplacement
                        ? `ใช้ ${selectedReplacement.vehicle} รับรอบแทนทันที`
                        : "เลือกรถต่างสายที่พร้อมก่อน"}
                  </button>
                </>
              )}
            </section>
          ) : mode === "supplement" ? (
            <section className="space-y-4" aria-label="ย้ายรถเสริมสาย">
              <div>
                <label className="block text-sm font-bold text-slate-800" htmlFor="supplement-trip">
                  สายและรอบที่ต้องการรถเสริม
                </label>
                <select
                  id="supplement-trip"
                  value={supplementTrip?.id ?? ""}
                  onChange={(event) => {
                    setSupplementTripId(event.target.value);
                    setSupplementVehicle("");
                  }}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                >
                  {dispatchTrips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {getRouteLabel(trip.routeId)} · รอบ {trip.time} · รถเดิม {trip.vehicle}
                    </option>
                  ))}
                </select>
              </div>

              {supplementTrip ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                  <p className="font-bold">
                    เสริม{getRouteLabel(supplementTrip.routeId)} รอบ {supplementTrip.time}
                  </p>
                  <p className="mt-1 text-blue-900">
                    ภาระผู้โดยสาร {targetLoad}%{targetLoad >= 80 ? " · แนะนำให้เสริมรถ" : ""}
                  </p>
                </div>
              ) : null}

              <CandidateList
                candidates={supplementCandidates}
                selectedVehicle={supplementVehicle}
                onSelect={setSupplementVehicle}
              />

              <button
                type="button"
                disabled={!isLive || !supplementTrip || !selectedSupplement}
                onClick={handleSupplement}
                className="min-h-11 w-full rounded-lg bg-blue-800 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {selectedSupplement
                  ? `ยืนยันให้ ${selectedSupplement.vehicle} เสริม 1 รอบ`
                  : "เลือกรถที่มีช่วงว่างก่อน"}
              </button>
            </section>
          ) : (
            <OperationHistoryList
              records={historyRecords}
              historyType={historyType}
              historyRoute={historyRoute}
              hasOperationalTestData={hasOperationalTestData}
              onHistoryTypeChange={setHistoryType}
              onHistoryRouteChange={setHistoryRoute}
              onReset={handleResetOperationalTestData}
            />
          )}

          {mode !== "history" && events.length > 0 ? (
            <section className="border-t border-slate-200 pt-4" aria-labelledby="dispatch-history">
              <h3 id="dispatch-history" className="text-sm font-bold text-slate-900">
                คำสั่งวันนี้
              </h3>
              <div className="mt-2 space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div className="min-w-0 text-sm text-slate-700">
                      <p className="font-semibold">
                        {event.type === "unavailable"
                          ? `${event.vehicle} · ${event.readyAt ? "กลับเข้าคิวแล้ว" : "พักจากคิว"}`
                          : `${event.vehicle} · เสริม${getRouteLabel(event.targetRouteId)} 1 รอบ`}
                      </p>
                      {event.type === "unavailable" &&
                      event.resolution === "cross-route-replacement" ? (
                        <p className="mt-0.5 text-slate-500">
                          {event.replacementVehicle} รับรอบแทน
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {event.type === "unavailable" && !event.readyAt ? (
                        <button
                          type="button"
                          onClick={() => restoreVehicleToQueue(event.id)}
                          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                        >
                          พร้อม
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeDispatchEvent(event.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
                        aria-label="ยกเลิกคำสั่ง"
                        title="ยกเลิกคำสั่ง"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OperationHistoryList({
  records,
  historyType,
  historyRoute,
  hasOperationalTestData,
  onHistoryTypeChange,
  onHistoryRouteChange,
  onReset,
}: {
  records: FleetOperationRecord[];
  historyType: "all" | FleetOperationType;
  historyRoute: "all" | RouteId;
  hasOperationalTestData: boolean;
  onHistoryTypeChange: (value: "all" | FleetOperationType) => void;
  onHistoryRouteChange: (value: "all" | RouteId) => void;
  onReset: () => void;
}) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <section className="space-y-4" aria-label="ประวัติการจัดรถ">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-blue-800" aria-hidden="true" />
          <div>
            <h3 className="text-base font-bold text-slate-900">ประวัติการจัดรถ</h3>
            <p className="mt-0.5 text-sm text-slate-600">
              เก็บทุกคำสั่ง แม้คำสั่งนั้นจะถูกย้อนกลับแล้ว
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={!hasOperationalTestData}
          onClick={() => setConfirmingReset(true)}
          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          รีเซ็ตข้อมูล
        </button>
      </div>

      {confirmingReset ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-950"
        >
          <p className="text-sm font-bold">ยืนยันรีเซ็ตข้อมูลทดสอบทั้งหมด?</p>
          <p className="mt-1 text-sm leading-5 text-rose-800">
            คำสั่งจัดรถ ประวัติ และการใช้คนขับสำรองทุกวันจะถูกล้าง
            ระบบจะกลับไปใช้ตารางรถและคนขับเริ่มต้น
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => {
                onReset();
                setConfirmingReset(false);
              }}
              className="min-h-10 rounded-md bg-rose-700 px-3 text-sm font-bold text-white hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2"
            >
              ยืนยันรีเซ็ต
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">
          ประเภทเหตุการณ์
          <select
            value={historyType}
            onChange={(event) =>
              onHistoryTypeChange(event.target.value as "all" | FleetOperationType)
            }
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          >
            {HISTORY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-slate-700">
          สายรถ
          <select
            value={historyRoute}
            onChange={(event) => onHistoryRouteChange(event.target.value as "all" | RouteId)}
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">ทุกสาย</option>
            {ROUTES.map((route) => (
              <option key={route.id} value={route.id}>
                {route.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {records.length ? (
        <ol className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {records.map((record) => {
            const statusMeta =
              record.status === "reverted"
                ? { label: "ยกเลิกแล้ว", className: "bg-slate-100 text-slate-700" }
                : record.status === "completed"
                  ? { label: "เสร็จสิ้น", className: "bg-emerald-50 text-emerald-800" }
                  : { label: "กำลังมีผล", className: "bg-blue-50 text-blue-800" };
            const time = new Intl.DateTimeFormat("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }).format(new Date(record.occurredAt));

            return (
              <li key={record.id} className="flex gap-3 px-3 py-3">
                <time className="w-16 shrink-0 pt-0.5 text-sm font-bold tabular-nums text-slate-500">
                  {time}
                </time>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{record.title}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{record.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
          ยังไม่มีประวัติสำหรับวันที่และตัวกรองที่เลือก
        </div>
      )}
    </section>
  );
}

function CandidateList({
  candidates,
  selectedVehicle,
  onSelect,
}: {
  candidates: ReturnType<typeof getCrossRouteCandidates>;
  selectedVehicle: string;
  onSelect: (vehicle: string) => void;
}) {
  const eligibleCount = candidates.filter((candidate) => candidate.eligible).length;

  return (
    <section aria-labelledby="candidate-vehicles">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="candidate-vehicles" className="text-sm font-bold text-slate-800">
          รถและคนขับต่างสาย
        </h3>
        <span className="text-sm text-slate-600">พร้อม {eligibleCount} คัน</span>
      </div>
      <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
        {candidates.map((candidate) => {
          const selected = candidate.vehicle === selectedVehicle;
          return (
            <button
              key={candidate.vehicle}
              type="button"
              disabled={!candidate.eligible}
              onClick={() => onSelect(candidate.vehicle)}
              className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? "border-blue-700 bg-blue-50"
                  : candidate.eligible
                    ? "border-slate-200 bg-white hover:bg-slate-50"
                    : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {candidate.vehicle} · {candidate.assignment.driver.name}{" "}
                    {candidate.assignment.driver.surname}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    จาก{getRouteLabel(candidate.assignment.homeRouteId)} · {candidate.reason}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-bold ${
                    candidate.eligible ? "text-emerald-700" : "text-slate-500"
                  }`}
                >
                  {candidate.eligible ? "เลือกได้" : "ใช้ไม่ได้"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {candidates.length === 0 ? (
        <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          ไม่มีรถจากสายอื่นในตารางวันนี้
        </p>
      ) : null}
    </section>
  );
}
