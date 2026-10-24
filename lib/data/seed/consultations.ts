import type { Consultation, Lead } from "../types";
import { at } from "./time";

const prepNotes: Record<string, string> = {
  "personal-injury":
    "Asked them to bring the police report, photos and any letters from the insurer.",
  "family-law":
    "Asked them to bring the current court order and a summary of monthly expenses.",
  "estate-planning":
    "Asked them to bring a list of assets and any existing wills or trusts.",
  "business-law":
    "Asked them to send the contract and related emails before the meeting.",
  "criminal-defense":
    "Asked them to bring the charging paperwork and their next court date.",
};

const durations = [30, 45, 60] as const;

/** Upcoming slots for scheduled leads: [day offset, hour, minute]. */
const upcoming: [number, number, number][] = [
  [0, 11, 0],
  [0, 15, 30],
  [1, 10, 0],
  [1, 14, 0],
  [3, 9, 30],
  [6, 13, 0],
  [10, 11, 0],
  [16, 15, 0],
];

/**
 * 30 consultations: every scheduled lead has one coming up, retained and
 * declined leads had one in the past, and a few contacted leads cancelled
 * or missed theirs.
 */
export function buildConsultations(now: Date, leads: Lead[]): Consultation[] {
  const consultations: Consultation[] = [];
  const daysSince = (lead: Lead) =>
    Math.floor((now.getTime() - new Date(lead.createdAt).getTime()) / 864e5);

  const add = (
    lead: Lead,
    start: string,
    status: Consultation["status"],
    notes: string,
    type = lead.meetingType,
  ) => {
    const n = consultations.length;
    consultations.push({
      id: `CON-${2401 + n}`,
      leadId: lead.id,
      attorneyId: lead.assignedAttorney ?? "u-eleanor",
      start,
      duration: durations[n % 3],
      type,
      status,
      notes,
    });
  };

  const scheduled = leads.filter((l) => l.status === "consultation_scheduled");
  scheduled.forEach((lead, i) => {
    const [day, hour, minute] = upcoming[i % upcoming.length];
    add(
      lead,
      at(now, day, hour, minute),
      "scheduled",
      prepNotes[lead.practiceArea] ?? "",
      // Today's first meeting is a video call, so the demo shows "Join".
      i === 0 ? "video" : lead.meetingType,
    );
  });

  for (const lead of leads.filter((l) => l.status === "retained")) {
    add(
      lead,
      at(now, -(daysSince(lead) - 3), 10 + (lead.firstName.length % 6)),
      "completed",
      "Reviewed the facts, fees and next steps. Client signed the engagement letter.",
    );
  }

  leads
    .filter((l) => l.status === "not_a_fit")
    .forEach((lead, i) => {
      const noShow = i === 1 || i === 4;
      add(
        lead,
        at(now, -(daysSince(lead) - 2), 13 + (i % 4)),
        noShow ? "no_show" : "completed",
        noShow
          ? "Didn't join. Sent a follow-up email with our referral list."
          : (lead.notes.at(-1)?.body ?? ""),
      );
    });

  const contacted = leads.filter((l) => l.status === "contacted");
  [2, 4, 6].forEach((index) => {
    const lead = contacted[index];
    add(
      lead,
      at(now, -Math.max(daysSince(lead) - 2, 1), 11),
      "cancelled",
      "Cancelled by the client. Asked us to call back to reschedule.",
    );
  });
  const missed = contacted[8];
  add(
    missed,
    at(now, -(daysSince(missed) - 3), 16),
    "no_show",
    "Didn't answer the scheduled call. Left a voicemail.",
  );

  return consultations;
}
