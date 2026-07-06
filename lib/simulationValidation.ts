// ====================================================================
// Simulation Validation — Real-time feasibility checker
// ====================================================================

import {
  ROUTE_META,
  ROUTE_DEPARTURES,
  type MultiRouteSimResult,
  type AssignmentMap,
  type SharedSimConfig,
  type RouteKey,
  maxConcurrentTrips,
} from "./simulationEngine";

// ── Types ─────────────────────────────────────────────────────────────

export type ValidationLevel = "error" | "warning" | "info" | "ok";

export interface RouteValidation {
  route: RouteKey;
  level: ValidationLevel;
  code: string;
  title: string;
  detail: string;
  suggestion?: string;
}

export interface ValidationSummary {
  issues: RouteValidation[];
  byRoute: Record<RouteKey, RouteValidation[]>;
  errorCount: number;
  warningCount: number;
  hasError: boolean;
  hasWarning: boolean;
  overallLevel: ValidationLevel;
}

// ── Internal helpers ──────────────────────────────────────────────────

/** Minimum gap (minutes) between any two consecutive departures */
function minIntervalMinutes(departures: number[]): number {
  if (departures.length < 2) return Infinity;
  let min = Infinity;
  for (let i = 1; i < departures.length; i++) {
    min = Math.min(min, departures[i] - departures[i - 1]);
  }
  return min;
}

/** How many trips fall in a time window */
function tripsInWindow(departures: number[], startMin: number, endMin: number): number {
  return departures.filter((d) => d >= startMin && d < endMin).length;
}

// ── Main validator ────────────────────────────────────────────────────

