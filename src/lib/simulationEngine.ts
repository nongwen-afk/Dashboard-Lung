// ====================================================================
// Simulation Engine — Round-Robin + Fairness Balancing
// Data sourced from driver_scheduler_evt.xlsx
// ====================================================================

export type RouteKey = "green" | "blue" | "red";
export type DayTypeKey = "weekday" | "weekend";

// ── Route departure times (from Excel) ──────────────────────────────
// Times in minutes from midnight

function hm(h: number, m: number) {
  return h * 60 + m;
}

export const ROUTE_DEPARTURES: Record<RouteKey, Record<DayTypeKey, number[]>> = {
  green: {
    weekday: [
      hm(6,35), hm(6,45), hm(6,55), hm(7,5), hm(7,15), hm(7,25), hm(7,35), hm(7,45),
      hm(7,55), hm(8,5), hm(8,15), hm(8,25), hm(8,35), hm(8,45), hm(8,55),
      hm(9,20), hm(9,40),
      hm(10,10), hm(10,30), hm(10,50),
      hm(11,5), hm(11,15), hm(11,25), hm(11,35), hm(11,45), hm(11,55),
      hm(12,5), hm(12,15), hm(12,25), hm(12,35), hm(12,45), hm(12,55),
      hm(13,5), hm(13,15), hm(13,25), hm(13,35), hm(13,45), hm(13,55),
      hm(14,10), hm(14,30), hm(14,50),
      hm(15,10), hm(15,30), hm(15,50),
      hm(16,5), hm(16,10), hm(16,15), hm(16,25), hm(16,30), hm(16,35), hm(16,45), hm(16,50), hm(16,55),
      hm(17,5), hm(17,15), hm(17,25), hm(17,35), hm(17,40), hm(17,45), hm(17,55),
      hm(18,5), hm(18,15), hm(18,25), hm(18,35), hm(18,45),
      hm(19,10), hm(19,30), hm(19,50), hm(20,10),
    ],
    weekend: [
      hm(8,20), hm(8,40), hm(9,0), hm(9,20), hm(9,40), hm(10,0),
      hm(10,20), hm(10,40), hm(11,0), hm(11,20), hm(11,40),
      hm(12,10), hm(12,30), hm(12,50),
      hm(13,10), hm(13,30), hm(13,50),
      hm(14,20), hm(14,40),
      hm(15,20), hm(15,50),
      hm(16,10), hm(16,30), hm(16,50),
      hm(17,10), hm(17,30), hm(17,50),
      hm(18,20), hm(18,50), hm(19,20), hm(19,50),
    ],
  },
  blue: {
    weekday: [
      hm(6,30), hm(6,40), hm(6,50), hm(7,0), hm(7,10), hm(7,20), hm(7,30),
      hm(7,35), hm(7,40), hm(7,45), hm(7,50), hm(7,55),
      hm(8,0), hm(8,5), hm(8,10), hm(8,15), hm(8,20), hm(8,25), hm(8,30), hm(8,35), hm(8,40), hm(8,45), hm(8,50), hm(8,55),
      hm(9,0), hm(9,10), hm(9,20), hm(9,30), hm(9,40),
      hm(10,0), hm(10,20), hm(10,40),
      hm(11,0), hm(11,10), hm(11,20), hm(11,30), hm(11,40), hm(11,50),
      hm(12,0), hm(12,10), hm(12,20), hm(12,30), hm(12,40), hm(12,50),
      hm(13,0), hm(13,10), hm(13,20), hm(13,30), hm(13,40),
      hm(14,0), hm(14,20), hm(14,40),
      hm(15,0), hm(15,20), hm(15,40),
      hm(16,0), hm(16,10), hm(16,20), hm(16,30), hm(16,40), hm(16,50),
      hm(17,0), hm(17,10), hm(17,20), hm(17,30), hm(17,40), hm(17,50),
      hm(18,0), hm(18,10), hm(18,20), hm(18,30), hm(18,40),
      hm(19,0), hm(19,20), hm(19,40), hm(20,0),
    ],
    weekend: [
      hm(8,0), hm(8,30), hm(9,0), hm(9,30), hm(10,0),
      hm(10,30), hm(11,0), hm(11,30),
      hm(12,0), hm(12,30),
      hm(13,0), hm(13,30),
      hm(14,0), hm(14,30),
      hm(15,0), hm(15,30),
      hm(16,0), hm(16,30), hm(17,0), hm(17,30),
      hm(18,0), hm(18,30), hm(19,0), hm(19,30),
    ],
  },
  red: {
    weekday: [
      hm(6,30), hm(6,40), hm(6,50), hm(7,0), hm(7,10), hm(7,20), hm(7,30), hm(7,40), hm(7,50),
      hm(8,0), hm(8,10), hm(8,20), hm(8,30), hm(8,40), hm(8,50),
      hm(9,0), hm(9,20), hm(9,40),
      hm(10,0), hm(10,20), hm(10,40),
      hm(11,0), hm(11,10), hm(11,20), hm(11,30), hm(11,40), hm(11,50),
      hm(12,0), hm(12,10), hm(12,20), hm(12,30), hm(12,40), hm(12,50),
      hm(13,0), hm(13,10), hm(13,20), hm(13,30), hm(13,40), hm(13,50), hm(14,0),
      hm(14,20), hm(14,40),
      hm(15,0), hm(15,20), hm(15,40),
      hm(16,0), hm(16,10), hm(16,20), hm(16,30), hm(16,40), hm(16,50), hm(17,0),
      hm(17,10), hm(17,20), hm(17,30), hm(17,40), hm(17,50), hm(18,0),
      hm(18,10), hm(18,20), hm(18,30), hm(18,40),
      hm(19,0), hm(19,20), hm(19,40), hm(20,0),
    ],
    weekend: [
      hm(8,0), hm(8,30), hm(9,0), hm(9,30),
      hm(10,0), hm(10,30), hm(11,0), hm(11,30),
      hm(12,0), hm(12,30), hm(13,0), hm(13,30),
      hm(14,0), hm(14,30), hm(15,0), hm(15,30),
      hm(16,0), hm(16,30), hm(17,0), hm(17,30),
      hm(18,0), hm(18,30), hm(19,0), hm(19,30),
    ],
  },
};

