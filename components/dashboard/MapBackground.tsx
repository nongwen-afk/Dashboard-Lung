"use client";

import dynamic from "next/dynamic";
import { useDashboardServiceDate } from "@/hooks/useDashboardServiceDate";

const LeafletMap = dynamic(() => import("./LeafletMap").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#dde8d4] animate-pulse" />,
});

export function MapBackground() {
  const { isLive } = useDashboardServiceDate();
  return <LeafletMap isLive={isLive} />;
}
