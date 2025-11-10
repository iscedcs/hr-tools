import { startOfDay, addDays } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

/**
 * Returns the UTC start and end Date boundaries that correspond
 * to the start and end of the current day in a given timezone.
 *
 * Example:
 * const { start, end } = getTodayRange("Africa/Lagos");
 * => start = 2025-11-09T23:00:00.000Z
 *    end   = 2025-11-10T23:00:00.000Z
 */
export function getTodayRange(timeZone: string = "Africa/Lagos") {
  // Get local midnight in the specified timezone
  const startOfTodayLocal = startOfDay(new Date());

  // Convert Lagos local midnight to UTC timestamp
  const start = fromZonedTime(startOfTodayLocal, timeZone);

  // Calculate next local midnight (end of current day) and convert to UTC
  const end = fromZonedTime(addDays(startOfTodayLocal, 1), timeZone);

  return { start, end };
}
