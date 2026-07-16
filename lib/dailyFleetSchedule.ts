import type { Driver, DriverStatus, ReserveDriver, RouteId, TransferRecord } from "@/types";

export type DailyRegularRole = "regular" | "off";

export interface DailyRegularAssignment {
  baseDriver: Driver;
  routeId: RouteId;
  slot: number;
  slotLabel: string;
  originalIndex: number;
  role: DailyRegularRole;
  note?: string;
}

export interface DailyFleetAssignment extends DailyRegularAssignment {
  driver: Driver;
  vehicle: string;
  capacity: number;
  status: DriverStatus;
  substituteReserveId?: string;
}

export interface DailyFleetSchedule {
  assignments: DailyFleetAssignment[];
  reserveDrivers: ReserveDriver[];
}

const ROUTE_IDS: RouteId[] = ["L1", "L2", "L3"];

const ROUTE_SLOT_PREFIX: Record<RouteId, string> = {
  L1: "RL",
  L2: "BL",
  L3: "GL",
};

const mod = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;

export const toServiceDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const fromServiceDate = (serviceDate: string) => {
  const [year, month, day] = serviceDate.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getLocalEpochDays = (date: Date) =>
  Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000);

const getDailyRole = (date: Date, originalIndex: number, totalDrivers: number) => {
  const epochDays = getLocalEpochDays(date);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  if (isWeekend) {
    const offBase = mod(epochDays * 5, totalDrivers);
    const isOff = [0, 1, 2, 3, 4].some(
      (offset) => mod(offBase + offset, totalDrivers) === originalIndex
    );
    return isOff
      ? { role: "off" as const, note: "หยุดวันเสาร์/อาทิตย์" }
      : { role: "regular" as const };
  }

  const offBase = mod(epochDays * 3, totalDrivers);
  return offBase === originalIndex
    ? { role: "off" as const, note: "หยุดพัก/ธุระ" }
    : { role: "regular" as const };
};

/**
 * Returns the approved daily run order while keeping a regular driver's vehicle attached to them.
 */
export function getDailyRegularAssignments(
  drivers: Driver[],
  date: Date
): DailyRegularAssignment[] {
  if (drivers.length === 0) return [];

  const originalIndexes = new Map(drivers.map((driver, index) => [driver.id, index]));

  return ROUTE_IDS.flatMap((routeId) => {
    const routeDrivers = drivers
      .filter((driver) => driver.routeId === routeId)
      .sort((a, b) => (a.vehicle || "").localeCompare(b.vehicle || ""));

    if (routeDrivers.length === 0) return [];

    const dayOffset = mod(getLocalEpochDays(date), routeDrivers.length);

    return routeDrivers.map((_, slot) => {
      const baseDriver = routeDrivers[(slot + dayOffset) % routeDrivers.length];
      const originalIndex = originalIndexes.get(baseDriver.id) ?? slot;
      const dailyRole = getDailyRole(date, originalIndex, drivers.length);

      return {
        baseDriver,
        routeId,
        slot,
        slotLabel: `${ROUTE_SLOT_PREFIX[routeId]}${slot + 1}`,
        originalIndex,
        ...dailyRole,
      };
    });
  });
}

/**
 * Builds the Fleet view for one operating date. A replacement borrows the regular pair's vehicle
 * only for that date; the underlying driver and vehicle records are never mutated.
 */
export function getDailyFleetSchedule({
  date,
  drivers,
  reserveDrivers,
  transferHistory,
}: {
  date: Date;
  drivers: Driver[];
  reserveDrivers: ReserveDriver[];
  transferHistory: TransferRecord[];
}): DailyFleetSchedule {
  const serviceDate = toServiceDate(date);
  const transfers = transferHistory.filter((transfer) => transfer.date === serviceDate);
  const transferByDriverId = new Map(
    transfers.map((transfer) => [transfer.originalDriverId, transfer])
  );
  const reserveById = new Map(reserveDrivers.map((reserve) => [reserve.id, reserve]));

  const assignments: DailyFleetAssignment[] = getDailyRegularAssignments(drivers, date).map(
    (assignment) => {
      const transfer = transferByDriverId.get(assignment.baseDriver.id);
      const reserve = transfer ? reserveById.get(transfer.reserveDriverId) : undefined;

      if (reserve) {
        return {
          ...assignment,
          vehicle: assignment.baseDriver.vehicle,
          capacity: assignment.baseDriver.capacity,
          driver: {
            ...assignment.baseDriver,
            name: reserve.name,
            surname: "",
            code: reserve.role,
            status: "Substitute" as const,
          },
          status: "Substitute" as const,
          role: "regular" as const,
          note: `แทน ${assignment.baseDriver.name} ${assignment.baseDriver.surname}`.trim(),
          substituteReserveId: reserve.id,
        };
      }

      // Weekly roster days off are planning information, not an automatic Fleet replacement.
      // A regular pair stays active here until a dispatcher confirms a manual replacement.
      const status: DriverStatus = "Active";
      return {
        ...assignment,
        vehicle: assignment.baseDriver.vehicle,
        capacity: assignment.baseDriver.capacity,
        driver: { ...assignment.baseDriver, status },
        status,
      };
    }
  );

  const assignmentByReserveId = new Map<string, DailyFleetAssignment>();
  assignments.forEach((assignment) => {
    if (assignment.substituteReserveId) {
      assignmentByReserveId.set(assignment.substituteReserveId, assignment);
    }
  });

  return {
    assignments,
    reserveDrivers: reserveDrivers.map((reserve) => {
      const assignment = assignmentByReserveId.get(reserve.id);
      return assignment
        ? {
            ...reserve,
            status: "Assigned" as const,
            note: `กำลังแทน ${assignment.vehicle}`,
          }
        : { ...reserve, status: "Available" as const, note: undefined };
    }),
  };
}
