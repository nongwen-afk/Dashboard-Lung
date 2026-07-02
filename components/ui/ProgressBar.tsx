import { getLoadColor, cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  color,
  height = "h-1.5",
  showLabel = false,
  className,
  animated = true,
}: ProgressBarProps) {
  const barColor = color ?? getLoadColor(value);

  return (
    <div className={className}>
      <div className={cn("w-full bg-gray-100 rounded-full overflow-hidden", height)}>
        <div
          className={cn("h-full rounded-full", animated && "transition-all duration-500")}
          style={{ width: `${Math.min(100, value)}%`, backgroundColor: barColor }}
        />
      </div>
      {showLabel && (
        <p className="text-[0.5625rem] font-semibold mt-0.5" style={{ color: barColor }}>
          {value}%
        </p>
      )}
    </div>
  );
}
