import type { Tone } from "@/components/dashboard/status-badge";
import type { LeadStatus, Urgency } from "@/lib/data/types";

/** Lead statuses in pipeline order, with their badge tone. */
export const leadStatuses: { value: LeadStatus; label: string; tone: Tone }[] =
  [
    { value: "new", label: "New", tone: "blue" },
    { value: "contacted", label: "Contacted", tone: "neutral" },
    {
      value: "consultation_scheduled",
      label: "Consultation scheduled",
      tone: "amber",
    },
    { value: "retained", label: "Retained", tone: "green" },
    { value: "not_a_fit", label: "Not a fit", tone: "red" },
  ];

export const urgencies: { value: Urgency; label: string; tone: Tone }[] = [
  { value: "urgent", label: "Urgent", tone: "red" },
  { value: "soon", label: "Soon", tone: "amber" },
  { value: "researching", label: "Researching", tone: "neutral" },
];

export function leadStatus(value: LeadStatus) {
  return leadStatuses.find((s) => s.value === value) ?? leadStatuses[0];
}

export function urgency(value: Urgency) {
  return urgencies.find((u) => u.value === value) ?? urgencies[2];
}
