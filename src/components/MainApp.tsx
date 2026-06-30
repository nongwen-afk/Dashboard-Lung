"use client";

import { useFleetStore } from "@/store/fleetStore";
import { LoginView } from "@/components/auth/LoginView";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { DriverView } from "@/components/driver/DriverView";

export function MainApp() {
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
