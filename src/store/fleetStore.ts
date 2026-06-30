"use client";

import { create } from "zustand";
import type { Driver, ReserveDriver, Route, TransferRecord, LeaveReason, RouteRotationConfig, RouteId } from "@/types";
import { DRIVERS, RESERVE_DRIVERS, ROUTES } from "@/mock-data";

export interface SpeedingLog {
  id: string;
  driverName: string;
  vehicle: string;
  speed: number;
  time: string;
}

interface FleetState {
  drivers: Driver[];
  reserveDrivers: ReserveDriver[];
  routes: Route[];
  transferHistory: TransferRecord[];
  selectedReserve: ReserveDriver | null;
  pendingDriverId: number | null;
  modalOpen: boolean;
  routeFilter: string;
  statusFilter: string;
  searchQuery: string;
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
  setRouteFilter: (val: string) => void;
  setStatusFilter: (val: string) => void;
  setSearchQuery: (val: string) => void;
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
}

export const useFleetStore = create<FleetState>((set, get) => ({
  drivers: [...DRIVERS],
  reserveDrivers: [...RESERVE_DRIVERS],
  routes: [...ROUTES],
  transferHistory: [],
  selectedReserve: null,
  pendingDriverId: null,
  modalOpen: false,
  routeFilter: "",
  statusFilter: "",
  searchQuery: "",
  toast: { message: "", visible: false },
  panelsCollapsed: false,
  mapOnly: false,
  rotationConfigs: {},
  speedingLogs: [],
  userRole: "dispatcher",
  isLoggedIn: false,
  currentUser: null,

  loginDispatcher: () => set({ isLoggedIn: true, userRole: "dispatcher", currentUser: null }),
  
  loginDriver: (driverId) => {
    const driver = get().drivers.find(d => d.id === driverId);
    if (driver) {
      set({ isLoggedIn: true, userRole: "driver", currentUser: driver });
    }
  },
  
  logout: () => set({ isLoggedIn: false, userRole: "dispatcher", currentUser: null }),

  setUserRole: (role) => set({ userRole: role }),

  setSelectedReserve: (reserve) => set({ selectedReserve: reserve }),

  openModal: (driverId) => set({ pendingDriverId: driverId, modalOpen: true }),

  closeModal: () => set({ modalOpen: false, pendingDriverId: null }),
  
  setRotationConfig: (routeId, config) => set((s) => ({
    rotationConfigs: { ...s.rotationConfigs, [routeId]: config }
  })),

  confirmTransfer: (reason, date, notes) => {
    const { pendingDriverId, selectedReserve, drivers, reserveDrivers, transferHistory } = get();
    if (!pendingDriverId) return;

    const reserve = selectedReserve ?? reserveDrivers.find((r) => r.status === "Available") ?? null;
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

    set({
      drivers: drivers.map((d) =>
        d.id === pendingDriverId ? { ...d, status: "Leave" } : d
      ),
      reserveDrivers: reserveDrivers.map((r) =>
        r.id === reserve.id ? { ...r, status: "Assigned" } : r
      ),
      transferHistory: [record, ...transferHistory],
      modalOpen: false,
      pendingDriverId: null,
      selectedReserve: null,
    });

    const driver = drivers.find((d) => d.id === pendingDriverId);
    get().showToast(
      `✓ ${reserve.name} assigned to ${driver?.route ?? ""} replacing ${driver?.name ?? ""}`
    );
  },

  setRouteFilter: (val) => set({ routeFilter: val }),
  setStatusFilter: (val) => set({ statusFilter: val }),
  setSearchQuery: (val) => set({ searchQuery: val }),

  showToast: (message) => {
    set({ toast: { message, visible: true } });
    setTimeout(() => get().hideToast(), 3000);
  },

  hideToast: () => set({ toast: { message: "", visible: false } }),

  updatePassengerLoad: (routeId, load) =>
    set((s) => ({
      routes: s.routes.map((r) =>
        r.id === routeId ? { ...r, passengerLoad: load } : r
      ),
    })),

  togglePanels: () => set((s) => ({ panelsCollapsed: !s.panelsCollapsed })),
  toggleMapOnly: () => set((s) => ({ mapOnly: !s.mapOnly })),
  
  focusDriverId: null,
  focusTrigger: 0,
  setFocusDriverId: (id) => set((state) => ({ focusDriverId: id, focusTrigger: state.focusTrigger + 1 })),

  addSpeedingLog: (log) => set((state) => {
    const newLog: SpeedingLog = {
      ...log,
      id: `SPL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    return {
      speedingLogs: [newLog, ...state.speedingLogs].slice(0, 50) // Keep latest 50 logs
    };
  }),
  clearSpeedingLogs: () => set({ speedingLogs: [] })
}));
