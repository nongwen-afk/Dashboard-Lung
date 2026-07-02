"use client";

import { useFleetStore } from "@/lib/store/fleetStore";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

export function PanelToggleButton() {
  const { panelsCollapsed, togglePanels } = useFleetStore();

  return (
    <button
      onClick={togglePanels}
      title={panelsCollapsed ? "เปิดแผนที่ (ย่อแผง)" : "ขยายแผง (ปิดแผนที่)"}
      className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 group"
      style={{ background: "rgba(37,99,235,0.07)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,99,235,0.14)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(37,99,235,0.18)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,99,235,0.07)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
    >
      {panelsCollapsed ? (
        <ChevronsLeft className="w-4 h-4 text-[#1e3a8a]" />
      ) : (
        <ChevronsRight className="w-4 h-4 text-[#1e3a8a]" />
      )}
    </button>
  );
}