// ── Driver pool ───────────────────────────────────────────────────────
export const ALL_DRIVERS = [
  "ชาติ", "จำรัส", "ธนกฤต", "สุรธรรม", "บัวทอง",
  "เปรม", "สัมพันธ์", "เฉลิมพล", "อำพล", "คมสันต์",
  "วีระ", "ณัฐวุฒิ", "อัธยา", "ธนบูรณ์", "พรหมพิพัฒน์", "พฤหัสบดี",
];

export const ROUTE_META: Record<RouteKey, { label: string; color: string; bgColor: string; defaultDrivers: number; defaultOT: number }> = {
  green: { label: "สายสีเขียว", color: "#16a34a", bgColor: "#dcfce7", defaultDrivers: 5, defaultOT: 1 },
  blue:  { label: "สายสีน้ำเงิน", color: "#1d4ed8", bgColor: "#dbeafe", defaultDrivers: 5, defaultOT: 4 },
  red:   { label: "สายสีแดง", color: "#dc2626", bgColor: "#fee2e2", defaultDrivers: 4, defaultOT: 4 },
};

// ── Types ─────────────────────────────────────────────────────────────

export interface BreakEvent {
  startMin: number;
  endMin: number;
  driverIndex: number;
}

export interface TripAssignment {
  tripIndex: number;
  departureMin: number; // minutes from midnight
  driverIndex: number;  // index into drivers array
  isOT: boolean;
  isRushHour: boolean;
}

export interface DriverShift {
  driverIndex: number;
  name: string;
  trips: TripAssignment[];
  breaks: BreakEvent[];
  startMin: number;
  endMin: number;
  workMinutes: number;    // actual work time
  breakMinutes: number;
  otCount: number;
  otPay: number;
}

