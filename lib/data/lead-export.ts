import { format } from "date-fns";
import { leadStatus, urgency } from "@/lib/config/lead-status";
import { downloadCsv } from "@/lib/csv";
import { practiceAreaLabel, sourceLabels } from "./labels";
import { userName } from "./selectors";
import type { Lead } from "./types";

const columns: [string, (lead: Lead) => string][] = [
  ["Reference", (l) => l.id],
  ["First name", (l) => l.firstName],
  ["Last name", (l) => l.lastName],
  ["Email", (l) => l.email],
  ["Phone", (l) => l.phone],
  ["Practice area", (l) => practiceAreaLabel(l.practiceArea)],
  ["Status", (l) => leadStatus(l.status).label],
  ["Urgency", (l) => urgency(l.urgency).label],
  ["Source", (l) => sourceLabels[l.source]],
  ["Assigned", (l) => (l.assignedAttorney ? userName(l.assignedAttorney) : "")],
  ["Received", (l) => format(new Date(l.createdAt), "yyyy-MM-dd HH:mm")],
  ["Description", (l) => l.description],
];

/** Downloads the leads as a CSV file. */
export function downloadLeadsCsv(leads: Lead[]) {
  downloadCsv(`leads-${format(new Date(), "yyyy-MM-dd")}.csv`, [
    columns.map(([header]) => header),
    ...leads.map((lead) => columns.map(([, get]) => get(lead))),
  ]);
}
