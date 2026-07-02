export type DriverStatus = "Active" | "Leave" | "Assigned" | "Substitute";
export type RouteId = "L1" | "L2" | "L3";
export type LeaveReason = "Sick Leave" | "Vacation" | "Emergency" | "Training";
export type DayType = "weekday" | "weekend";

export interface Driver {
  id: number;
  name: string;
  surname: string;
  code: string; // Mu0xx
  avatar?: string;
  route: string;
  routeId: RouteId;
  vehicle: string;
  capacity: number;
  status: DriverStatus;
  experience: number; // years
  performance?: {
    onTimeRate: number; // Percentage 0-100
    avgDelay: number; // Minutes
    rating: number; // 0-5
    totalTrips: number;
  };
}

export interface ReserveDriver {
  id: string;
  name: string;
  role: string;
  availability: number; // 0-100
  skillLevel: number; // 1-5
  experience: number;
  status: "Available" | "Assigned";
  color: string;
  note?: string; // e.g. covering note like ธนกฤต's blue-line cover
}

export interface Route {
  id: RouteId;
  name: string;
  label: string;
  labelTh: string;
  color: string;
  bgColor: string;
  passengerLoad: number; // 0-100
  vehicles: number;
}

export interface Vehicle {
  id: string;
  number: string;
  routeId: RouteId;
  driverId: number | null;
  capacity: number;
  status: "Active" | "Idle" | "Maintenance";
}

export interface TransferRecord {
  id: string;
  originalDriverId: number;
  reserveDriverId: string;
  reason: LeaveReason;
  date: string;
  notes: string;
  timestamp: Date;
}

export interface FleetStats {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  onLeave: number;
  reserveAvailable: number;
}

/** A single hour row of departure minutes, e.g. hour 6 => ["35","45","55"] */
export interface TimetableHourRow {
  hour: number;
  minutes: string[];
}

export interface RouteTimetable {
  routeId: RouteId;
  weekday: TimetableHourRow[];
  weekend: TimetableHourRow[];
}

export interface RouteRotationConfig {
  routeId: RouteId;
  startDate: string; // ISO string e.g. "2026-06-25"
  driverIds: number[]; // Ordered sequence
}
