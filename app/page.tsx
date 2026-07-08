import { fetchInitialFleetData } from "@/lib/server/fleet-data";
import { FleetDataProvider } from "@/components/FleetDataProvider";
import { MainApp } from "@/components/MainApp";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { mappedRoutes, mappedDrivers, mappedReserves } = await fetchInitialFleetData();

  return (
    <main className="min-h-screen bg-background">
      <FleetDataProvider
        initialRoutes={mappedRoutes}
        initialDrivers={mappedDrivers}
        initialReserves={mappedReserves}
      >
        <MainApp />
      </FleetDataProvider>
    </main>
  );
}
