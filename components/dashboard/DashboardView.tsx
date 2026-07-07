"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MapArea } from "@/components/dashboard/MapArea";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { ReplaceDriverModal } from "@/components/modals/ReplaceDriverModal";
import { Toast } from "@/components/ui/Toast";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobilePanel } from "@/components/dashboard/MobilePanel";

export function DashboardView() {
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
