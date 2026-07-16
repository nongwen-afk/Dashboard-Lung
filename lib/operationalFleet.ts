import { getAllDepartures } from "@/lib/mock-data/timetables";
import { toServiceDate, type DailyFleetAssignment } from "@/lib/dailyFleetSchedule";
import type {
  FleetDispatchEvent,
  RouteId,
  VehicleTransferEvent,
  VehicleUnavailableEvent,
} from "@/types";

const ROUTE_IDS: RouteId[] = ["L1", "L2", "L3"];
const TRANSFER_BUFFER_MINUTES = 5;

const ROUTE_SLOT_PREFIX: Record<RouteId, string> = {
  L1: "RL",
  L2: "BL",
  L3: "GL",
};

// Kept separate from Simulation. These are the operating assumptions used to decide a safe gap.
const ROUTE_TRIP_MINUTES: Record<RouteId, number> = {
  L1: 20,
  L2: 25,
  L3: 20,
};

export type OperationalAssignmentState =
  "normal" | "unavailable" | "queue-shifted" | "borrowed" | "scheduled-borrow";

export interface OperationalFleetAssignment extends DailyFleetAssignment {
  homeRouteId: RouteId;
  operatingRouteId: RouteId;
  operatingSlotLabel: string;
  operationalState: OperationalAssignmentState;
  operationalNote?: string;
}

export interface OperationalTrip {
  id: string;
  routeId: RouteId;
  tripIndex: number;
  time: string;
  vehicle: string;
  assignment: OperationalFleetAssignment;
  kind: "scheduled" | "replacement" | "supplemental";
  note?: string;
}

export interface OperationalRouteStats {
  activeVehicles: number;
  borrowedVehicles: number;
  lentVehicles: number;
  queueAdjustments: number;
}

export interface VehicleDispatchCandidate {
  assignment: OperationalFleetAssignment;
  vehicle: string;
  availableFrom: string;
  availableUntil: string;
  freeMinutes: number;
  eligible: boolean;
  reason: string;
  previousTrip: OperationalTrip | null;
  nextHomeTrip: OperationalTrip | null;
}

interface VehicleMovement {
  vehicle: string;
  routeId: RouteId;
  sourceRouteId: RouteId;
  tripIndex: number;
  kind: "replacement" | "supplemental";
}

export interface OperationalFleetSnapshot {
  assignments: OperationalFleetAssignment[];
  tripsByRoute: Record<RouteId, OperationalTrip[]>;
  routeStats: Record<RouteId, OperationalRouteStats>;
  events: FleetDispatchEvent[];
}

export interface OperationalVehicleTimeline {
  trips: OperationalTrip[];
  activeTrip: OperationalTrip | null;
  nextTrip: OperationalTrip | null;
}

const getMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const dateToMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes();

const toTimestampDate = (value: string) => new Date(value);

export const formatOperationalTime = (minutes: number) => {
  const clampedMinutes = Math.max(0, Math.min(minutes, 23 * 60 + 59));
  return `${String(Math.floor(clampedMinutes / 60)).padStart(2, "0")}:${String(
    clampedMinutes % 60
  ).padStart(2, "0")}`;
};

export const getRouteTripMinutes = (routeId: RouteId) => ROUTE_TRIP_MINUTES[routeId];

const getTripEndMinutes = (trip: OperationalTrip) =>
  getMinutes(trip.time) + getRouteTripMinutes(trip.routeId);

const getEventMovementPhase = ({
  routeId,
  tripIndex,
  date,
  now,
  isLive,
}: {
  routeId: RouteId;
  tripIndex: number;
  date: Date;
  now: Date;
  isLive: boolean;
}) => {
  if (!isLive) return "scheduled" as const;
  const departure = getAllDepartures(routeId, date)[tripIndex];
  if (!departure) return "scheduled" as const;

  const nowMinutes = dateToMinutes(now);
  const departureMinutes = getMinutes(departure.time);
  const tripEnd = departureMinutes + getRouteTripMinutes(routeId);

  if (nowMinutes < departureMinutes) return "scheduled" as const;
  if (nowMinutes >= tripEnd) return "complete" as const;
  return "active" as const;
};

const createEmptyStats = (): OperationalRouteStats => ({
  activeVehicles: 0,
  borrowedVehicles: 0,
  lentVehicles: 0,
  queueAdjustments: 0,
});

const getActiveUnavailableEvent = (
  events: VehicleUnavailableEvent[],
  vehicle: string,
  now: Date,
  isLive: boolean
) => {
  const event = events.find((candidate) => candidate.vehicle === vehicle && !candidate.readyAt);
  if (event) return event;
  if (!isLive) return undefined;

  return events.find(
    (candidate) =>
      candidate.vehicle === vehicle && candidate.readyAt && now < toTimestampDate(candidate.readyAt)
  );
};

