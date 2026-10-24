"use client";

import { leadStatus } from "@/lib/config/lead-status";
import { matterStatusLabels } from "./labels";
import { currentUser, getLead, logLeadEvent, uid, updateLead } from "./leads";
import { leadName } from "./selectors";
import { useDemoStore } from "./store";
import type {
  ConflictResult,
  DemoData,
  Lead,
  MatchStrength,
  SavedConflictCheck,
} from "./types";

/*
 * Conflict index: every client, opposing party and related party on a
 * matter, plus leads and the parties they named. Built from the store on
 * demand so it never goes stale.
 */

type IndexData = Pick<DemoData, "clients" | "matters" | "leads">;

type ConflictRecord = Omit<ConflictResult, "strength" | "matched"> & {
  clientId?: string;
  closed: boolean;
};

/** "Keystone Casualty (insurer)" → "Keystone Casualty". */
const stripRole = (name: string) => name.replace(/\s*\(.*\)\s*$/, "").trim();

export function buildConflictIndex(data: IndexData): ConflictRecord[] {
  const records: ConflictRecord[] = [];
  for (const matter of data.matters) {
    const base = {
      matterId: matter.id,
      matterTitle: matter.title,
      href: `/dashboard/matters/${matter.id}`,
      clientId: matter.clientId,
      status: matterStatusLabels[matter.status],
      leadAttorneyId: matter.leadAttorneyId,
      closed: matter.status === "closed",
    };
    const client = data.clients.find((c) => c.id === matter.clientId);
    if (client)
      records.push({ ...base, name: client.name, relationship: "client" });
    for (const party of matter.opposingParties)
      records.push({
        ...base,
        name: stripRole(party),
        relationship: "opposing party",
      });
    for (const party of matter.relatedParties)
      records.push({
        ...base,
        name: stripRole(party),
        relationship: "related party",
      });
  }
  for (const lead of data.leads) {
    const base = {
      leadId: lead.id,
      href: `/dashboard/leads/${lead.id}`,
      status: leadStatus(lead.status).label,
      leadAttorneyId: lead.assignedAttorney,
      closed: false,
    };
    records.push({ ...base, name: leadName(lead), relationship: "lead" });
    if (lead.opposingParty)
      records.push({
        ...base,
        name: stripRole(lead.opposingParty),
        relationship: "opposing party",
      });
  }
  return records;
}

const SUFFIXES = new Set(["llc", "inc", "co", "corp", "ltd", "llp", "the"]);

/** Lowercase words without punctuation or company suffixes. */
export function nameTokens(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !SUFFIXES.has(t));
}

/** Edit distance, for typos like "Lindquist" vs "Lindqvist". */
function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = temp;
    }
  }
  return row[b.length];
}

const similarity = (a: string, b: string) =>
  1 - distance(a, b) / Math.max(a.length, b.length);

const THRESHOLD = 0.8;

/**
 * How well `query` matches `name`. Every query word is compared with its
 * closest word in the name; the average must reach 0.8. All query words
 * present (e.g. "Delgado" in "Maria Delgado") counts as strong.
 */
export function scoreMatch(
  query: string,
  name: string,
): { strength: MatchStrength; matched: string[] } | null {
  const q = nameTokens(query);
  const n = nameTokens(name);
  if (q.length === 0 || n.length === 0) return null;
  if (q.join(" ") === n.join(" ")) return { strength: "exact", matched: n };

  const matched = new Set<string>();
  let total = 0;
  for (const word of q) {
    let best = 0;
    let bestWord = "";
    for (const candidate of n) {
      const sim = similarity(word, candidate);
      if (sim > best) {
        best = sim;
        bestWord = candidate;
      }
    }
    total += best;
    if (best >= THRESHOLD) matched.add(bestWord);
  }
  const score = total / q.length;
  if (score < THRESHOLD) return null;
  return {
    strength: score >= 0.9 ? "strong" : "possible",
    matched: [...matched],
  };
}

const strengthOrder: Record<MatchStrength, number> = {
  exact: 0,
  strong: 1,
  possible: 2,
};

