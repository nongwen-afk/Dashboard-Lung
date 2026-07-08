import React from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface FleetLoadingScreenProps {
  error?: string | null;
}

export function FleetLoadingScreen({ error }: FleetLoadingScreenProps) {
  if (error) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-gray-50 text-slate-800 p-6 min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Fleet Data</h2>
        <p className="text-slate-500 text-sm text-center max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-gray-50 text-slate-800 p-6 min-h-[400px]">
      <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
      <h2 className="text-xl font-bold">Loading Fleet Data...</h2>
      <p className="text-slate-500 text-sm mt-2">กำลังเตรียมข้อมูลการเดินรถ</p>
    </div>
  );
}