/**
 * Applies dispatch decisions on top of the approved daily roster without mutating the roster.
 * A vehicle marked unavailable stays out of its route queue until a dispatcher returns it.
 */
export function getOperationalFleetSnapshot({
  date,
  now,
  isLive,
  assignments,
  dispatchEvents,
}: {
  date: Date;
  now: Date;
  isLive: boolean;
  assignments: DailyFleetAssignment[];
  dispatchEvents: FleetDispatchEvent[];
}): OperationalFleetSnapshot {
  const serviceDate = toServiceDate(date);
  const events = dispatchEvents.filter((event) => event.date === serviceDate);
  const unavailableEvents = events.filter(
    (event): event is VehicleUnavailableEvent => event.type === "unavailable"
  );
  const transferEvents = events.filter(
    (event): event is VehicleTransferEvent => event.type === "transfer"
  );

  const movementByVehicle = new Map<
    string,
    {
      routeId: RouteId;
      sourceRouteId: RouteId;
      tripIndex: number;
      kind: "replacement" | "supplemental";
      phase: "scheduled" | "active" | "complete";
    }
  >();

  const movements: VehicleMovement[] = [
    ...transferEvents.map((event) => ({
      vehicle: event.vehicle,
      routeId: event.targetRouteId,
      sourceRouteId: event.sourceRouteId,
      tripIndex: event.targetTripIndex,
      kind: "supplemental" as const,
    })),
    ...unavailableEvents.flatMap((event) =>
      event.resolution === "cross-route-replacement" &&
      event.replacementVehicle &&
      event.replacementSourceRouteId
        ? [
            {
              vehicle: event.replacementVehicle,
              routeId: event.routeId,
              sourceRouteId: event.replacementSourceRouteId,
              tripIndex: event.tripIndex,
              kind: "replacement" as const,
            },
          ]
        : []
    ),
  ];

  movements.forEach((movement) => {
    const phase = getEventMovementPhase({
      routeId: movement.routeId,
      tripIndex: movement.tripIndex,
      date,
      now,
      isLive,
    });
    const previous = movementByVehicle.get(movement.vehicle);
    if (!previous || (previous.phase !== "active" && phase === "active")) {
      movementByVehicle.set(movement.vehicle, { ...movement, phase });
    }
  });

  const operationalAssignments = assignments.map<OperationalFleetAssignment>((assignment) => {
    const unavailable = getActiveUnavailableEvent(
      unavailableEvents,
      assignment.vehicle,
      now,
      isLive
    );
    const movement = movementByVehicle.get(assignment.vehicle);
    const isActiveMovement = movement?.phase === "active";
    const isScheduledMovement = movement?.phase === "scheduled";
    const targetLabel = movement ? ROUTE_SLOT_PREFIX[movement.routeId] : null;

    return {
      ...assignment,
      homeRouteId: assignment.routeId,
      operatingRouteId: isActiveMovement ? movement.routeId : assignment.routeId,
      operatingSlotLabel: isActiveMovement ? `${targetLabel}+` : assignment.slotLabel,
      operationalState: unavailable
        ? "unavailable"
        : isActiveMovement
          ? "borrowed"
          : isScheduledMovement
            ? "scheduled-borrow"
            : "normal",
      operationalNote: unavailable
        ? unavailable.resolution === "cross-route-replacement"
          ? `ไม่พร้อม · ${unavailable.replacementVehicle} รับรอบแทน`
          : "ไม่พร้อม · พักจากคิว"
        : isActiveMovement
          ? `${movement?.kind === "replacement" ? "รับรอบแทน" : "เสริม"}${targetLabel} 1 รอบ · จาก ${assignment.slotLabel}`
          : isScheduledMovement
            ? `เตรียม${movement?.kind === "replacement" ? "รับรอบแทน" : "เสริม"}${targetLabel} 1 รอบ`
            : undefined,
    };
  });
  const operationalByVehicle = new Map(
    operationalAssignments.map((assignment) => [assignment.vehicle, assignment])
  );

  const unavailableByRouteTrip = new Map<string, VehicleUnavailableEvent>();
  unavailableEvents.forEach((event) => {
    unavailableByRouteTrip.set(`${event.routeId}-${event.tripIndex}`, event);
  });

  const tripsByRoute = ROUTE_IDS.reduce<Record<RouteId, OperationalTrip[]>>(
    (result, routeId) => {
      const queue = assignments
        .filter((assignment) => assignment.routeId === routeId)
        .sort((left, right) => left.slot - right.slot)
        .map((assignment) => assignment.vehicle);
      const unavailableInQueue = new Map<string, VehicleUnavailableEvent>();

      const scheduledTrips = getAllDepartures(routeId, date).flatMap((departure) => {
        const departureMinutes = getMinutes(departure.time);

        unavailableInQueue.forEach((event, vehicle) => {
          if (event.readyAt && dateToMinutes(toTimestampDate(event.readyAt)) <= departureMinutes) {
            queue.push(vehicle);
            unavailableInQueue.delete(vehicle);
          }
        });

        const unavailable = unavailableByRouteTrip.get(`${routeId}-${departure.tripIndex}`);
        if (unavailable) {
          const queueIndex = queue.indexOf(unavailable.vehicle);
          if (queueIndex >= 0) queue.splice(queueIndex, 1);
          unavailableInQueue.set(unavailable.vehicle, unavailable);
        }

        const replacementVehicle =
          unavailable?.resolution === "cross-route-replacement"
            ? unavailable.replacementVehicle
            : undefined;
        const vehicle = replacementVehicle ?? queue.shift();
        if (!vehicle) return [];
        if (!replacementVehicle) queue.push(vehicle);

        const assignment = operationalByVehicle.get(vehicle);
        if (!assignment) return [];

        return [
          {
            id: `${routeId}-${departure.tripIndex}`,
            routeId,
            tripIndex: departure.tripIndex,
            time: departure.time,
            vehicle,
            assignment,
            kind: replacementVehicle ? ("replacement" as const) : ("scheduled" as const),
            note: unavailable
              ? replacementVehicle
                ? `รถแทนจาก ${ROUTE_SLOT_PREFIX[unavailable.replacementSourceRouteId ?? routeId]}`
                : "รถคันถัดไปรับรอบแทน"
              : undefined,
          },
        ];
      });

      const supplementalTrips = transferEvents.flatMap((event) => {
        if (event.targetRouteId !== routeId) return [];
        const sourceAssignment = operationalByVehicle.get(event.vehicle);
        const departure = getAllDepartures(routeId, date)[event.targetTripIndex];
        if (!sourceAssignment || !departure) return [];

        return [
          {
            id: `${event.id}-supplemental`,
            routeId,
            tripIndex: event.targetTripIndex + 0.1,
            time: departure.time,
            vehicle: event.vehicle,
            assignment: sourceAssignment,
            kind: "supplemental" as const,
            note: `รถเสริมจาก ${ROUTE_SLOT_PREFIX[event.sourceRouteId]}`,
          },
        ];
      });

      result[routeId] = [...scheduledTrips, ...supplementalTrips].toSorted((left, right) => {
        const timeDifference = getMinutes(left.time) - getMinutes(right.time);
        return timeDifference || left.tripIndex - right.tripIndex;
      });
      return result;
    },
    { L1: [], L2: [], L3: [] }
  );

  const routeStats = ROUTE_IDS.reduce<Record<RouteId, OperationalRouteStats>>(
    (result, routeId) => {
      const stats = createEmptyStats();
      operationalAssignments.forEach((assignment) => {
        if (assignment.operationalState === "unavailable") return;
        if (assignment.operatingRouteId === routeId) stats.activeVehicles += 1;
        if (assignment.operatingRouteId === routeId && assignment.homeRouteId !== routeId) {
          stats.borrowedVehicles += 1;
        }
        if (assignment.homeRouteId === routeId && assignment.operatingRouteId !== routeId) {
          stats.lentVehicles += 1;
        }
      });
      stats.queueAdjustments = unavailableEvents.filter(
        (event) => event.routeId === routeId && event.resolution === "queue-shift"
      ).length;
      result[routeId] = stats;
      return result;
    },
    { L1: createEmptyStats(), L2: createEmptyStats(), L3: createEmptyStats() }
  );

  return {
    assignments: operationalAssignments,
    tripsByRoute,
    routeStats,
    events,
  };
}