export type ConflictSearch = {
  names: string[];
  includeClosed?: boolean;
  includeLeads?: boolean;
  /** Leave out a lead and its own client file (when checking that lead). */
  excludeLeadId?: string;
};

export function searchConflicts(
  data: IndexData,
  {
    names,
    includeClosed = true,
    includeLeads = true,
    excludeLeadId,
  }: ConflictSearch,
): ConflictResult[] {
  const queries = names.map((n) => n.trim()).filter(Boolean);
  const ownClients = new Set(
    excludeLeadId
      ? data.clients.filter((c) => c.leadId === excludeLeadId).map((c) => c.id)
      : [],
  );
  const best = new Map<string, ConflictResult>();
  for (const record of buildConflictIndex(data)) {
    if (!includeClosed && record.closed) continue;
    if (!includeLeads && record.leadId) continue;
    if (excludeLeadId && record.leadId === excludeLeadId) continue;
    if (record.clientId && ownClients.has(record.clientId)) continue;
    for (const query of queries) {
      const hit = scoreMatch(query, record.name);
      if (!hit) continue;
      const key = `${record.name}|${record.relationship}|${record.matterId ?? record.leadId}`;
      const previous = best.get(key);
      if (
        previous &&
        strengthOrder[previous.strength] <= strengthOrder[hit.strength]
      )
        continue;
      const { clientId: _c, closed: _x, ...rest } = record;
      best.set(key, { ...rest, ...hit });
    }
  }
  return [...best.values()].sort(
    (a, b) =>
      strengthOrder[a.strength] - strengthOrder[b.strength] ||
      a.name.localeCompare(b.name),
  );
}

/** Names a lead's conflict check searches for. */
export function conflictQuery(lead: Lead) {
  return [leadName(lead), lead.opposingParty]
    .filter((n): n is string => Boolean(n?.trim()))
    .map(stripRole);
}

/** Matches for the lead, ignoring the lead itself and its own client file. */
export function findConflicts(lead: Lead, data: IndexData) {
  return searchConflicts(data, {
    names: conflictQuery(lead),
    excludeLeadId: lead.id,
  });
}

/** Runs the check for a lead, saves the result on it and logs it. */
export function runConflictCheck(leadId: string) {
  const lead = getLead(leadId);
  if (!lead) return null;
  const matches = findConflicts(lead, useDemoStore.getState());
  const result = {
    checkedAt: new Date().toISOString(),
    query: conflictQuery(lead),
    matches,
  };
  updateLead(leadId, { conflictCheck: result });
  const summary =
    matches.length === 0
      ? "no conflicts found"
      : `${matches.length} potential conflict${matches.length === 1 ? "" : "s"}`;
  logLeadEvent(
    leadId,
    { type: "conflict_check", message: `Conflict check run: ${summary}` },
    {
      type: "lead_conflict_check",
      message: `Conflict check for ${leadName(lead)}: ${summary}`,
    },
  );
  return result;
}

/** Stores a check from the Conflict Check page in the history. */
export function saveConflictCheck(
  check: Omit<SavedConflictCheck, "id" | "checkedBy" | "checkedAt">,
): SavedConflictCheck {
  const user = currentUser();
  const saved: SavedConflictCheck = {
    ...check,
    id: `CC-${uid().slice(0, 6).toUpperCase()}`,
    checkedBy: user.id,
    checkedAt: new Date().toISOString(),
  };
  const n = check.results.length;
  useDemoStore.getState().mutate((data) => ({
    conflictChecks: [saved, ...data.conflictChecks],
    activityLog: [
      {
        id: uid(),
        createdAt: saved.checkedAt,
        type: "conflict_check_saved",
        actorId: user.id,
        message: `Conflict check saved for "${check.query}": ${n === 0 ? "no conflicts" : `${n} potential conflict${n === 1 ? "" : "s"}`}`,
        href: "/dashboard/conflicts",
      },
      ...data.activityLog,
    ],
  }));
  return saved;
}
