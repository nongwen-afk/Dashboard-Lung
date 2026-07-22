import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
export default function AnalyticsPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-slate-900">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title="วิเคราะห์การเดินรถ" subtitle="ประสิทธิภาพและสถิติการดำเนินงาน" />

        {/* Main content area */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8"
          style={{ background: "#f8fafc" }}
        >
          <div className="max-w-7xl mx-auto pb-20 md:pb-6">
            <AnalyticsDashboard />
          </div>
        </div>

        {/* Mobile bottom navigation — hidden on desktop */}
        <div className="block md:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
}
