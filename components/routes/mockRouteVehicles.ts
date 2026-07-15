import type { RouteId } from "@/types";

export type VehiclePreviewStatus = "กำลังวิ่ง" | "กำลังจะออก" | "รอรอบ" | "พัก" | "จบรอบ";

export interface RouteVehiclePreview {
  code: string;
  status: VehiclePreviewStatus;
  passengerCount: number;
}

// TODO: Replace this UI-preview vehicle state with DB-backed per-vehicle operational data.
export const MOCK_ROUTE_VEHICLES: Record<RouteId, RouteVehiclePreview[]> = {
  L1: [
    { code: "R-101", status: "กำลังวิ่ง", passengerCount: 14 },
    { code: "R-102", status: "กำลังจะออก", passengerCount: 11 },
    { code: "R-103", status: "รอรอบ", passengerCount: 6 },
    { code: "R-104", status: "พัก", passengerCount: 2 },
    { code: "R-105", status: "จบรอบ", passengerCount: 0 },
  ],
  L2: [
    { code: "B-201", status: "กำลังวิ่ง", passengerCount: 16 },
    { code: "B-202", status: "กำลังจะออก", passengerCount: 12 },
    { code: "B-203", status: "รอรอบ", passengerCount: 7 },
    { code: "B-204", status: "พัก", passengerCount: 3 },
    { code: "B-205", status: "จบรอบ", passengerCount: 0 },
  ],
  L3: [
    { code: "G-301", status: "กำลังวิ่ง", passengerCount: 13 },
    { code: "G-302", status: "กำลังจะออก", passengerCount: 10 },
    { code: "G-303", status: "รอรอบ", passengerCount: 5 },
    { code: "G-304", status: "พัก", passengerCount: 1 },
    { code: "G-305", status: "จบรอบ", passengerCount: 0 },
  ],
};

export const VEHICLE_STATUS_ORDER: Record<VehiclePreviewStatus, number> = {
  กำลังวิ่ง: 1,
  กำลังจะออก: 2,
  รอรอบ: 3,
  พัก: 4,
  จบรอบ: 5,
};