export interface SimConfig {
  route: RouteKey;
  dayType: DayTypeKey;
  numDrivers: number;           // regular drivers (used if no customDriverNames)
  numOTDrivers: number;         // OT/extra drivers
  customDriverNames?: string[]; // overrides numDrivers/numOTDrivers when set
  assistDriverNames?: string[]; // extra drivers that only help during rush hour
  otThresholdHours: number; // hours before OT kicks in
  restAfterHours: number;   // hours before mandatory break
  crossLineAssist: boolean; // green line helps blue in rush hour
  tripDurationMin: number;  // minutes per trip cycle (default 20)
  otPayPerSession: number;  // baht per OT session (default 400)
}

export interface SimResult {
  config: SimConfig;
  departures: number[];
  drivers: DriverShift[];
  totalTrips: number;
  totalDrivers: number;
  avgWorkHours: number;
  avgTripsPerDriver: number;
  totalOTCount: number;
  totalOTPay: number;
  fairnessSD: number;       // standard deviation of trips (lower = fairer)
  coverageRate: number;     // % of trips covered
  rushHourCoverage: number; // % of rush hour trips covered
}

// ── Helpers ───────────────────────────────────────────────────────────

export function minToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function isRushHour(minFromMidnight: number): boolean {
  // Morning: 06:30–09:00, Evening: 16:00–19:00
  return (minFromMidnight >= hm(6, 30) && minFromMidnight <= hm(9, 0)) ||
         (minFromMidnight >= hm(16, 0) && minFromMidnight <= hm(19, 0));
}

function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

// ── Main Simulation Engine ────────────────────────────────────────────

