import type { StaffRole } from "@/lib/auth/roles";
import type { Attorney } from "@/lib/content/attorneys";
import type { Faq } from "@/lib/content/faq";
import type {
  PracticeArea,
  PracticeAreaSlug,
} from "@/lib/content/practice-areas";
import type { CaseResult } from "@/lib/content/results";

/*
 * Demo data model. Dates are ISO strings; people are referenced by user id
 * (see lib/data/seed/users.ts) so names stay in one place.
 */

export type LeadStatus =
  | "new"
  | "contacted"
  | "consultation_scheduled"
  | "retained"
  | "not_a_fit";

export type LeadSource = "website" | "phone" | "referral" | "google" | "social";
export type Urgency = "urgent" | "soon" | "researching";
export type MeetingType = "in_person" | "phone" | "video";

export type Note = {
  id: string;
  createdAt: string;
  author: string;
  /** User id of the author, for notes written in the dashboard. */
  authorId?: string;
  body: string;
};

export type ActivityEvent = {
  id: string;
  createdAt: string;
  type:
    | "submitted"
    | "created"
    | "status_changed"
    | "note_added"
    | "note_deleted"
    | "assigned"
    | "consultation"
    | "conflict_check"
    | "converted";
  message: string;
};

export type ConflictMatch = {
  name: string;
  relationship: "client" | "opposing party" | "related party" | "lead";
  matterId?: string;
  matterTitle?: string;
  leadId?: string;
  href: string;
};

export type ConflictCheck = {
  checkedAt: string;
  /** The names that were searched. */
  query: string[];
  matches: ConflictMatch[];
};

export type Lead = {
  /** Short reference shown to the client, e.g. "CR-4821". */
  id: string;
  createdAt: string;
  status: LeadStatus;
  /** A practice area slug, "not-sure", or "general-inquiry". */
  practiceArea: string;
  preferredAttorney?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContact: "phone" | "email" | "text";
  language: "English" | "Spanish";
  incidentDate?: string;
  description: string;
  urgency: Urgency;
  opposingParty?: string;
  preferredTimes: string[];
  meetingType: MeetingType;
  source: LeadSource;
  referralSource?: string;
  consent: boolean;
  notes: Note[];
  activity: ActivityEvent[];
  /** User id of the assigned attorney. */
  assignedAttorney?: string;
  conflictCheck?: ConflictCheck;
  /** Set when the lead is converted into a client and matter. */
  clientId?: string;
  matterId?: string;
};

/** What a form submits; the store fills in id, dates, status and history. */
export type NewLead = Omit<
  Lead,
  | "id"
  | "createdAt"
  | "status"
  | "notes"
  | "activity"
  | "conflictCheck"
  | "clientId"
  | "matterId"
>;

export type Consultation = {
  id: string;
  leadId: string;
  attorneyId: string;
  start: string;
  duration: 30 | 45 | 60;
  type: MeetingType;
  status: "scheduled" | "completed" | "no_show" | "cancelled";
  notes: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  language: "English" | "Spanish";
  since: string;
  matters: string[];
  /** Funds held in the firm's trust account for this client, in dollars. */
  trustBalance: number;
  leadId?: string;
  /** Missing on older data; treat as "not_invited". */
  portalStatus?: PortalStatus;
  preferredContact?: "phone" | "email" | "text";
  archived?: boolean;
  /** Internal staff notes, newest first. */
  notes?: Note[];
  notificationEmail?: boolean;
  notificationText?: boolean;
};

export type PortalStatus = "active" | "invited" | "not_invited";

export type MatterStatus = "open" | "pending" | "closed";
export type FeeType = "contingency" | "hourly" | "flat";

export type TaskPriority = "high" | "medium" | "low";

export type MatterTask = {
  id: string;
  title: string;
  dueAt: string;
  assigneeId: string;
  done: boolean;
  /** Missing on older data; treat as "medium". */
  priority?: TaskPriority;
};

export type MatterUpdate = {
  id: string;
  createdAt: string;
  authorId: string;
  title: string;
  body: string;
  /** Shown in the client portal. */
  shared: boolean;
};

