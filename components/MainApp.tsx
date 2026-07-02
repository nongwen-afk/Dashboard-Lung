"use client";

import { useFleetStore } from "@/lib/store/fleetStore";
import { LoginView } from "@/components/auth/LoginView";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { DriverView } from "@/components/driver/DriverView";

export function MainApp() {
  // NOTE: This is a temporary UI-only mock auth flow for demo/navigation parity with pleum.
  // Real authentication and role-based routing will be handled by Better Auth later.
  // Do NOT connect this to the real auth database.
  const { isLoggedIn, userRole } = useFleetStore();

  if (!isLoggedIn) {
    return <LoginView />;
  }

  if (userRole === "dispatcher") {
    return <DashboardView />;
  }

  if (userRole === "driver") {
    return <DriverView />;
  }

  return null;
}
