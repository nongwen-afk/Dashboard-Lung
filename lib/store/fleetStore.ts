"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  Driver,
  ReserveDriver,
  Route,
  TransferRecord,
  LeaveReason,
  RouteRotationConfig,
  RouteId,
  FleetDispatchEvent,
  FleetOperationRecord,
  VehicleUnavailableResolution,
} from "@/types";

export interface SpeedingLog {
  id: string;
  driverName: string;
  vehicle: string;
  speed: number;
  time: string;
}

const serverSafeStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

interface FleetState {
  drivers: Driver[];
  reserveDrivers: ReserveDriver[];
  routes: Route[];
  transferHistory: TransferRecord[];
  dispatchEvents: FleetDispatchEvent[];
  operationHistory: FleetOperationRecord[];
  dispatchPanelOpen: boolean;
  selectedReserve: ReserveDriver | null;
  pendingDriverId: number | null;
  modalOpen: boolean;
  routeFilter: string;
  statusFilter: string;
  searchQuery: string;
  selectedServiceDate: string | null;
  toast: { message: string; visible: boolean };
  panelsCollapsed: boolean;
  mapOnly: boolean;
  speedingLogs: SpeedingLog[];
  userRole: "dispatcher" | "driver";
  isLoggedIn: boolean;
  currentUser: Driver | null;

  // Actions
  loginDispatcher: () => void;
  loginDriver: (driverId: number) => void;
  logout: () => void;

  setSelectedReserve: (reserve: ReserveDriver | null) => void;
  openModal: (driverId: number) => void;
  closeModal: () => void;
  confirmTransfer: (reason: LeaveReason, date: string, notes: string) => void;
  reportVehicleNotReady: (input: {
    date: string;
    vehicle: string;
    routeId: RouteId;
    tripIndex: number;
    resolution: VehicleUnavailableResolution;
    replacementVehicle?: string;
    replacementSourceRouteId?: RouteId;
    note?: string;
  }) => void;
  restoreVehicleToQueue: (eventId: string) => void;
  transferVehicle: (input: {
    date: string;
    vehicle: string;
    sourceRouteId: RouteId;
    targetRouteId: RouteId;
    targetTripIndex: number;
    note?: string;
  }) => void;
  removeDispatchEvent: (eventId: string) => void;
  resetOperationalTestData: () => void;
  openDispatchPanel: () => void;
  closeDispatchPanel: () => void;
  setRouteFilter: (val: string) => void;
  setStatusFilter: (val: string) => void;
  setSearchQuery: (val: string) => void;
  setSelectedServiceDate: (date: string) => void;
  resetSelectedServiceDate: () => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  updatePassengerLoad: (routeId: string, load: number) => void;
  togglePanels: () => void;
  toggleMapOnly: () => void;
  focusDriverId: number | null;
  focusTrigger: number;
  setFocusDriverId: (id: number | null) => void;

  rotationConfigs: Record<string, RouteRotationConfig>;
  setUserRole: (role: "dispatcher" | "driver") => void;
  setRotationConfig: (routeId: RouteId, config: RouteRotationConfig) => void;
  addSpeedingLog: (log: Omit<SpeedingLog, "id" | "time">) => void;
  clearSpeedingLogs: () => void;

  isLoading: boolean;
  error: string | null;
  hasHydratedFleetData: boolean;
  hydrateFleetData: (routes: Route[], drivers: Driver[], reserveDrivers: ReserveDriver[]) => void;
}