export type Matter = {
  /** The matter number, e.g. "M-2026-0142". */
  id: string;
  title: string;
  clientId: string;
  practiceArea: PracticeAreaSlug;
  status: MatterStatus;
  /** A stage key from lib/data/stages.ts for the practice area. */
  stage: string;
  leadAttorneyId: string;
  team: string[];
  openedAt: string;
  nextDeadline?: { date: string; label: string };
  nextAppointment?: { start: string; type: MeetingType; label: string };
  /** Statute of limitations or similar hard deadline (fictional). */
  limitationsDate?: string;
  feeType: FeeType;
  /** Hourly and flat-fee matters. */
  budget?: number;
  /** Contingency matters. */
  estimatedValue?: number;
  tasks: MatterTask[];
  updates: MatterUpdate[];
  opposingParties: string[];
  relatedParties: string[];
};

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "void";

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export type Invoice = {
  /** e.g. "INV-1042". */
  id: string;
  matterId: string;
  clientId: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  lineItems: LineItem[];
  /** Percent, e.g. 0 or 8.25. Missing means 0. */
  taxRate?: number;
  notes?: string;
};

export type PaymentMethod = "card" | "ach" | "check" | "trust";

export type Payment = {
  id: string;
  invoiceId: string;
  clientId: string;
  date: string;
  method: PaymentMethod;
  amount: number;
  reference: string;
};

export type TrustTransaction = {
  id: string;
  clientId: string;
  matterId?: string;
  date: string;
  type: "deposit" | "transfer";
  amount: number;
  /** The invoice paid by a transfer. */
  invoiceId?: string;
  note: string;
};

export type DocumentCategory =
  | "medical"
  | "police"
  | "contract"
  | "court"
  | "correspondence"
  | "id"
  | "other";

export type DocumentStatus =
  | "requested"
  | "uploaded"
  | "reviewed"
  | "sent_for_signature"
  | "signed";

export type MatterDocument = {
  id: string;
  matterId: string;
  name: string;
  type: "pdf" | "docx" | "image" | "spreadsheet";
  /** User id, or the client id for client uploads. */
  uploadedBy: string;
  uploadedAt: string;
  status: DocumentStatus;
  /** Bytes, for uploads. */
  size?: number;
  /** Instructions shown to the client on a request. */
  note?: string;
  /** When a requested document is due from the client. */
  dueAt?: string;
  category?: DocumentCategory;
  /** Status changes, oldest first. Derived from status when missing. */
  history?: { status: DocumentStatus; at: string; by: string }[];
  comment?: string;
  signedAt?: string;
  signer?: string;
};

export type PortalAppointment = {
  id: string;
  matterId: string;
  start: string;
  type: MeetingType;
  withId: string;
  agenda: string;
  status: "upcoming" | "past" | "cancelled";
};

export type MedicalProvider = {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  firstVisit: string;
  stillTreating: boolean;
};

export type PortalFormData = {
  providers: MedicalProvider[];
  insurance: string;
  pharmacy: string;
  consent: boolean;
};

export type PortalForm = {
  id: string;
  matterId: string;
  name: string;
  status: "not_started" | "in_progress" | "submitted";
  updatedAt: string;
  submittedAt?: string;
  data: PortalFormData;
};

export type Message = {
  id: string;
  /** User id of the sender (staff or the client account). */
  authorId: string;
  body: string;
  sentAt: string;
  /** Read by the other side. */
  read: boolean;
  /** Staff-only note in the thread; never shown to the client. */
  internal?: boolean;
  attachments?: { name: string; size: number }[];
};

export type MessageThread = {
  id: string;
  matterId: string;
  clientId: string;
  subject: string;
  messages: Message[];
};

export type FirmActivityType =
  | "lead_created"
  | "lead_status_changed"
  | "lead_assigned"
  | "lead_note"
  | "lead_conflict_check"
  | "lead_converted"
  | "lead_deleted"
  | "consultation_cancelled"
  | "consultation_updated"
  | "conflict_check_saved"
  | "matter_updated"
  | "matter_closed"
  | "task_updated"
  | "document_requested"
  | "document_sent"
  | "message_sent"
  | "client_updated"
  | "portal_invite"
  | "document_reminder"
  | "payment_recorded"
  | "trust_updated"
  | "consultation_booked"
  | "matter_opened"
  | "document_uploaded"
  | "document_signed"
  | "invoice_sent"
  | "invoice_paid"
  | "message_received";

