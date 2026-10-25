import type { TextureTone } from "@/components/ui/texture-panel";
import { firm } from "@/lib/config/firm";

export const hero = {
  headline: ["Serious Counsel", "for Life's Hardest", "Moments"],
  subtext:
    "When the stakes are personal, you need attorneys who listen, explain every step, and fight for the right outcome. Your first consultation is free.",
  primaryCta: { label: "Book a Free Consultation", href: "/consultation" },
  secondaryCta: { label: "Or call" },
  media: {
    texture: "/images/hero-texture.webp",
  },
};

/** Copy for the decorative client portal preview inside the hero card. */
export const portalPreview = {
  label: "Preview of the client portal",
  brand: "Counsel",
  nav: [
    { key: "overview", label: "Overview", active: true },
    { key: "case", label: "My Case" },
    { key: "documents", label: "Documents" },
    { key: "messages", label: "Messages", badge: "2" },
    { key: "billing", label: "Billing" },
    { key: "appointments", label: "Appointments" },
  ],
  user: { initials: "MD", name: "Maria D.", role: "Client" },
  title: "Hello, Maria",
  actions: { message: "Message your team", upload: "Upload document" },
  notice: {
    text: "2 documents are waiting for your signature.",
    link: "Review",
  },
  stats: [
    {
      value: "Negotiation",
      label: "Current stage",
      detail: "On track",
      status: "positive",
    },
    {
      value: "Nov 6",
      label: "Next appointment",
      detail: "Video call · 10:00 AM",
    },
    { value: "$0.00", label: "Balance due", detail: "Contingency case" },
  ],
  timeline: {
    title: "Case timeline",
    steps: [
      { label: "Intake", meta: "Aug 12", state: "done" },
      { label: "Investigation", meta: "Aug 28", state: "done" },
      { label: "Demand sent", meta: "Sep 30", state: "done" },
      { label: "Negotiation", meta: "In progress", state: "current" },
      { label: "Resolution", meta: "Upcoming", state: "upcoming" },
    ],
  },
  message: {
    title: "Latest message",
    initials: "DR",
    author: "Daniel Reyes",
    role: "Attorney",
    time: "2h ago",
    body: "The insurer responded to our demand letter. Let's review their offer together on Thursday.",
    replyPlaceholder: "Write a reply…",
  },
} as const;

export const trustStrip = {
  heading: "Trusted by 2,400+ Families and Businesses",
  items: [
    { value: "25", label: "Years in practice" },
    { value: "4.9/5", label: "From 600+ client reviews" },
    { value: "$48M+", label: "Recovered for clients" },
    { value: "No fee", label: "Unless we win*" },
    { value: "EN / ES", label: "Bilingual attorneys" },
  ],
  footnote:
    "*Contingency fees apply to personal injury cases only. Past results do not guarantee future outcomes.",
};

type StatusTone = "positive" | "warning" | "neutral";

export const twoPaths = {
  heading: "Legal Help for Every Part of Life",
  subtext:
    "Whether you're facing a personal crisis or protecting your business, you'll work directly with an attorney who knows your case.",
  cards: [
    {
      key: "individuals",
      title: "For Individuals & Families",
      body: "Accidents, divorce, custody, wills and criminal charges, handled by attorneys who return your calls and explain every step.",
      cta: {
        label: "Explore Personal Legal Services",
        href: "/practice-areas?for=individuals",
      },
      tone: "charcoal" as TextureTone,
    },
    {
      key: "business",
      title: "For Businesses",
      body: "Contracts, partnership disputes, formation and compliance for growing companies that need a steady legal partner.",
      cta: {
        label: "Explore Business Legal Services",
        href: "/practice-areas?for=business",
      },
      tone: "olive" as TextureTone,
    },
  ],
  documentsPreview: {
    label: "Preview of document requests",
    title: "Documents",
    tabs: ["Requested (3)", "Uploaded", "Signed"],
    rows: [
      { name: "Police report", status: "Uploaded ✓", tone: "positive" },
      { name: "Medical records: Sept", status: "Needed", tone: "warning" },
      { name: "Insurance letter", status: "Needed", tone: "warning" },
      { name: "Retainer agreement", status: "Signed ✓", tone: "neutral" },
    ] satisfies { name: string; status: string; tone: StatusTone }[],
  },
  matterPreview: {
    label: "Preview of a business matter overview",
    matter: "Matter #2026-0142",
    title: "Northfield Supply Co. — Partnership Agreement",
    tabs: ["Overview", "Tasks", "Documents", "Billing"],
    stats: [
      { value: "4", label: "Open tasks" },
      { value: "Oct 31", label: "Next deadline" },
    ],
    tasks: [
      { title: "Review revised operating agreement", meta: "Due Oct 28" },
      { title: "Draft buy-sell provisions", meta: "In progress" },
      { title: "Client call: equity split", meta: "Scheduled" },
    ],
  },
};

