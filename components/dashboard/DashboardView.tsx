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
  const { isLoading } = useHydrateFleet();
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

          {isLoading && (
            <div className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-slate-800">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <h2 className="text-xl font-bold">Loading Fleet Data...</h2>
              <p className="text-slate-500 text-sm mt-2">กำลังเตรียมข้อมูลการเดินรถ</p>
            </div>
          )}
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
