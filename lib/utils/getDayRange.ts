import { addDays, startOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export function getDayRange(date: Date, timeZone: string = "Africa/Lagos") {
  const startOfLocalDay = startOfDay(date);
  const start = fromZonedTime(startOfLocalDay, timeZone);
  const end = fromZonedTime(addDays(startOfLocalDay, 1), timeZone);

  return { start, end };
}
