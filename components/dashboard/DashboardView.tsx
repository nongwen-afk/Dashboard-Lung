"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MapArea } from "@/components/dashboard/MapArea";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { ReplaceDriverModal } from "@/components/modals/ReplaceDriverModal";
import { Toast } from "@/components/ui/Toast";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobilePanel } from "@/components/dashboard/MobilePanel";
import { useHydrateFleet } from "@/hooks/useHydrateFleet";
import { Loader2 } from "lucide-react";

export function DashboardView() {
  const { isLoading, error } = useHydrateFleet();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100 flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-600 font-medium">Loading Fleet Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100 flex-col gap-4">
        <p className="text-red-500 font-medium text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />

        {/* Main content area */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {/* Map fills entire area */}
          <MapArea />

          {/* Desktop right curtain — hidden on mobile */}
          <div className="hidden md:block">
            <RightPanel />
          </div>

          {/* Mobile panel (bottom sheet style) */}
          <div className="block md:hidden">
            <MobilePanel />
          </div>
        </div>

        {/* Mobile bottom navigation — hidden on desktop */}
        <div className="block md:hidden">
          <MobileBottomNav />
        </div>
      </div>

      <ReplaceDriverModal />
      <Toast />
    </div>
  );
}
