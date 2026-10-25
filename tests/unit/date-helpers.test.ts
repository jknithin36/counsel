import { describe, expect, test } from "vitest";
import { slotsBetween } from "@/lib/data/consultations";
import { at, later, past } from "@/lib/data/seed/time";
import { formatPhone, initials, timeAgo } from "@/lib/format";

describe("date helpers", () => {
  const now = new Date("2026-10-24T16:00:00.000Z");

  test("creates predictable half-hour appointment slots", () => {
    expect(slotsBetween("08:00", "09:30")).toEqual([
      "08:00",
      "08:30",
      "09:00",
      "09:30",
    ]);
  });

  test("moves an ISO timestamp by whole hours", () => {
    expect(later("2026-10-24T12:15:00.000Z", 2)).toBe(
      "2026-10-24T14:15:00.000Z",
    );
  });

  test("keeps generated past timestamps at or before now", () => {
    expect(new Date(past(now, 0, 23)).getTime()).toBeLessThanOrEqual(
      now.getTime(),
    );
    expect(new Date(at(now, 1, 9)).getTime()).toBeGreaterThan(now.getTime());
  });

  test("formats compact relative time", () => {
    expect(timeAgo("2026-10-24T14:00:00.000Z", now)).toBe("2h ago");
  });
});

describe("display helpers", () => {
  test("formats phone input and initials", () => {
    expect(formatPhone("5555550148")).toBe("(555) 555-0148");
    expect(initials("Example Person")).toBe("EP");
  });
});
