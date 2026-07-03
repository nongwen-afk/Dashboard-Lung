import { SimulationView } from "@/components/simulation/SimulationView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulation — Fleet Dashboard",
  description: "จำลองแผนตารางวิ่งรถโดยสาร ปรับได้ทุกพารามิเตอร์",
};

export default function SimulationPage() {
  return <SimulationView />;
}