export const practiceAreasSection = {
  heading: "Focused Practice. Proven Results.",
  subtext:
    "Five practice areas, each led by attorneys who handle these cases every day.",
  linkLabel: "Learn more",
  previews: {
    "personal-injury": {
      label: "Preview of a personal injury case summary",
      eyebrow: "Case summary",
      title: "Delgado v. Ridgeline Freight",
      status: "Negotiation",
      rows: [
        { label: "Medical expenses", value: "$84,200" },
        { label: "Lost wages", value: "$31,500" },
        { label: "Demand sent", value: "$425,000" },
        { label: "Latest offer", value: "$210,000" },
      ],
      progress: { label: "Settlement progress", value: 60 },
    },
    "family-law": {
      label: "Preview of a parenting schedule",
      eyebrow: "Parenting schedule",
      title: "November 2026",
      year: 2026,
      month: 10, // 0-based: November
      weekdays: ["S", "M", "T", "W", "T", "F", "S"],
      parents: { a: "Parent A", b: "Parent B" },
      note: "Holiday schedule: Thanksgiving with Parent B",
    },
    "estate-planning": {
      label: "Preview of an estate plan checklist",
      eyebrow: "Estate plan checklist",
      title: "The Okafor Family Plan",
      progress: "3 of 5 complete",
      items: [
        { label: "Last will", state: "done" },
        { label: "Revocable living trust", state: "done" },
        { label: "Healthcare directive", state: "done" },
        {
          label: "Financial power of attorney",
          state: "pending",
          meta: "Pending signature",
        },
        {
          label: "Beneficiary review",
          state: "scheduled",
          meta: "Scheduled Nov 12",
        },
      ],
    },
    "business-law": {
      label: "Preview of a contract review",
      eyebrow: "Contract review",
      title: "Master Services Agreement v3.docx",
      summary: "3 flagged clauses",
      clauses: [
        {
          severity: "High",
          title: "Unlimited liability",
          note: "§ 9.2 · No cap on indemnification",
        },
        {
          severity: "Medium",
          title: "Auto-renewal terms",
          note: "§ 4.1 · Renews for 24 months by default",
        },
        {
          severity: "Low",
          title: "Notice period",
          note: "§ 12.3 · 15 days, below the usual 30",
        },
      ],
      footer: "Reviewed by Marcus Bell",
    },
    "criminal-defense": {
      label: "Preview of a criminal defense case timeline",
      eyebrow: "Case timeline",
      title: "Case No. 2026-CR-0417",
      steps: [
        { label: "Arrest", meta: "Sep 2", state: "done" },
        { label: "Arraignment", meta: "Sep 18 ✓", state: "done" },
        { label: "Discovery", meta: "In progress", state: "current" },
        { label: "Motion hearing", meta: "Nov 14", state: "upcoming" },
        { label: "Trial", meta: "TBD", state: "upcoming" },
      ],
    },
  },
} as const;

export const caseResultsSection = {
  eyebrow: "Case Results",
  heading: "Results That Speak for Themselves",
  subtext:
    "A few recent outcomes for our clients. Every case is different, but our preparation never is.",
  cta: { label: "View all results", href: "/results" },
  disclaimer:
    "Past results do not guarantee a similar outcome. Each case depends on its own facts.",
};

