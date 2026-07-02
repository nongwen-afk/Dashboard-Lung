"use client";

import { useFleetStore } from "@/lib/store/fleetStore";
import { cn } from "@/lib/utils";

export function Toast() {
  const { toast } = useFleetStore();

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]",
        "bg-[#1a1a2e] text-white text-xs font-semibold",
        "px-5 py-3 rounded-xl shadow-2xl whitespace-nowrap",
        "transition-all duration-300",
        toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      {toast.message}
    </div>
  );
}