export const useFleetStore = create<FleetState>()(
  persist(
    (set, get) => ({
      drivers: [],
      reserveDrivers: [],
      routes: [],
      transferHistory: [],
      dispatchEvents: [],
      operationHistory: [],
      dispatchPanelOpen: false,
      selectedReserve: null,
      pendingDriverId: null,
      modalOpen: false,
      routeFilter: "",
      statusFilter: "",
      searchQuery: "",
      selectedServiceDate: null,
      toast: { message: "", visible: false },
      panelsCollapsed: false,
      mapOnly: false,
      rotationConfigs: {},
      speedingLogs: [],
      userRole: "dispatcher",
      isLoggedIn: false,
      currentUser: null,
      isLoading: false, // Default false, pages will fetch server-side before render
      error: null,

      hasHydratedFleetData: false,

      hydrateFleetData: (routes, drivers, reserveDrivers) =>
        set({
          routes,
          drivers,
          reserveDrivers,
          isLoading: false,
          error: null,
          hasHydratedFleetData: true,
        }),

      loginDispatcher: () => set({ isLoggedIn: true, userRole: "dispatcher", currentUser: null }),

      loginDriver: (driverId) => {
        const driver = get().drivers.find((d) => d.id === driverId);
        if (driver) {
          set({ isLoggedIn: true, userRole: "driver", currentUser: driver });
        }
      },

      logout: () => set({ isLoggedIn: false, userRole: "dispatcher", currentUser: null }),

      setUserRole: (role) => set({ userRole: role }),

      setSelectedReserve: (reserve) => set({ selectedReserve: reserve }),

      openModal: (driverId) => set({ pendingDriverId: driverId, modalOpen: true }),

      closeModal: () => set({ modalOpen: false, pendingDriverId: null }),

      setRotationConfig: (routeId, config) =>
        set((s) => ({
          rotationConfigs: { ...s.rotationConfigs, [routeId]: config },
        })),

      confirmTransfer: (reason, date, notes) => {
        const { pendingDriverId, selectedReserve, drivers, reserveDrivers, transferHistory } =
          get();
        if (!pendingDriverId) return;

        const reservedForDate = new Set(
          transferHistory
            .filter((transfer) => transfer.date === date)
            .map((transfer) => transfer.reserveDriverId)
        );
        const reserve =
          (selectedReserve && !reservedForDate.has(selectedReserve.id) ? selectedReserve : null) ??
          reserveDrivers.find((candidate) => !reservedForDate.has(candidate.id)) ??
          null;
        if (!reserve) return;

        const record: TransferRecord = {
          id: `TR-${Date.now()}`,
          originalDriverId: pendingDriverId,
          reserveDriverId: reserve.id,
          reason,
          date,
          notes,
          timestamp: new Date(),
        };

        const driver = drivers.find((candidate) => candidate.id === pendingDriverId);
        const occurredAt = new Date().toISOString();
        set({
          transferHistory: [
            record,
            ...transferHistory.filter(
              (transfer) => transfer.originalDriverId !== pendingDriverId || transfer.date !== date
            ),
          ],
          modalOpen: false,
          pendingDriverId: null,
          selectedReserve: null,
          operationHistory: [
            {
              id: `OPR-${Date.now()}-reserve`,
              date,
              occurredAt,
              type: "reserve-driver-replacement",
              status: "active",
              title: "ใช้คนขับสำรองแทน",
              detail: `${reserve.name} แทน ${driver?.name ?? "คนขับเดิม"} · รถ ${driver?.vehicle ?? "-"}`,
              vehicle: driver?.vehicle,
              routeId: driver?.routeId,
            },
            ...get().operationHistory,
          ],
        });

        get().showToast(
          `✓ ${reserve.name} assigned to ${driver?.route ?? ""} replacing ${driver?.name ?? ""}`
        );
      },

      reportVehicleNotReady: ({
        date,
        vehicle,
        routeId,
        tripIndex,
        resolution,
        replacementVehicle,
        replacementSourceRouteId,
        note,
      }) => {
        const duplicate = get().dispatchEvents.some(
          (event) =>
            event.type === "unavailable" &&
            event.date === date &&
            event.routeId === routeId &&
            event.tripIndex === tripIndex
        );
        if (duplicate) return;

        const occurredAt = new Date().toISOString();
        const eventId = `UNV-${Date.now()}`;
        set((state) => ({
          dispatchEvents: [
            ...state.dispatchEvents,
            {
              id: eventId,
              type: "unavailable",
              date,
              vehicle,
              routeId,
              tripIndex,
              resolution,
              replacementVehicle,
              replacementSourceRouteId,
              note,
              createdAt: occurredAt,
            },
          ],
          operationHistory: [
            {
              id: `OPR-${Date.now()}-unavailable`,
              date,
              occurredAt,
              type: "vehicle-unavailable",
              status: "active",
              title: `${vehicle} ไม่พร้อมออก`,
              detail: `พักรถและคนขับจาก${routeId} รอบ ${tripIndex + 1}`,
              vehicle,
              routeId,
              tripIndex,
              relatedEventId: eventId,
            },
            {
              id: `OPR-${Date.now()}-resolution`,
              date,
              occurredAt,
              type: resolution === "queue-shift" ? "queue-advanced" : "cross-route-replacement",
              status: "active",
              title:
                resolution === "queue-shift"
                  ? "เลื่อนรถคันถัดไปรับรอบ"
                  : `${replacementVehicle} รับรอบแทน`,
              detail:
                resolution === "queue-shift"
                  ? `รถคันถัดไปใน${routeId} รับรอบ ${tripIndex + 1} ทันที`
                  : `${replacementVehicle} จาก${replacementSourceRouteId} รับรอบ ${tripIndex + 1} ของ${routeId}`,
              vehicle: replacementVehicle ?? vehicle,
              routeId,
              sourceRouteId: replacementSourceRouteId,
              targetRouteId: routeId,
              tripIndex,
              relatedEventId: eventId,
            },
            ...state.operationHistory,
          ],
          dispatchPanelOpen: false,
        }));
        get().showToast(
          resolution === "queue-shift"
            ? `${vehicle} ถูกพักจากคิวแล้ว รถคันถัดไปรับรอบทันที`
            : `${replacementVehicle} รับรอบแทน ${vehicle} แล้ว`
        );
      },

      restoreVehicleToQueue: (eventId) => {
        const event = get().dispatchEvents.find((candidate) => candidate.id === eventId);
        if (!event || event.type !== "unavailable" || event.readyAt) return;

        set((state) => ({
          dispatchEvents: state.dispatchEvents.map((candidate) =>
            candidate.id === eventId && candidate.type === "unavailable"
              ? { ...candidate, readyAt: new Date().toISOString() }
              : candidate
          ),
          operationHistory: [
            {
              id: `OPR-${Date.now()}-restored`,
              date: event.date,
              occurredAt: new Date().toISOString(),
              type: "vehicle-restored",
              status: "completed",
              title: `${event.vehicle} พร้อมกลับเข้าคิว`,
              detail: `รถและคนขับกลับเข้าท้ายคิวของ${event.routeId}`,
              vehicle: event.vehicle,
              routeId: event.routeId,
              tripIndex: event.tripIndex,
              relatedEventId: event.id,
            },
            ...state.operationHistory,
          ],
        }));
        get().showToast(`${event.vehicle} พร้อมแล้ว และจะกลับเข้าท้ายคิวในรอบที่ปลอดภัย`);
      },

      transferVehicle: ({ date, vehicle, sourceRouteId, targetRouteId, targetTripIndex, note }) => {
        const duplicate = get().dispatchEvents.some(
          (event) =>
            event.type === "transfer" &&
            event.date === date &&
            event.vehicle === vehicle &&
            event.targetTripIndex === targetTripIndex
        );
        if (duplicate || sourceRouteId === targetRouteId) return;

        const occurredAt = new Date().toISOString();
        const eventId = `XFR-${Date.now()}`;
        set((state) => ({
          dispatchEvents: [
            ...state.dispatchEvents,
            {
              id: eventId,
              type: "transfer",
              date,
              vehicle,
              sourceRouteId,
              targetRouteId,
              targetTripIndex,
              purpose: "supplemental",
              note,
              createdAt: occurredAt,
            },
          ],
          operationHistory: [
            {
              id: `OPR-${Date.now()}-supplement`,
              date,
              occurredAt,
              type: "supplemental-transfer",
              status: "active",
              title: `${vehicle} ย้ายไปเสริม${targetRouteId}`,
              detail: `จาก${sourceRouteId} ไปเสริมรอบ ${targetTripIndex + 1} ของ${targetRouteId}`,
              vehicle,
              sourceRouteId,
              targetRouteId,
              tripIndex: targetTripIndex,
              relatedEventId: eventId,
            },
            ...state.operationHistory,
          ],
          dispatchPanelOpen: false,
        }));
        get().showToast(`ย้าย ${vehicle} ไปเสริมสาย ${targetRouteId} 1 รอบแล้ว`);
      },

      removeDispatchEvent: (eventId) => {
        const event = get().dispatchEvents.find((candidate) => candidate.id === eventId);
        if (!event) return;

        set((state) => ({
          dispatchEvents: state.dispatchEvents.filter((candidate) => candidate.id !== eventId),
          operationHistory: [
            {
              id: `OPR-${Date.now()}-reverted`,
              date: event.date,
              occurredAt: new Date().toISOString(),
              type: "dispatch-reverted",
              status: "reverted",
              title: `ยกเลิกคำสั่ง ${event.vehicle}`,
              detail:
                event.type === "unavailable"
                  ? `ยกเลิกการพักรถจาก${event.routeId} รอบ ${event.tripIndex + 1}`
                  : `ยกเลิกการเสริม${event.targetRouteId} รอบ ${event.targetTripIndex + 1}`,
              vehicle: event.vehicle,
              routeId: event.type === "unavailable" ? event.routeId : event.targetRouteId,
              sourceRouteId: event.type === "transfer" ? event.sourceRouteId : undefined,
              targetRouteId: event.type === "transfer" ? event.targetRouteId : undefined,
              tripIndex: event.type === "unavailable" ? event.tripIndex : event.targetTripIndex,
              relatedEventId: event.id,
            },
            ...state.operationHistory,
          ],
        }));
      },
      resetOperationalTestData: () => {
        set({
          dispatchEvents: [],
          operationHistory: [],
          transferHistory: [],
          selectedReserve: null,
          pendingDriverId: null,
          modalOpen: false,
        });
        get().showToast("รีเซ็ตข้อมูลทดสอบกลับเป็นค่าเริ่มต้นแล้ว");
      },
      openDispatchPanel: () => set({ dispatchPanelOpen: true }),
      closeDispatchPanel: () => set({ dispatchPanelOpen: false }),

      setRouteFilter: (val) => set({ routeFilter: val }),
      setStatusFilter: (val) => set({ statusFilter: val }),
      setSearchQuery: (val) => set({ searchQuery: val }),
      setSelectedServiceDate: (date) => set({ selectedServiceDate: date }),
      resetSelectedServiceDate: () => set({ selectedServiceDate: null }),

      showToast: (message) => {
        set({ toast: { message, visible: true } });
        setTimeout(() => get().hideToast(), 3000);
      },

      hideToast: () => set({ toast: { message: "", visible: false } }),

      updatePassengerLoad: (routeId, load) =>
        set((s) => ({
          routes: s.routes.map((r) => (r.id === routeId ? { ...r, passengerLoad: load } : r)),
        })),

      togglePanels: () => set((s) => ({ panelsCollapsed: !s.panelsCollapsed })),
      toggleMapOnly: () => set((s) => ({ mapOnly: !s.mapOnly })),

      focusDriverId: null,
      focusTrigger: 0,
      setFocusDriverId: (id) =>
        set((state) => ({
          focusDriverId: id,
          focusTrigger: state.focusTrigger + 1,
          panelsCollapsed: id ? false : state.panelsCollapsed,
        })),

      addSpeedingLog: (log) =>
        set((state) => {
          const newLog: SpeedingLog = {
            ...log,
            id: `SPL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            time: new Date().toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          };
          return {
            speedingLogs: [newLog, ...state.speedingLogs].slice(0, 50), // Keep latest 50 logs
          };
        }),
      clearSpeedingLogs: () => set({ speedingLogs: [] }),
    }),
    {
      name: "dashboard-lung-operational-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? serverSafeStorage : localStorage
      ),
      partialize: (state) => ({
        dispatchEvents: state.dispatchEvents,
        operationHistory: state.operationHistory,
        transferHistory: state.transferHistory,
      }),
    }
  )
);
