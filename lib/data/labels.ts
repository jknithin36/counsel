import { leadStatuses, urgencies } from "@/lib/config/lead-status";
import { practiceAreas } from "@/lib/content/practice-areas";
import type {
  Consultation,
  DocumentCategory,
  DocumentStatus,
  FeeType,
  InvoiceStatus,
  LeadSource,
  LeadStatus,
  MatterStatus,
  MeetingType,
  PaymentMethod,
  PortalStatus,
  Urgency,
} from "./types";

/** Display labels for stored enum values. */

const areaTitles: Record<string, string> = {
  ...Object.fromEntries(practiceAreas.map((a) => [a.slug, a.title])),
  "not-sure": "Not sure",
  "general-inquiry": "General inquiry",
};

export function practiceAreaLabel(slug: string) {
  return areaTitles[slug] ?? slug;
}

export const leadStatusLabels = Object.fromEntries(
  leadStatuses.map((s) => [s.value, s.label]),
) as Record<LeadStatus, string>;

export const sourceLabels: Record<LeadSource, string> = {
  website: "Website",
  google: "Google",
  referral: "Referral",
  phone: "Phone",
  social: "Social",
};

export const urgencyLabels = Object.fromEntries(
  urgencies.map((u) => [u.value, u.label]),
) as Record<Urgency, string>;

export const meetingTypeLabels: Record<MeetingType, string> = {
  in_person: "In person",
  phone: "Phone",
  video: "Video",
};

export const consultationStatusLabels: Record<Consultation["status"], string> =
  {
    scheduled: "Scheduled",
    completed: "Completed",
    no_show: "No-show",
    cancelled: "Cancelled",
  };

export const matterStatusLabels: Record<MatterStatus, string> = {
  open: "Open",
  pending: "Pending",
  closed: "Closed",
};

export const feeTypeLabels: Record<FeeType, string> = {
  contingency: "Contingency",
  hourly: "Hourly",
  flat: "Flat fee",
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  partially_paid: "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
  void: "Void",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  card: "Card",
  ach: "ACH",
  check: "Check",
  trust: "Trust transfer",
};

export const documentCategoryLabels: Record<DocumentCategory, string> = {
  medical: "Medical record",
  police: "Police report",
  contract: "Contract",
  court: "Court filing",
  correspondence: "Correspondence",
  id: "ID",
  other: "Other",
};

export const portalStatusLabels: Record<PortalStatus, string> = {
  active: "Active",
  invited: "Invited",
  not_invited: "Not invited",
};

export const documentStatusLabels: Record<DocumentStatus, string> = {
  requested: "Requested",
  uploaded: "Uploaded",
  reviewed: "Reviewed",
  sent_for_signature: "Awaiting signature",
  signed: "Signed",
};
