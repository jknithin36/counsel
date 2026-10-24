"use client";

import type { PracticeAreaSlug } from "@/lib/content/practice-areas";
import { currentUser, getLead, logLeadEvent, uid, updateLead } from "./leads";
import { createClient, createMatter } from "./matters";
import { leadName } from "./selectors";
import { useDemoStore } from "./store";
import type { Client, FeeType, FirmActivityType, Lead } from "./types";

/** A sensible first matter title for the lead's practice area. */
export function suggestedMatterTitle(lead: Lead, area: string) {
  const other = lead.opposingParty?.trim();
  switch (area) {
    case "personal-injury":
      return `${lead.lastName} v. ${other || "Unknown defendant"}`;
    case "family-law":
      return `In re Marriage of ${lead.lastName}`;
    case "estate-planning":
      return `${lead.lastName} Estate Plan`;
    case "criminal-defense":
      return `State v. ${lead.lastName}`;
    default:
      return `${leadName(lead)} — ${other ? `Matter with ${other}` : "General matter"}`;
  }
}

export const defaultFeeType: Record<PracticeAreaSlug, FeeType> = {
  "personal-injury": "contingency",
  "family-law": "hourly",
  "estate-planning": "flat",
  "business-law": "hourly",
  "criminal-defense": "flat",
};

export type ConvertInput = {
  leadId: string;
  matterTitle: string;
  practiceArea: PracticeAreaSlug;
  leadAttorneyId: string;
};

/**
 * Creates a client and an open matter from the lead, marks the lead
 * retained and links them together. Returns the new matter number.
 */
export function convertLeadToClient(input: ConvertInput) {
  const lead = getLead(input.leadId);
  if (!lead) return null;
  const client = createClient({
    name: leadName(lead),
    email: lead.email,
    phone: lead.phone,
    language: lead.language,
    leadId: lead.id,
  });
  const matter = createMatter({
    clientId: client.id,
    title: input.matterTitle,
    practiceArea: input.practiceArea,
    leadAttorneyId: input.leadAttorneyId,
    team: [],
    feeType: defaultFeeType[input.practiceArea],
    openedAt: new Date().toISOString(),
    opposingParties: lead.opposingParty ? [lead.opposingParty] : [],
  });
  const clientId = client.id;
  const matterId = matter.id;
  updateLead(lead.id, {
    status: "retained",
    clientId,
    matterId,
    assignedAttorney: lead.assignedAttorney ?? input.leadAttorneyId,
  });
  logLeadEvent(
    lead.id,
    {
      type: "converted",
      message: `Converted to client · Matter ${matterId} opened`,
    },
    {
      type: "lead_converted",
      message: `${leadName(lead)} retained the firm · ${matterId}`,
    },
  );
  return matterId;
}

const nowIso = () => new Date().toISOString();

function logClient(clientId: string, type: FirmActivityType, message: string) {
  useDemoStore.getState().mutate((data) => ({
    activityLog: [
      {
        id: uid(),
        createdAt: nowIso(),
        type,
        actorId: currentUser().id,
        message,
        href: `/dashboard/clients/${clientId}`,
      },
      ...data.activityLog,
    ],
  }));
}

function patchClient(id: string, patch: Partial<Client>) {
  useDemoStore.getState().mutate((data) => ({
    clients: data.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  }));
}

export type ClientEdit = Partial<
  Pick<
    Client,
    "name" | "email" | "phone" | "address" | "language" | "preferredContact"
  >
>;

export function updateClient(id: string, patch: ClientEdit) {
  patchClient(id, patch);
  logClient(
    id,
    "client_updated",
    `Client details updated: ${patch.name ?? ""}`.trim(),
  );
}

/** Marks the client invited (no email in the demo). */
export function inviteToPortal(id: string) {
  const client = useDemoStore.getState().clients.find((c) => c.id === id);
  if (!client) return;
  patchClient(id, {
    portalStatus: client.portalStatus === "active" ? "active" : "invited",
  });
  logClient(id, "portal_invite", `Portal invite sent to ${client.name}`);
}

export function setClientArchived(id: string, archived: boolean) {
  const client = useDemoStore.getState().clients.find((c) => c.id === id);
  patchClient(id, { archived });
  logClient(
    id,
    "client_updated",
    `${client?.name ?? "Client"} ${archived ? "archived" : "restored"}`,
  );
}

export function addClientNote(id: string, body: string) {
  const user = currentUser();
  const note = {
    id: uid(),
    createdAt: nowIso(),
    author: user.name,
    authorId: user.id,
    body: body.trim(),
  };
  useDemoStore.getState().mutate((data) => ({
    clients: data.clients.map((c) =>
      c.id === id ? { ...c, notes: [note, ...(c.notes ?? [])] } : c,
    ),
  }));
}

export function deleteClientNote(id: string, noteId: string) {
  useDemoStore.getState().mutate((data) => ({
    clients: data.clients.map((c) =>
      c.id === id
        ? { ...c, notes: (c.notes ?? []).filter((n) => n.id !== noteId) }
        : c,
    ),
  }));
}
