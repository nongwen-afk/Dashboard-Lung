import { getAvatarColor, getInitials, cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const SIZE_MAP = {
  xs: "w-5 h-5 text-[0.5rem]",
  sm: "w-7 h-7 text-[0.5625rem]",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

export function Avatar({ name, size = "md", color, className }: AvatarProps) {
  const bg = color ?? getAvatarColor(name);
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white flex-shrink-0",
        SIZE_MAP[size],
        className
      )}
      style={{ backgroundColor: bg }}
    >
      {getInitials(name)}
    </div>
  );
}
