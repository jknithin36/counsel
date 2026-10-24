import { attorneys } from "@/lib/content/attorneys";
import { consultation } from "@/lib/content/consultation";
import { faqs } from "@/lib/content/faq";
import { testimonials } from "@/lib/content/home";
import { practiceAreas } from "@/lib/content/practice-areas";
import { caseResults, resultsDisclaimer } from "@/lib/content/results";
import { attorneyUsers, staffUsers } from "@/lib/data/seed/users";
import type {
  AnnouncementContent,
  FirmProfile,
  Profile,
  Settings,
  SiteAttorney,
  SiteFaq,
  SiteTestimonial,
  TeamMember,
} from "@/lib/data/types";
import { firm } from "./firm";

/*
 * Defaults for everything the dashboard can edit. The store only holds
 * changes; these fill in whatever hasn't been changed.
 */

export const defaultAnnouncement: AnnouncementContent = {
  enabled: true,
  message: "Free consultations, in person or by video.",
  linkLabel: "Book online",
  linkHref: "/consultation",
};

export const defaultFirm: FirmProfile = {
  name: firm.name,
  legalName: firm.legalName,
  monogram: firm.monogram,
  phone: firm.phone,
  email: firm.email,
  line1: firm.address.line1,
  city: firm.address.city,
  region: firm.address.region,
  postalCode: firm.address.postalCode,
  hours: firm.hours,
  languages: [...firm.languages],
  timeZone: "America/Chicago",
};

export const defaultAttorneys: SiteAttorney[] = attorneys.map((a) => ({
  ...a,
  visible: true,
}));
export const defaultPracticeAreas = practiceAreas;
export const defaultResults = caseResults;
export const defaultResultsDisclaimer = resultsDisclaimer;
export const defaultFaqs: SiteFaq[] = faqs.map((f, i) => ({
  ...f,
  id: `faq-${i + 1}`,
}));
export const defaultTestimonials: SiteTestimonial[] = testimonials.items.map(
  (t, i) => ({
    ...t,
    id: `t-${i + 1}`,
    visible: true,
  }),
);
export const defaultTestimonialsDisclaimer = testimonials.disclaimer;

export const defaultSettings: Settings = {
  intake: {
    areas: Object.fromEntries(
      practiceAreas.map((a) => [a.slug, true]),
    ) as Settings["intake"]["areas"],
    autoAssign: {},
    durations: [30, 45, 60],
    slotStart: "08:00",
    slotEnd: "17:30",
    thankYouMessage: consultation.thankYou.body,
  },
  notifications: {},
  portal: {
    uploads: true,
    esign: true,
    payments: true,
    timeline: true,
    welcome:
      "Welcome to your client portal. Here you can follow your case, share documents and message your legal team.",
    reminder: "every3",
  },
  billing: {
    terms: 30,
    prefix: "INV",
    rates: { owner: 450, attorney: 375, paralegal: 165, intake: 95 },
    trustName: "Calloway & Reyes IOLTA Trust Account",
    methods: { card: true, ach: true, check: true, trust: true },
  },
};

export const defaultNotifications: Settings["notifications"][string] = {
  newLead: true,
  urgentLead: true,
  consultationBooked: true,
  documentUploaded: false,
  invoicePaid: true,
  clientMessage: true,
};

export function defaultTeam(now = new Date()): TeamMember[] {
  return staffUsers.map((u, i) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role === "client" ? "intake" : u.role,
    practiceAreas:
      attorneys.find((a) => a.slug === u.attorneySlug)?.practiceAreas ?? [],
    status: "active",
    lastActive: new Date(now.getTime() - (i * 3 + 1) * 3_600_000).toISOString(),
  }));
}

export const defaultProfile: Profile = {
  defaultTab: "/dashboard",
  dateFormat: "MMM d, yyyy",
  compact: false,
};

/** Attorneys a new lead in `area` can be auto-assigned to. */
export const assignableAttorneys = attorneyUsers;