export function validateSimulation(
  multiResult: MultiRouteSimResult,
  assignments: AssignmentMap,
  config: SharedSimConfig
): ValidationSummary {
  const issues: RouteValidation[] = [];
  const byRoute: Record<RouteKey, RouteValidation[]> = { green: [], blue: [], red: [] };

  const push = (v: RouteValidation) => {
    issues.push(v);
    byRoute[v.route].push(v);
  };

  for (const route of ["green", "blue", "red"] as RouteKey[]) {
    const result = multiResult[route];
    const label = ROUTE_META[route].label;
    const numDrivers = result.totalDrivers;
    const departures = result.departures;
    const tripDur = config.tripDurations[route];

    // ── CHECK 1: No drivers ───────────────────────────────────────────
    if (numDrivers === 0) {
      push({
        route,
        level: "error",
        code: "NO_DRIVERS",
        title: "ไม่มีคนขับ",
        detail: `${label} ยังไม่มีคนขับถูกจัดสาย`,
        suggestion: "ลากการ์ดคนขับจาก Pool หรือสายอื่นมาวางที่สายนี้",
      });
      continue; // skip further checks
    }

    // ── CHECK 2: Minimum concurrent drivers & Weekly Rest Required ───────
    const maxConcurrentWeekday = maxConcurrentTrips(ROUTE_DEPARTURES[route]["weekday"], tripDur);
    const maxConcurrentWeekend = maxConcurrentTrips(ROUTE_DEPARTURES[route]["weekend"], tripDur);
    const weeklyShiftsNeeded = 5 * maxConcurrentWeekday + 2 * maxConcurrentWeekend;
    const requiredTotalDrivers = Math.ceil(weeklyShiftsNeeded / 6);
    const maxConcurrentToday = maxConcurrentTrips(departures, tripDur);

    if (numDrivers < Math.max(requiredTotalDrivers, maxConcurrentToday)) {
      if (numDrivers < requiredTotalDrivers && numDrivers >= maxConcurrentToday) {
        push({
          route,
          level: "error",
          code: "INSUFFICIENT_WEEKLY",
          title: `ต้องการ ≥ ${requiredTotalDrivers} คน เพื่อให้มีวันหยุด (มี ${numDrivers})`,
          detail: `จัดตารางให้ทุกคนได้หยุด 1 วัน/สัปดาห์ ต้องใช้ ${requiredTotalDrivers} คน (วันธรรมดาใช้ ${maxConcurrentWeekday} วันหยุดใช้ ${maxConcurrentWeekend}) — ขาดอีก ${requiredTotalDrivers - numDrivers} คน`,
          suggestion: `เพิ่มคนขับอีก ${requiredTotalDrivers - numDrivers} คน หรือลดรอบวิ่ง`,
        });
      } else {
        push({
          route,
          level: "error",
          code: "INSUFFICIENT_PEAK",
          title: `ต้องการ ≥ ${maxConcurrentToday} คน ในวันนี้ (มีแค่ ${numDrivers})`,
          detail: `ช่วงที่มีรอบถี่ต้องการคนขับพร้อมกัน ${maxConcurrentToday} คน แต่มีเพียง ${numDrivers} คน (ถ้าคำนวณเผื่อวันหยุด 1 วันด้วย ต้องมีรวม ${requiredTotalDrivers} คน)`,
          suggestion: `เพิ่มคนขับอีกอย่างน้อย ${Math.max(requiredTotalDrivers, maxConcurrentToday) - numDrivers} คน`,
        });
      }
    } else if (numDrivers === requiredTotalDrivers) {
      push({
        route,
        level: "info",
        code: "PERFECT_FIT",
        title: "จำนวนคนขับพอดี (มีวันหยุด 1 วัน/สัปดาห์)",
        detail: `ด้วยคนขับ ${numDrivers} คน เพียงพอต่อรอบวิ่งปัจจุบันและจัดสรรวันหยุดได้ลงตัว`,
      });
    }

    // ── CHECK 3: Trip duration vs minimum interval ────────────────────
    const minInterval = minIntervalMinutes(departures);
    if (isFinite(minInterval) && tripDur > minInterval * numDrivers) {
      // Only push if not already captured by CHECK 2
      if (maxConcurrentToday <= numDrivers) {
        push({
          route,
          level: "warning",
          code: "TRIP_TOO_LONG",
          title: `ระยะเวลา/รอบ ${tripDur} นาที อาจนานเกินไป`,
          detail: `ช่วงที่ถี่ที่สุดออกรถทุก ${minInterval} นาที — ${numDrivers} คนรับได้สูงสุดรอบละ ${minInterval * numDrivers} นาที (ปัจจุบัน ${tripDur} นาที)`,
          suggestion: `ลด "ระยะเวลา/รอบ" ให้ ≤ ${Math.floor(minInterval * numDrivers)} นาที หรือเพิ่มคนขับ`,
        });
      }
    }

    // ── CHECK 4: Low coverage / Overlapping trips ─────────────────────────────────────────
    const uncovered = Math.round(result.totalTrips * (1 - result.coverageRate / 100));
    if (result.overlappedTrips > 0) {
      push({
        route,
        level: "error",
        code: "OVERLAPPED_TRIPS",
        title: `เวลาทับซ้อนกัน ${result.overlappedTrips} รอบ (จัดคนไม่พอ)`,
        detail: `มหาลัยกำหนดให้มี ${result.totalTrips} รอบ แต่คนขับมีจำกัดและรอบเวลาติดกันเกินไป ทำให้เกิดเวลาทับซ้อน ${result.overlappedTrips} รอบ (ต้องรับผู้โดยสารช้ากว่ากำหนด)`,
        suggestion: "จำเป็นต้องเพิ่มจำนวนคนขับในสายนี้เพื่อแก้ไขเวลาทับซ้อน",
      });
    } else if (result.coverageRate < 60) {
      push({
        route,
        level: "error",
        code: "VERY_LOW_COVERAGE",
        title: `ครอบคลุมเพียง ${result.coverageRate.toFixed(0)}% (${uncovered} รอบตกหล่น)`,
        detail: `จาก ${result.totalTrips} รอบ มีคนขับรับได้ ${result.totalTrips - uncovered} รอบ เหลือตกหล่น ${uncovered} รอบ`,
        suggestion: "เพิ่มจำนวนคนขับในสายนี้หรือลดความถี่รอบวิ่ง",
      });
    } else if (result.coverageRate < 100) {
      push({
        route,
        level: "warning",
        code: "PARTIAL_COVERAGE",
        title: `รอบวิ่งตกหล่น ${uncovered} รอบ (ครอบคลุม ${result.coverageRate.toFixed(0)}%)`,
        detail: `จาก ${result.totalTrips} รอบ มีคนขับรับได้ ${result.totalTrips - uncovered} รอบ เนื่องจากคนขับมีคิวงานทับซ้อนหรือกำลังพัก`,
        suggestion: "เพิ่มจำนวนคนขับหรือปรับลดเวลาต่อรอบ (Trip Duration)",
      });
    }

    // ── CHECK 5: OT overload ──────────────────────────────────────────
    const otRatio = result.totalTrips > 0 ? result.totalOTCount / result.totalTrips : 0;
    if (otRatio > 0.4) {
      push({
        route,
        level: "warning",
        code: "HEAVY_OT",
        title: `OT สูง ${(otRatio * 100).toFixed(0)}% ของรอบ`,
        detail: `${result.totalOTCount} จาก ${result.totalTrips} รอบเป็น OT — ค่าใช้จ่ายเพิ่ม ฿${result.totalOTPay.toLocaleString()}/วัน`,
        suggestion: "เพิ่มคนขับเพื่อลด OT หรือลด OT Threshold",
      });
    }

    // ── CHECK 6: Rest time physically impossible ──────────────────────
    // If rest is forced every X hours but trip takes Y min, and interval is tiny
    if (config.restAfterHours * 60 < tripDur * 2) {
      push({
        route,
        level: "error",
        code: "REST_IMPOSSIBLE",
        title: "กฎพักขัดแย้งกัน",
        detail: `กำหนดพักบังคับหลัง ${config.restAfterHours} ชม. (${config.restAfterHours * 60} นาที) แต่ระยะเวลา/รอบ = ${tripDur} นาที — ไม่สามารถพักได้ในช่วงสั้นนี้`,
        suggestion: `ตั้ง "พักบังคับหลัง" ให้ ≥ ${Math.ceil((tripDur * 2) / 60)} ชั่วโมง`,
      });
    }

    // ── CHECK 7: Rush hour specific — morning peak adequacy ──────────
    const morningRushTrips = tripsInWindow(departures, 6 * 60 + 30, 9 * 60);
    const morningMaxConcurrent = maxConcurrentTrips(
      departures.filter((d) => d >= 6 * 60 + 30 && d < 9 * 60),
      tripDur
    );
    if (morningMaxConcurrent > numDrivers && result.coverageRate >= 60) {
      // Only warn if not already in error for general case
      if (!byRoute[route].some((v) => v.code === "INSUFFICIENT_PEAK")) {
        push({
          route,
          level: "warning",
          code: "RUSH_AM_TIGHT",
          title: `Rush AM ตึง (${morningRushTrips} รอบใน 2.5 ชม.)`,
          detail: `ช่วง 06:30–09:00 มี ${morningRushTrips} รอบ ต้องการ ${morningMaxConcurrent} คนพร้อมกัน`,
          suggestion: "ควรมีคนขับ Cross-Line จากสายอื่นมาช่วยช่วง Rush AM",
        });
      }
    }

    // ── CHECK 8: All good ─────────────────────────────────────────────
    const routeIssues = byRoute[route];
    if (routeIssues.length === 0) {
      push({
        route,
        level: "ok",
        code: "OK",
        title: "แผนสมเหตุสมผล ✓",
        detail: `${numDrivers} คน ครอบคลุม ${result.coverageRate.toFixed(1)}% จาก ${result.totalTrips} รอบ`,
      });
    }
  }

  const errorCount = issues.filter((v) => v.level === "error").length;
  const warningCount = issues.filter((v) => v.level === "warning").length;
  const overallLevel: ValidationLevel =
    errorCount > 0 ? "error" : warningCount > 0 ? "warning" : "ok";

  return {
    issues,
    byRoute,
    errorCount,
    warningCount,
    hasError: errorCount > 0,
    hasWarning: warningCount > 0,
    overallLevel,
  };
}