export const whyUs = {
  heading: `Why Clients Choose ${firm.name}`,
  link: { label: "Meet the attorneys", href: "/attorneys" },
  reasons: [
    {
      title: "You'll talk to an attorney, not a call center",
      body: "Your lawyer knows your case, answers your questions directly, and calls you back the same day.",
      icon: "call",
    },
    {
      title: "Clear updates, always",
      body: "Track every step in our secure client portal: timeline, documents, messages and billing in one place.",
      icon: "dashboard",
    },
    {
      title: "No fee unless we win",
      body: "Personal injury clients pay nothing upfront. For other matters, you'll know the cost before we start.",
      icon: "fee",
    },
    {
      title: "Bilingual and accessible",
      body: "Full service in English and Spanish, with in-person, phone and video meetings that fit your schedule.",
      icon: "languages",
    },
  ],
} as const;

export const attorneysSection = {
  heading: "Meet the Attorneys",
  subtext: "Experienced, approachable and focused on your outcome.",
  cta: { label: "View all attorneys", href: "/attorneys" },
};

export const howItWorks = {
  heading: "Getting Started Is Simple",
  steps: [
    {
      number: "01",
      title: "Free consultation",
      body: "Tell us what happened by phone, video or in person. There's no cost and no obligation.",
    },
    {
      number: "02",
      title: "Case review",
      body: "We explain your options, the likely timeline and the costs in plain English, before you decide anything.",
    },
    {
      number: "03",
      title: "We get to work",
      body: "Your attorney handles the details, and you follow every step in your client portal.",
    },
  ],
  cta: { label: "Book a Free Consultation", href: "/consultation" },
};

export const portalTeaser = {
  eyebrow: "Client Portal",
  heading: "Know Where Your Case Stands, Anytime",
  body: "See your case timeline, upload documents, sign forms, message your attorney and pay invoices, all in one secure place.",
  features: [
    "Real-time case timeline",
    "Secure document upload",
    "E-signatures",
    "Direct messages with your attorney",
    "Online payments",
  ],
  primaryCta: { label: "Client Login", href: "/login" },
  linkCta: { label: "How the portal works", href: "/portal-help" },
  messages: {
    label: "Preview of portal messages",
    title: "Messages",
    threads: [
      {
        initials: "DR",
        name: "Daniel Reyes",
        preview: "Great news. The other side agreed to…",
        time: "10:24 AM",
      },
      {
        initials: "SA",
        name: "Sofia Alvarez",
        preview: "I've uploaded the draft trust for review.",
        time: "Yesterday",
      },
      {
        initials: "CR",
        name: firm.name,
        preview: "Your October statement is ready.",
        time: "Oct 28",
      },
    ],
    open: {
      author: "Daniel Reyes",
      body: "Great news. The other side agreed to mediation on Nov 14.",
    },
  },
  signature: {
    label: "Preview of signing a document in the portal",
    title: "Sign document",
    file: "Medical Records Authorization.pdf",
    signer: "Maria Delgado",
    signatureLabel: "Signature",
    action: "Sign & submit",
  },
};

export const testimonials = {
  label: "Client testimonials",
  slideLabel: (n: number, total: number) => `Testimonial ${n} of ${total}`,
  barLabel: (n: number) => `Show testimonial ${n}`,
  representedBy: "Represented by",
  disclaimer:
    "Testimonials reflect individual experiences and do not guarantee similar outcomes.",
  items: [
    {
      quote:
        "I was terrified after the accident. Eleanor's team handled everything and kept me updated every single week. I never once had to chase anyone for an answer.",
      name: "Maria D.",
      context: "Personal Injury Client",
      attorney: "eleanor-calloway",
    },
    {
      quote:
        "Priya made the hardest year of my life manageable. She was calm, honest and always prepared, and she never let me feel alone in the process.",
      name: "Kevin T.",
      context: "Family Law Client",
      attorney: "priya-raman",
    },
    {
      quote:
        "Marcus caught problems in our partnership agreement that would have cost us dearly. He's been our go-to counsel ever since.",
      name: "Angela R.",
      context: "Business Owner",
      attorney: "marcus-bell",
    },
  ],
};

export const faqSection = {
  heading: "Questions, Answered",
  subtext: "Can't find what you're looking for? Call us at",
  link: { label: "View all FAQs", href: "/faq" },
};

export const closingCta = {
  headline: "Talk to an Attorney Today. It's Free.",
  cta: { label: "Book a Free Consultation", href: "/consultation" },
  callPrefix: "or call",
};