export type FirmActivity = {
  id: string;
  createdAt: string;
  type: FirmActivityType;
  /** User id, or "client"/"website" for outside actors. */
  actorId: string;
  message: string;
  href?: string;
};

export type MatchStrength = "exact" | "strong" | "possible";

export type ConflictResult = ConflictMatch & {
  strength: MatchStrength;
  /** Normalized words of `name` that matched, for highlighting. */
  matched: string[];
  /** Matter status or lead status label, for display. */
  status: string;
  leadAttorneyId?: string;
};

export type SavedConflictCheck = {
  id: string;
  query: string;
  related: string[];
  includeClosed: boolean;
  includeLeads: boolean;
  results: ConflictResult[];
  checkedBy: string;
  checkedAt: string;
};

/** Everything the dashboard reads; seeded on first visit. */
export type DemoData = {
  leads: Lead[];
  consultations: Consultation[];
  clients: Client[];
  matters: Matter[];
  invoices: Invoice[];
  documents: MatterDocument[];
  threads: MessageThread[];
  activityLog: FirmActivity[];
  conflictChecks: SavedConflictCheck[];
  payments: Payment[];
  trustTransactions: TrustTransaction[];
  appointments: PortalAppointment[];
  portalForms: PortalForm[];
};

/* ------------------------------------------------------------------ */
/* Website content overrides, settings, team and profiles.             */
/* ------------------------------------------------------------------ */

export type AnnouncementContent = {
  enabled: boolean;
  message: string;
  linkLabel: string;
  linkHref: string;
};

export type FirmProfile = {
  name: string;
  legalName: string;
  monogram: string;
  phone: string;
  email: string;
  line1: string;
  city: string;
  region: string;
  postalCode: string;
  hours: string;
  languages: string[];
  timeZone: string;
};

export type SiteAttorney = Attorney & { visible: boolean };
export type SiteFaq = Faq & { id: string };
export type SiteTestimonial = {
  id: string;
  quote: string;
  name: string;
  context: string;
  attorney: string;
  visible: boolean;
};

export type ContentSection =
  | "announcement"
  | "attorneys"
  | "practiceAreas"
  | "results"
  | "testimonials"
  | "faqs"
  | "firm";

/**
 * Edits to the public site. Each section replaces its defaults once saved;
 * missing sections fall back to lib/content and lib/config.
 */
export type ContentOverrides = {
  announcement?: AnnouncementContent;
  attorneys?: SiteAttorney[];
  practiceAreas?: PracticeArea[];
  results?: CaseResult[];
  resultsDisclaimer?: string;
  testimonials?: SiteTestimonial[];
  testimonialsDisclaimer?: string;
  faqs?: SiteFaq[];
  firm?: FirmProfile;
  published?: Partial<Record<ContentSection, { at: string; by: string }>>;
};

export type NotificationKey =
  | "newLead"
  | "urgentLead"
  | "consultationBooked"
  | "documentUploaded"
  | "invoicePaid"
  | "clientMessage";

export type Settings = {
  intake: {
    /** Practice areas offered on the consultation form. */
    areas: Record<PracticeAreaSlug, boolean>;
    /** Practice area → attorney user id for new website leads. */
    autoAssign: Partial<Record<PracticeAreaSlug, string>>;
    durations: Consultation["duration"][];
    /** "HH:mm" bounds for bookable slots. */
    slotStart: string;
    slotEnd: string;
    thankYouMessage: string;
  };
  notifications: Record<string, Record<NotificationKey, boolean>>;
  portal: {
    uploads: boolean;
    esign: boolean;
    payments: boolean;
    timeline: boolean;
    welcome: string;
    reminder: "never" | "daily" | "every3" | "weekly";
  };
  billing: {
    terms: 15 | 30;
    prefix: string;
    rates: Record<StaffRole, number>;
    trustName: string;
    methods: Record<PaymentMethod, boolean>;
  };
  published?: Partial<
    Record<
      "intake" | "notifications" | "portal" | "billing" | "team",
      { at: string; by: string }
    >
  >;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  practiceAreas: PracticeAreaSlug[];
  status: "active" | "invited" | "deactivated";
  lastActive?: string;
};

export type Profile = {
  title?: string;
  phone?: string;
  signature?: string;
  defaultTab: string;
  dateFormat: "MMM d, yyyy" | "MM/dd/yyyy" | "d MMM yyyy";
  compact: boolean;
};
