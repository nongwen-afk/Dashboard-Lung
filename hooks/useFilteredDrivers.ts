"use client";

import { useMemo } from "react";
import { useFleetStore } from "@/lib/store/fleetStore";
import type { Driver } from "@/types";

export function useFilteredDrivers(): Driver[] {
  const { drivers, routeFilter, statusFilter, searchQuery } = useFleetStore();

  return useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return drivers.filter((d) => {
      const matchRoute = !routeFilter || d.route === routeFilter;
      const matchStatus = !statusFilter || d.status === statusFilter;
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.surname.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q);
      return matchRoute && matchStatus && matchSearch;
    });
  }, [drivers, routeFilter, statusFilter, searchQuery]);
}
