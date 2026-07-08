"use client";

import React from "react";
import { useHydrateFleet } from "@/hooks/useHydrateFleet";
import { useFleetStore } from "@/lib/store/fleetStore";
import { FleetLoadingScreen } from "@/components/layout/FleetLoadingScreen";

export function FleetLoadingGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useHydrateFleet();
  const hasHydratedFleetData = useFleetStore((state) => state.hasHydratedFleetData);
  const error = useFleetStore((state) => state.error);

  if (error) {
    return <FleetLoadingScreen error={error} />;
  }

  // If currently loading and we don't have data yet, show the full-page loading screen
  if (isLoading || !hasHydratedFleetData) {
    return <FleetLoadingScreen />;
  }

  // If data is ready, render the children
  return <>{children}</>;
}
