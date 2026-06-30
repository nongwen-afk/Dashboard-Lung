import type { RouteTimetable, TimetableHourRow } from "@/types";

const row = (hour: number, minutes: string[]): TimetableHourRow => ({ hour, minutes });

/**
 * Timetables transcribed directly from the official Mahidol University
 * shuttle bus timetable images (Green / Blue / Red lines).
 * Left block of each image = Monday-Friday (weekday).
 * Right (orange) block = Saturday-Sunday & Public Holidays (weekend).
 */

// ---------------- GREEN LINE (วิ่งสาย Line 3) ----------------
const GREEN_WEEKDAY: TimetableHourRow[] = [
  row(6, ["35", "45", "55"]),
  row(7, ["05", "15", "25", "35", "45", "55"]),
  row(8, ["05", "15", "25", "35", "45", "55"]),
  row(9, ["20", "40"]),
  row(10, ["10", "30", "50"]),
  row(11, ["05", "15", "25", "35", "45", "55"]),
  row(12, ["05", "15", "25", "35", "45", "55"]),
  row(13, ["05", "15", "25", "35", "45", "55"]),
  row(14, ["10", "30", "50"]),
  row(15, ["10", "30", "50"]),
  row(16, ["05", "10", "15", "25", "30", "35", "45", "50", "55"]),
  row(17, ["05", "15", "25", "35", "40", "45", "55"]),
  row(18, ["05", "15", "25", "35", "45"]),
  row(19, ["10", "30", "50"]),
  row(20, ["10"]),
];

const GREEN_WEEKEND: TimetableHourRow[] = [
  row(8, ["20", "40"]),
  row(9, ["10", "30", "50"]),
];

// ---------------- BLUE LINE (Line 2) ----------------
const BLUE_WEEKDAY: TimetableHourRow[] = [
  row(6, ["30", "40", "50"]),
  row(7, ["00", "10", "20", "30", "35", "40", "45", "50", "55"]),
  row(8, ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]),
  row(9, ["00", "10", "20", "30", "40"]),
  row(10, ["00", "20", "40"]),
  row(11, ["00", "10", "20", "30", "40", "50"]),
  row(12, ["00", "10", "20", "30", "40", "50"]),
  row(13, ["00", "10", "20", "30", "40"]),
  row(14, ["00", "20", "40"]),
  row(15, ["00", "20", "40"]),
  row(16, ["00", "10", "20", "30", "40", "50"]),
  row(17, ["00", "10", "20", "30", "40", "50"]),
  row(18, ["00", "10", "20", "30", "40"]),
  row(19, ["00", "20", "40"]),
  row(20, ["00"]),
];

const BLUE_WEEKEND: TimetableHourRow[] = [
  row(8, ["20", "40"]),
  row(9, ["10", "30", "50"]),
];

// ---------------- RED LINE (Line 1) ----------------
const RED_WEEKDAY: TimetableHourRow[] = [
  row(6, ["30", "40", "50"]),
  row(7, ["00", "10", "20", "30", "40", "50"]),
  row(8, ["00", "10", "20", "30", "40", "50"]),
  row(9, ["00", "20", "40"]),
  row(10, ["00", "20", "40"]),
  row(11, ["00", "10", "20", "30", "40", "50"]),
  row(12, ["00", "10", "20", "30", "40", "50"]),
  row(13, ["00", "10", "20", "30", "40", "50"]),
  row(14, ["00", "20", "40"]),
  row(15, ["00", "20", "40"]),
  row(16, ["00", "10", "20", "30", "40", "50"]),
  row(17, ["00", "10", "20", "30", "40", "50"]),
  row(18, ["10"]),
  row(19, ["00", "20", "40"]),
  row(20, ["00"]),
];

const RED_WEEKEND: TimetableHourRow[] = [
  row(8, ["30", "50"]),
  row(9, ["10", "30", "50"]),
];

export const TIMETABLES: Record<string, RouteTimetable> = {
  L3: { routeId: "L3", weekday: GREEN_WEEKDAY, weekend: GREEN_WEEKEND }, // Green = Line 3
  L2: { routeId: "L2", weekday: BLUE_WEEKDAY, weekend: BLUE_WEEKEND },   // Blue  = Line 2
  L1: { routeId: "L1", weekday: RED_WEEKDAY, weekend: RED_WEEKEND },     // Red   = Line 1
};

/**
 * Returns the next N departure times for a route, given the current time.
 * Automatically picks weekday/weekend schedule based on `now`.
 */
export function getNextDepartures(
  routeId: string,
  now: Date = new Date(),
  count = 3
): { time: string; tripIndex: number }[] {
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = day === 0 || day === 6;
  const table = TIMETABLES[routeId];
  if (!table) return [];

  const schedule = isWeekend ? table.weekend : table.weekday;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const upcoming: { time: string; tripIndex: number }[] = [];
  let currentTripIndex = 0;

  for (const { hour, minutes } of schedule) {
    for (const min of minutes) {
      const minNum = parseInt(min, 10);
      const isPast = hour < currentHour || (hour === currentHour && minNum <= currentMinute);
      
      if (!isPast) {
        upcoming.push({
          time: `${String(hour).padStart(2, "0")}:${min}`,
          tripIndex: currentTripIndex
        });
        if (upcoming.length >= count) return upcoming;
      }
      currentTripIndex++;
    }
  }

  return upcoming;
}

/** Total scheduled trips in a day (weekday) — useful for stats */
export function countDailyTrips(routeId: string): number {
  const table = TIMETABLES[routeId];
  if (!table) return 0;
  return table.weekday.reduce((sum, r) => sum + r.minutes.length, 0);
}

/**
 * Returns ALL departures for a specific date, ignoring the current time.
 */
export function getAllDepartures(
  routeId: string,
  date: Date
): { time: string; tripIndex: number }[] {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = day === 0 || day === 6;
  const table = TIMETABLES[routeId];
  if (!table) return [];

  const schedule = isWeekend ? table.weekend : table.weekday;
  
  const allDepartures: { time: string; tripIndex: number }[] = [];
  let currentTripIndex = 0;

  for (const { hour, minutes } of schedule) {
    for (const min of minutes) {
      allDepartures.push({
        time: `${String(hour).padStart(2, "0")}:${min}`,
        tripIndex: currentTripIndex
      });
      currentTripIndex++;
    }
  }

  return allDepartures;
}

/**
 * Returns the number of whole minutes (and remaining seconds) until the
 * very next departure for a route.
 * Returns null when there are no more departures today.
 */
export function getMinutesUntilNext(
  routeId: string,
  now: Date = new Date()
): { minutes: number; seconds: number; time: string; tripIndex: number } | null {
  const nextDepts = getNextDepartures(routeId, now, 1);
  if (nextDepts.length === 0) return null;
  const nextTimeObj = nextDepts[0];

  const [hStr, mStr] = nextTimeObj.time.split(":");
  const depHour   = parseInt(hStr, 10);
  const depMinute = parseInt(mStr, 10);

  const depDate = new Date(now);
  depDate.setHours(depHour, depMinute, 0, 0);

  const diffMs  = depDate.getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const totalSec = Math.floor(diffMs / 1000);
  return {
    minutes: Math.floor(totalSec / 60),
    seconds: totalSec % 60,
    time: nextTimeObj.time,
    tripIndex: nextTimeObj.tripIndex,
  };
}
