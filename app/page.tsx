"use client";

import dynamic from "next/dynamic";

const MainApp = dynamic(() => import("@/components/MainApp").then((mod) => mod.MainApp), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <MainApp />
    </main>
  );
}
