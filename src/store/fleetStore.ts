"use client";

import { create } from "zustand";
import type { Driver, ReserveDriver, Route, TransferRecord, LeaveReason } from "@/types";
import { DRIVERS, RESERVE_DRIVERS, ROUTES } from "@/mock-data";

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
  
  // Actions
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
  setFocusDriverId: (id: number | null) => void;
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

  setSelectedReserve: (reserve) => set({ selectedReserve: reserve }),

  openModal: (driverId) => set({ pendingDriverId: driverId, modalOpen: true }),

  closeModal: () => set({ modalOpen: false, pendingDriverId: null }),

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
  setFocusDriverId: (id) => set({ focusDriverId: id }),
}));