export function runSimulation(config: SimConfig): SimResult {
  const {
    route,
    dayType,
    numDrivers,
    numOTDrivers,
    otThresholdHours,
    restAfterHours,
    tripDurationMin,
    otPayPerSession,
  } = config;

  const departures = ROUTE_DEPARTURES[route][dayType];
  const totalDriverCount = Math.max(1, numDrivers + numOTDrivers);
  const regularDriverNames = (config.customDriverNames && config.customDriverNames.length > 0)
    ? config.customDriverNames
    : ALL_DRIVERS.slice(0, Math.min(totalDriverCount, ALL_DRIVERS.length));
  
  const assistDriverNames = config.assistDriverNames || [];
  const driverNames = [...regularDriverNames, ...assistDriverNames];

  // numDrivers for scoring (regular vs OT distinction in round-robin)
  const regularCount = regularDriverNames.length;

  // initialise driver state
  const driverTrips: TripAssignment[][] = Array.from({ length: driverNames.length }, () => []);
  const driverBreaks: BreakEvent[][] = Array.from({ length: driverNames.length }, () => []);
  const driverAvailableAt: number[] = new Array(driverNames.length).fill(0);
  const driverLastBreakAt: number[] = new Array(driverNames.length).fill(0);
  const driverWorkStart: number[] = new Array(driverNames.length).fill(-1);

  const otThresholdMin = otThresholdHours * 60;
  const restThresholdMin = restAfterHours * 60;
  const BREAK_DURATION = 30;

  let coveredTrips = 0;
  let rushCovered = 0;
  let rushTotal = 0;

  // ── Round-Robin + Fairness Balancing ────────────────────────────────
  for (let i = 0; i < departures.length; i++) {
    const dep = departures[i];
    const rush = isRushHour(dep);
    if (rush) rushTotal++;

    // Find best driver: available + fewest trips so far (fairness)
    let bestDriver = -1;
    let bestScore = Infinity;

    for (let d = 0; d < driverNames.length; d++) {
      const isAssist = d >= regularCount;
      if (isAssist) {
        // Assist drivers ONLY help between 07:50 and 08:50
        const isAssistWindow = dep >= hm(7, 50) && dep <= hm(8, 50);
        if (!isAssistWindow) continue;
      }

      const available = driverAvailableAt[d] <= dep;
      if (!available) continue;

      const trips = driverTrips[d].length;
      const started = driverWorkStart[d] !== -1;
      const workSoFar = started ? dep - driverWorkStart[d] : 0;

      // Check if this driver needs a break (worked restThresholdMin continuously)
      const timeSinceBreak = dep - driverLastBreakAt[d];
      if (started && timeSinceBreak >= restThresholdMin && workSoFar > restThresholdMin) {
        // Force break — record it and skip until after break
        const breakStart = dep;
        const breakEnd = dep + BREAK_DURATION;
        driverBreaks[d].push({ startMin: breakStart, endMin: breakEnd, driverIndex: d });
        driverAvailableAt[d] = breakEnd;
        driverLastBreakAt[d] = breakEnd;
        continue;
      }

      // Prefer driver with fewer trips (fairness), penalise OT
      const isOTDriver = d >= regularCount;
      const otPenalty = isOTDriver ? 0.5 : 0;
      const score = trips - otPenalty;
      if (score < bestScore) {
        bestScore = score;
        bestDriver = d;
      }
    }

    if (bestDriver === -1) {
      // No driver available — try to find soonest available
      let minAvail = Infinity;
      for (let d = 0; d < driverNames.length; d++) {
        if (driverAvailableAt[d] < minAvail) {
          minAvail = driverAvailableAt[d];
          bestDriver = d;
        }
      }
    }

    if (bestDriver !== -1) {
      if (driverWorkStart[bestDriver] === -1) {
        driverWorkStart[bestDriver] = dep;
        driverLastBreakAt[bestDriver] = dep;
      }

      const workSoFar = dep - driverWorkStart[bestDriver];
      const isOT = workSoFar >= otThresholdMin;
      const trip: TripAssignment = {
        tripIndex: i,
        departureMin: dep,
        driverIndex: bestDriver,
        isOT,
        isRushHour: rush,
      };

      driverTrips[bestDriver].push(trip);
      driverAvailableAt[bestDriver] = dep + tripDurationMin;
      coveredTrips++;
      if (rush) rushCovered++;
    }
  }

  // ── Build DriverShift objects ────────────────────────────────────────
  const drivers: DriverShift[] = driverNames.map((name, d) => {
    const trips = driverTrips[d];
    const breaks = driverBreaks[d];
    if (trips.length === 0) {
      return {
        driverIndex: d,
        name,
        trips: [],
        breaks: [],
        startMin: 0,
        endMin: 0,
        workMinutes: 0,
        breakMinutes: 0,
        otCount: 0,
        otPay: 0,
      };
    }

    const startMin = trips[0].departureMin;
    const endMin = trips[trips.length - 1].departureMin + tripDurationMin;
    const workMinutes = endMin - startMin;
    const breakMinutes = breaks.reduce((s, b) => s + (b.endMin - b.startMin), 0);
    const otCount = trips.filter(t => t.isOT).length;
    const otPay = otCount > 0 ? Math.ceil(otCount / 5) * otPayPerSession : 0;

    return { driverIndex: d, name, trips, breaks, startMin, endMin, workMinutes, breakMinutes, otCount, otPay };
  }).filter(d => d.trips.length > 0);

  // ── Summary stats ────────────────────────────────────────────────────
  const totalOTCount = drivers.reduce((s, d) => s + d.otCount, 0);
  const totalOTPay   = drivers.reduce((s, d) => s + d.otPay, 0);
  const avgWorkHours = drivers.length > 0
    ? drivers.reduce((s, d) => s + d.workMinutes, 0) / drivers.length / 60
    : 0;
  const avgTripsPerDriver = drivers.length > 0
    ? drivers.reduce((s, d) => s + d.trips.length, 0) / drivers.length
    : 0;
  const fairnessSD = stdDev(drivers.map(d => d.trips.length));

  return {
    config,
    departures,
    drivers,
    totalTrips: departures.length,
    totalDrivers: drivers.length,
    avgWorkHours,
    avgTripsPerDriver,
    totalOTCount,
    totalOTPay,
    fairnessSD,
    coverageRate: departures.length > 0 ? (coveredTrips / departures.length) * 100 : 0,
    rushHourCoverage: rushTotal > 0 ? (rushCovered / rushTotal) * 100 : 100,
  };
}

// ── Default config ────────────────────────────────────────────────────