/**
 * Returns every out-of-line vehicle with a reason. Eligibility is derived from that vehicle's
 * own previous and next runs, so a short headway on the source route does not hide a safe gap.
 */
export function getCrossRouteCandidates({
  targetTrip,
  assignments,
  tripsByRoute,
  now,
  isLive,
}: {
  targetTrip: OperationalTrip | null;
  assignments: OperationalFleetAssignment[];
  tripsByRoute: Record<RouteId, OperationalTrip[]>;
  now: Date;
  isLive: boolean;
}): VehicleDispatchCandidate[] {
  if (!targetTrip) return [];

  const targetDeparture = getMinutes(targetTrip.time);
  const targetEnd =
    targetDeparture + getRouteTripMinutes(targetTrip.routeId) + TRANSFER_BUFFER_MINUTES;
  const nowMinutes = dateToMinutes(now);
  const allTrips = ROUTE_IDS.flatMap((routeId) => tripsByRoute[routeId]);

  return assignments
    .filter((assignment) => assignment.homeRouteId !== targetTrip.routeId)
    .map((assignment) => {
      const vehicleTrips = allTrips
        .filter((trip) => trip.vehicle === assignment.vehicle && trip.id !== targetTrip.id)
        .toSorted((left, right) => getMinutes(left.time) - getMinutes(right.time));
      const previousTrip =
        vehicleTrips.filter((trip) => getMinutes(trip.time) <= targetDeparture).at(-1) ?? null;
      const nextHomeTrip =
        vehicleTrips.find(
          (trip) =>
            trip.routeId === assignment.homeRouteId && getMinutes(trip.time) > targetDeparture
        ) ?? null;
      const availableFromMinutes = Math.max(
        previousTrip ? getTripEndMinutes(previousTrip) + TRANSFER_BUFFER_MINUTES : 0,
        isLive ? nowMinutes : 0
      );
      const availableUntilMinutes = nextHomeTrip
        ? getMinutes(nextHomeTrip.time) - TRANSFER_BUFFER_MINUTES
        : 23 * 60 + 59;
      const freeMinutes = Math.max(0, availableUntilMinutes - availableFromMinutes);

      let reason = `ว่าง ${formatOperationalTime(availableFromMinutes)}-${formatOperationalTime(availableUntilMinutes)}`;
      let eligible = targetDeparture >= availableFromMinutes && targetEnd <= availableUntilMinutes;

      if (assignment.operationalState === "unavailable") {
        eligible = false;
        reason = "รถคันนี้ยังไม่พร้อมใช้งาน";
      } else if (assignment.operationalState === "borrowed") {
        eligible = false;
        reason = "กำลังช่วยอีกรอบอยู่";
      } else if (targetDeparture < availableFromMinutes) {
        eligible = false;
        reason = `จบรอบก่อนหน้า ${formatOperationalTime(availableFromMinutes)} ไม่ทัน`;
      } else if (targetEnd > availableUntilMinutes) {
        eligible = false;
        reason = nextHomeTrip
          ? `ต้องกลับ${ROUTE_SLOT_PREFIX[assignment.homeRouteId]}ก่อน ${nextHomeTrip.time}`
          : "เวลาคืนรถไม่พอ";
      }

      return {
        assignment,
        vehicle: assignment.vehicle,
        availableFrom: formatOperationalTime(availableFromMinutes),
        availableUntil: formatOperationalTime(availableUntilMinutes),
        freeMinutes,
        eligible,
        reason,
        previousTrip,
        nextHomeTrip,
      };
    })
    .toSorted(
      (left, right) =>
        Number(right.eligible) - Number(left.eligible) ||
        right.freeMinutes - left.freeMinutes ||
        left.vehicle.localeCompare(right.vehicle)
    );
}

