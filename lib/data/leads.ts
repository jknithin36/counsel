"use client";

import { leadStatus } from "@/lib/config/lead-status";
import { practiceAreaLabel, sourceLabels } from "./labels";
import { findDemoUser } from "./seed/users";
import { leadName } from "./selectors";
import { useDemoStore } from "./store";
import type {
  ActivityEvent,
  FirmActivity,
  FirmActivityType,
  Lead,
  LeadStatus,
  NewLead,
} from "./types";

/*
 * Lead data access. Everything goes through these functions so the browser
 * store can be swapped for a real database (and server actions) later.
 * Every change records an event on the lead and in the firm activity log.
 */

export const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

/** The signed-in staff member, for activity and notes. */
export function currentUser() {
  const id = useDemoStore.getState().session?.userId ?? "u-eleanor";
  return findDemoUser(id) ?? { id, name: "Staff" };
}

function referenceCode(existing: Lead[]) {
  const taken = new Set(existing.map((lead) => lead.id));
  let code: string;
  do {
    code = `CR-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (taken.has(code));
  return code;
}

/** Records an event on one lead and in the firm-wide log. */
export function logLeadEvent(
  leadId: string,
  event: { type: ActivityEvent["type"]; message: string },
  firm: { type: FirmActivityType; message: string } | null,
  actorId = currentUser().id,
) {
  const now = new Date().toISOString();
  useDemoStore.getState().mutate((data) => ({
    leads: data.leads.map((lead) =>
      lead.id === leadId
        ? {
            ...lead,
            activity: [
              ...lead.activity,
              { id: uid(), createdAt: now, ...event },
            ],
          }
        : lead,
    ),
    activityLog: firm
      ? [
          {
            id: uid(),
            createdAt: now,
            actorId,
            href: `/dashboard/leads/${leadId}`,
            ...firm,
          } satisfies FirmActivity,
          ...data.activityLog,
        ]
      : data.activityLog,
  }));
}

export function createLead(input: NewLead): Lead {
  const { leads, addLead, logActivity, settings } = useDemoStore.getState();
  const now = new Date().toISOString();
  // Settings › Intake can route each practice area to a default attorney.
  const autoAttorney =
    settings.intake?.autoAssign[
      input.practiceArea as keyof typeof settings.intake.autoAssign
    ];
  const lead: Lead = {
    ...input,
    assignedAttorney: input.assignedAttorney ?? autoAttorney,
    id: referenceCode(leads),
    createdAt: now,
    status: "new",
    notes: [],
    activity: [
      {
        id: uid(),
        createdAt: now,
        type: "submitted",
        message: "Lead submitted via website",
      },
      ...(autoAttorney && !input.assignedAttorney
        ? [
            {
              id: uid(),
              createdAt: now,
              type: "assigned" as const,
              message: `Assigned to ${findDemoUser(autoAttorney)?.name ?? "attorney"} (auto-assignment)`,
            },
          ]
        : []),
    ],
  };
  addLead(lead);
  logActivity({
    id: uid(),
    createdAt: now,
    type: "lead_created",
    actorId: "website",
    message: `New lead: ${leadName(lead)} · ${practiceAreaLabel(lead.practiceArea)}`,
    href: `/dashboard/leads/${lead.id}`,
  });
  return lead;
}

/** A phone or walk-in lead entered by staff. */
export function createIntakeLead(input: NewLead): Lead {
  const { leads, addLead, logActivity } = useDemoStore.getState();
  const user = currentUser();
  const now = new Date().toISOString();
  const via =
    input.source === "phone"
      ? "phone intake"
      : sourceLabels[input.source].toLowerCase();
  const lead: Lead = {
    ...input,
    id: referenceCode(leads),
    createdAt: now,
    status: "new",
    notes: [],
    activity: [
      {
        id: uid(),
        createdAt: now,
        type: "created",
        message: `Lead created by ${user.name} (${via})`,
      },
    ],
  };
  addLead(lead);
  logActivity({
    id: uid(),
    createdAt: now,
    type: "lead_created",
    actorId: user.id,
    message: `New lead: ${leadName(lead)} · ${practiceAreaLabel(lead.practiceArea)}`,
    href: `/dashboard/leads/${lead.id}`,
  });
  return lead;
}

export function listLeads(): Lead[] {
  return useDemoStore.getState().leads;
}

export function getLead(id: string): Lead | undefined {
  return useDemoStore.getState().leads.find((lead) => lead.id === id);
}

export function updateLead(id: string, patch: Partial<Lead>) {
  useDemoStore.getState().updateLead(id, patch);
}

export function setLeadStatus(id: string, status: LeadStatus) {
  const lead = getLead(id);
  if (!lead || lead.status === status) return;
  updateLead(id, { status });
  const label = leadStatus(status).label;
  logLeadEvent(
    id,
    { type: "status_changed", message: `Status changed to ${label}` },
    {
      type: "lead_status_changed",
      message: `${leadName(lead)}: status changed to ${label.toLowerCase()}`,
    },
  );
}

/** Pass undefined to unassign. */
export function assignLead(id: string, attorneyId: string | undefined) {
  const lead = getLead(id);
  if (!lead || lead.assignedAttorney === attorneyId) return;
  updateLead(id, { assignedAttorney: attorneyId });
  const name = attorneyId ? findDemoUser(attorneyId)?.name : undefined;
  const message = name ? `Assigned to ${name}` : "Unassigned";
  logLeadEvent(
    id,
    { type: "assigned", message },
    {
      type: "lead_assigned",
      message: `${leadName(lead)}: ${name ? `assigned to ${name}` : "unassigned"}`,
    },
  );
}

export function addNote(id: string, body: string) {
  const user = currentUser();
  const note = {
    id: uid(),
    createdAt: new Date().toISOString(),
    author: user.name,
    authorId: user.id,
    body: body.trim(),
  };
  useDemoStore.getState().mutate((data) => ({
    leads: data.leads.map((lead) =>
      lead.id === id ? { ...lead, notes: [note, ...lead.notes] } : lead,
    ),
  }));
  logLeadEvent(
    id,
    { type: "note_added", message: `Note added by ${user.name}` },
    null,
  );
}

export function deleteNote(id: string, noteId: string) {
  useDemoStore.getState().mutate((data) => ({
    leads: data.leads.map((lead) =>
      lead.id === id
        ? { ...lead, notes: lead.notes.filter((n) => n.id !== noteId) }
        : lead,
    ),
  }));
  logLeadEvent(
    id,
    { type: "note_deleted", message: `Note deleted by ${currentUser().name}` },
    null,
  );
}

/** Removes the lead and any consultations still booked for it. */
export function deleteLead(id: string) {
  const lead = getLead(id);
  if (!lead) return;
  const user = currentUser();
  useDemoStore.getState().mutate((data) => ({
    leads: data.leads.filter((l) => l.id !== id),
    consultations: data.consultations.filter(
      (c) => !(c.leadId === id && c.status === "scheduled"),
    ),
    activityLog: [
      {
        id: uid(),
        createdAt: new Date().toISOString(),
        type: "lead_deleted",
        actorId: user.id,
        message: `Lead deleted: ${leadName(lead)}`,
      },
      ...data.activityLog,
    ],
  }));
}
