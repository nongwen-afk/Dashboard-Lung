import { cn } from "@/lib/utils";
import type { DriverStatus } from "@/types";

interface StatusBadgeProps {
  status: DriverStatus;
  className?: string;
}

const STATUS_STYLES: Record<DriverStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Leave: "bg-red-100 text-red-600",
  Assigned: "bg-blue-100 text-blue-700",
  Substitute: "bg-indigo-100 text-indigo-700",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[0.5625rem] font-semibold",
        STATUS_STYLES[status],
        className
      )}
    >
      {status}
    </span>
  );
}

interface RouteBadgeProps {
  routeId: string;
  label: string;
  color: string;
}

export function RouteBadge({ label, color }: RouteBadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.5625rem] font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
