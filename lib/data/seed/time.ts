import { addDays, startOfDay } from "date-fns";

/*
 * Seed dates are offsets from "now", so the demo always looks current.
 * Negative offsets are in the past.
 */

/** A local date-time `dayOffset` days from today. */
export function at(now: Date, dayOffset: number, hour = 9, minute = 0) {
  const date = addDays(startOfDay(now), dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

/** Like `at`, but never later than now (for things that already happened). */
export function past(now: Date, daysAgo: number, hour = 9, minute = 0) {
  const date = new Date(at(now, -daysAgo, hour, minute));
  if (date <= now) return date.toISOString();
  const minutesAgo = ((hour * 7 + minute) % 170) + 6;
  return new Date(now.getTime() - minutesAgo * 60_000).toISOString();
}

/** `iso` moved by whole hours, e.g. a follow-up two hours later. */
export function later(iso: string, hours: number) {
  return new Date(new Date(iso).getTime() + hours * 3_600_000).toISOString();
}
