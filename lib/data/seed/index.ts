import type { DemoData } from "../types";
import { buildActivityLog } from "./activity";
import {
  buildInvoices,
  buildPayments,
  buildTrustTransactions,
} from "./billing";
import { buildConflictChecks } from "./conflict-checks";
import { buildConsultations } from "./consultations";
import { buildDocuments } from "./documents";
import { buildLeads } from "./leads";
import { buildClientsAndMatters } from "./matters";
import { buildThreads } from "./messages";

/**
 * The full fictional data set, with every date relative to `now`.
 * Only the dashboard and portal import this, so the public site's
 * bundle stays small.
 */
export function buildSeed(now = new Date()): DemoData {
  const leads = buildLeads(now);
  const consultations = buildConsultations(now, leads);
  const { clients, matters } = buildClientsAndMatters(now, leads);
  const invoices = buildInvoices(now, matters);
  const payments = buildPayments(now, invoices, clients);
  const trustTransactions = buildTrustTransactions(
    clients,
    matters,
    payments,
    invoices,
  );
  const documents = buildDocuments(now, matters);
  const threads = buildThreads(now, matters, clients);
  const activityLog = buildActivityLog(now, {
    leads,
    consultations,
    clients,
    matters,
    invoices,
    documents,
    threads,
  });
  const mariaMatter = matters.find((matter) => matter.id === "M-2026-0142");
  const appointments = mariaMatter
    ? [
        {
          id: "APT-MARIA-1",
          matterId: mariaMatter.id,
          start:
            mariaMatter.nextAppointment?.start ??
            new Date(now.getTime() + 3 * 864e5).toISOString(),
          type: "video" as const,
          withId: "u-daniel",
          agenda: "Review the insurer's offer and discuss next steps.",
          status: "upcoming" as const,
        },
        {
          id: "APT-MARIA-0",
          matterId: mariaMatter.id,
          start: new Date(now.getTime() - 21 * 864e5).toISOString(),
          type: "phone" as const,
          withId: "u-rosa",
          agenda: "Check in on medical treatment and lost wage records.",
          status: "past" as const,
        },
      ]
    : [];
  const portalForms = mariaMatter
    ? [
        {
          id: "FORM-MEDICAL-PROVIDERS",
          matterId: mariaMatter.id,
          name: "Medical Providers Questionnaire",
          status: "not_started" as const,
          updatedAt: now.toISOString(),
          data: { providers: [], insurance: "", pharmacy: "", consent: false },
        },
        {
          id: "FORM-ACCIDENT-FOLLOWUP",
          matterId: mariaMatter.id,
          name: "Accident Details Follow-up",
          status: "submitted" as const,
          updatedAt: new Date(now.getTime() - 30 * 864e5).toISOString(),
          submittedAt: new Date(now.getTime() - 30 * 864e5).toISOString(),
          data: {
            providers: [],
            insurance: "Keystone Casualty",
            pharmacy: "Oak Street Pharmacy",
            consent: true,
          },
        },
      ]
    : [];
  return {
    // Stored newest first, like leads added later.
    leads: [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    consultations,
    clients,
    matters,
    invoices,
    documents,
    threads,
    activityLog,
    conflictChecks: buildConflictChecks(now, { clients, matters, leads }),
    payments,
    trustTransactions,
    appointments,
    portalForms,
  };
}
