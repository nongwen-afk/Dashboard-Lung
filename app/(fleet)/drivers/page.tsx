import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DriverDashboard } from "@/components/drivers/DriverDashboard";

export default function DriversPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-slate-900">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />

        {/* Main content area */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8"
          style={{ background: "#f8fafc" }}
        >
          <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-6">
            {/* Header Section */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                บุคลากร (Drivers)
              </h1>
              <p className="text-sm md:text-base text-slate-500 mt-1">
                ข้อมูลการเดินรถและสถิติส่วนบุคคลของพนักงานขับรถ
              </p>
            </div>

            <DriverDashboard />
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
