import { fetchInitialFleetData } from "@/lib/server/fleet-data";
import { FleetDataProvider } from "@/components/FleetDataProvider";

export const dynamic = "force-dynamic";

export default async function FleetLayout({ children }: { children: React.ReactNode }) {
  const { mappedRoutes, mappedDrivers, mappedReserves } = await fetchInitialFleetData();

  return (
    <FleetDataProvider
      initialRoutes={mappedRoutes}
      initialDrivers={mappedDrivers}
      initialReserves={mappedReserves}
    >
      {children}
    </FleetDataProvider>
  );
}
