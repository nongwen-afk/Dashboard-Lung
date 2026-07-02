"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#dde8d4] animate-pulse" />,
});

export function MapBackground() {
  return <LeafletMap />;
}
