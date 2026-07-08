"use client";

import React from "react";
import { useHydrateFleet } from "@/hooks/useHydrateFleet";
import { useFleetStore } from "@/lib/store/fleetStore";
import { FleetLoadingScreen } from "@/components/layout/FleetLoadingScreen";

export function FleetLoadingGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useHydrateFleet();
  const hasHydratedFleetData = useFleetStore((state) => state.hasHydratedFleetData);
  const error = useFleetStore((state) => state.error);

  if (hasHydratedFleetData) {
    return <>{children}</>;
  }

  if (error) {
    return <FleetLoadingScreen error={error} />;
  }

  // Fallback to loading screen if we haven't hydrated yet
  return <FleetLoadingScreen />;
}
