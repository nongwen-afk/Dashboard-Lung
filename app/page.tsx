"use client";

import dynamic from "next/dynamic";

const DashboardView = dynamic(
  () => import("@/components/dashboard/DashboardView").then((mod) => mod.DashboardView),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <DashboardView />
    </main>
  );
}