export function defaultConfig(route: RouteKey = "green"): SimConfig {
  const meta = ROUTE_META[route];
  return {
    route,
    dayType: "weekday",
    numDrivers: meta.defaultDrivers,
    numOTDrivers: meta.defaultOT,
    otThresholdHours: 8,
    restAfterHours: 4,
    crossLineAssist: route === "green",
    tripDurationMin: 20,
    otPayPerSession: 400,
  };
}

// ── Multi-Route Support ───────────────────────────────────────────────

/** Maps each driver name to their assigned route (or "pool" for unassigned) */
export type AssignmentMap = Record<string, RouteKey | "pool">;

/** Shared work-rules config that applies to all routes simultaneously */
export interface SharedSimConfig {
  dayType: DayTypeKey;
  otThresholdHours: number;
  restAfterHours: number;
  crossLineAssist: boolean;
  tripDurations: Record<RouteKey, number>;
  otPayPerSession: number;
}

/** Result of running all 3 routes in one pass */
export interface MultiRouteSimResult {
  green: SimResult;
  blue: SimResult;
  red: SimResult;
}

/** Default driver-to-route assignment from driver_scheduler_evt.xlsx */
export const DEFAULT_DRIVER_ASSIGNMENTS: AssignmentMap = {
  // สายสีเขียว (5 คน)
  "ชาติ":         "green",
  "จำรัส":        "green",
  "ธนกฤต":        "green",
  "สุรธรรม":      "green",
  "บัวทอง":       "green",
  // สายสีน้ำเงิน (5 คน)
  "เปรม":         "blue",
  "สัมพันธ์":     "blue",
  "เฉลิมพล":      "blue",
  "อำพล":         "blue",
  "คมสันต์":      "blue",
  // สายสีแดง (4 คน)
  "วีระ":         "red",
  "ณัฐวุฒิ":      "red",
  "อัธยา":        "red",
  "ธนบูรณ์":      "red",
  // คลังสำรอง (Pool)
  "พรหมพิพัฒน์":  "pool",
  "พฤหัสบดี":     "pool",
};

export function defaultSharedConfig(): SharedSimConfig {
  return {
    dayType: "weekday",
    otThresholdHours: 8,
    restAfterHours: 4,
    crossLineAssist: false,
    tripDurations: { green: 20, blue: 25, red: 20 },
    otPayPerSession: 400,
  };
}

/** Run all 3 routes simultaneously with the given driver assignments */
export function runAllRoutes(
  assignments: AssignmentMap,
  shared: SharedSimConfig
): MultiRouteSimResult {
  const makeResult = (route: RouteKey): SimResult => {
    const customDriverNames = ALL_DRIVERS.filter(n => assignments[n] === route);
    if (customDriverNames.length === 0) {
      // No drivers assigned — return empty result
      return {
        config: { route, numDrivers: 0, numOTDrivers: 0, customDriverNames: [], ...shared, tripDurationMin: shared.tripDurations[route], crossLineAssist: false },
        departures: ROUTE_DEPARTURES[route][shared.dayType],
        drivers: [],
        totalTrips: ROUTE_DEPARTURES[route][shared.dayType].length,
        totalDrivers: 0,
        avgWorkHours: 0,
        avgTripsPerDriver: 0,
        totalOTCount: 0,
        totalOTPay: 0,
        fairnessSD: 0,
        coverageRate: 0,
        rushHourCoverage: 0,
      };
    }
    return runSimulation({
      route,
      dayType: shared.dayType,
      numDrivers: customDriverNames.length,
      numOTDrivers: 0,
      customDriverNames,
      assistDriverNames: (shared.crossLineAssist && route === "blue") ? ["(ช่วย) สายเขียว"] : undefined,
      otThresholdHours: shared.otThresholdHours,
      restAfterHours: shared.restAfterHours,
      crossLineAssist: shared.crossLineAssist && route === "green",
      tripDurationMin: shared.tripDurations[route],
      otPayPerSession: shared.otPayPerSession,
    });
  };

  return {
    green: makeResult("green"),
    blue:  makeResult("blue"),
    red:   makeResult("red"),
  };
}