export function getNextOperationalTrip(
  trips: OperationalTrip[],
  now: Date,
  isLive: boolean
): OperationalTrip | null {
  if (!trips.length) return null;
  if (!isLive) return trips[0] ?? null;

  const nowMinutes = dateToMinutes(now);
  return trips.find((trip) => getMinutes(trip.time) > nowMinutes) ?? null;
}

/**
 * Resolves a vehicle's complete day timeline from the operational snapshot. This keeps route
 * detail rows aligned with queue shifts, replacement runs, and supplemental moves.
 */
export function getVehicleOperationalTimeline({
  vehicle,
  tripsByRoute,
  now,
  isLive,
}: {
  vehicle: string;
  tripsByRoute: Record<RouteId, OperationalTrip[]>;
  now: Date;
  isLive: boolean;
}): OperationalVehicleTimeline {
  const trips = ROUTE_IDS.flatMap((routeId) => tripsByRoute[routeId])
    .filter((trip) => trip.vehicle === vehicle)
    .toSorted(
      (left, right) =>
        getMinutes(left.time) - getMinutes(right.time) || left.tripIndex - right.tripIndex
    );

  if (!isLive) {
    return { trips, activeTrip: null, nextTrip: trips[0] ?? null };
  }

  const nowMinutes = dateToMinutes(now);
  const activeTrip =
    trips.find((trip) => {
      const departure = getMinutes(trip.time);
      return departure <= nowMinutes && nowMinutes < getTripEndMinutes(trip);
    }) ?? null;
  const nextTrip = trips.find((trip) => getMinutes(trip.time) > nowMinutes) ?? null;

  return { trips, activeTrip, nextTrip };
}
