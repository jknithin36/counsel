import { searchConflicts } from "../conflicts";
import type { DemoData, SavedConflictCheck } from "../types";
import { past } from "./time";

/** Past checks from the Conflict Check page: [query, related, by, days ago]. */
const history: [string, string[], string, number][] = [
  ["Ridgeline Freight", ["Keystone Casualty"], "u-daniel", 70],
  ["Erik Lindqvist", [], "u-priya", 52],
  ["Blue Mesa Logistics", ["Ray Dunmore"], "u-james", 13],
  ["Quayside Properties", [], "u-marcus", 9],
  ["Dana Whitlock", ["Ama Mensah"], "u-tom", 30],
  ["Northfield Heating & Air", [], "u-marcus", 4],
];

export function buildConflictChecks(
  now: Date,
  data: Pick<DemoData, "clients" | "matters" | "leads">,
): SavedConflictCheck[] {
  return history.map(([query, related, by, daysAgo], i) => ({
    id: `CC-${String(1001 + i)}`,
    query,
    related,
    includeClosed: true,
    includeLeads: true,
    results: searchConflicts(data, { names: [query, ...related] }),
    checkedBy: by,
    checkedAt: past(now, daysAgo, 10 + i),
  }));
}
