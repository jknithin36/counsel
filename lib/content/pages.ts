import { firm } from "@/lib/config/firm";

/** Site-wide defaults for titles, descriptions and social cards. */
export const siteMeta = {
  title: `${firm.name} | Attorneys at Law`,
  tagline: "Serious counsel for life’s hardest moments",
  description:
    "Personal injury, family law, estate planning, business law and criminal defense. Attorneys who listen, explain every step and fight for the right outcome. Free first consultation.",
};

/** "a Family Law" / "an Estate Planning" */
export const withArticle = (word: string) =>
  `${/^[aeiou]/i.test(word) ? "an" : "a"} ${word}`;

export const common = {
  home: "Home",
  breadcrumbLabel: "Breadcrumb",
  bookConsultation: "Book a Free Consultation",
  orCall: "Or call",
  orCallLower: "or call",
  learnMore: "Learn more",
  freeConsultationShort: "Free Consultation",
  callUs: `Call ${firm.phone}`,
};

export const ctaBand = {
  heading: (area?: string) =>
    area
      ? `Talk to ${withArticle(area)} attorney today`
      : "Talk to an attorney today",
};

export const practiceAreasPage = {
  title: "Practice Areas",
  metaTitle: "Practice Areas",
  intro:
    "Five focused practices, each led by attorneys who handle these cases every day.",
  filterLabel: "Filter practice areas",
  filters: [
    { key: "all", label: "All" },
    { key: "individuals", label: "For Individuals & Families" },
    { key: "business", label: "For Businesses" },
  ],
};

export const practiceAreaDetail = {
  eyebrow: "Practice Area",
  metaTitle: (title: string) => `${title} Attorneys`,
  sections: {
    cases: "Cases We Handle",
    howWeHelp: "How We Help",
    fees: "Fees & What to Expect",
    results: "Recent Results",
    faqs: "Frequently Asked Questions",
  },
  sidebar: {
    title: "Free consultation",
    body: (area: string) =>
      `Speak with ${withArticle(area)} attorney. No cost, no obligation.`,
    languages: "Available in English & Spanish",
    attorneysHeading: "Attorneys in this practice",
  },
};

export const attorneysPage = {
  title: "Our Attorneys",
  metaTitle: "Our Attorneys",
  intro: "Experienced, approachable and focused on one thing: your outcome.",
  areaFilterLabel: "Filter by practice area",
  languageFilterLabel: "Filter by language",
  all: "All",
  speaksSpanish: "Speaks Spanish",
  empty: "No attorneys match these filters.",
  clear: "Clear filters",
  languagesPrefix: "Speaks",
};

export const attorneyProfile = {
  book: (first: string) => `Book a consultation with ${first}`,
  about: (first: string) => `About ${first}`,
  focusAreas: "Focus Areas",
  notableResults: "Notable Results",
  experienceLabel: "Experience",
  experience: (years: number) => `${years} years of experience`,
  languages: "Languages",
  education: "Education",
  admissions: "Bar Admissions",
  memberships: "Memberships",
  otherAttorneys: "Other Attorneys",
};

export const notFoundPage = {
  title: "Page Not Found",
  intro:
    "The page you're looking for doesn't exist or has moved. Here are a few places to start instead.",
  links: [
    { label: "Home", href: "/" },
    { label: "Practice Areas", href: "/practice-areas" },
    { label: "Free Consultation", href: "/consultation" },
  ],
};

export const resultsPage = {
  title: "Case Results",
  metaTitle: "Case Results",
  intro:
    "A selection of recent outcomes across our practice areas. Every case is different, and these results show the preparation we bring to each one.",
  introNote: "Past results do not guarantee a similar outcome.",
  filterLabel: "Filter results by practice area",
  all: "All results",
  featured: "Largest outcomes",
  more: "More results",
  empty: "No results in this practice area yet.",
  disclaimerTitle: "About these results",
  disclaimer:
    "Case results depend on the specific facts and legal circumstances of each case. The results described here do not guarantee or predict a similar outcome in any future case. Amounts shown are gross recoveries before fees and costs.",
};

export const resourcesPage = {
  title: "Legal Guides",
  metaTitle: "Legal Guides",
  breadcrumb: "Resources",
  intro:
    "Plain-language answers to common legal questions, written by our attorneys. General information to help you understand your options.",
  filterLabel: "Filter guides by practice area",
  all: "All guides",
  featured: "Featured guide",
  empty: "No guides in this practice area yet.",
  read: "Read the guide",
};

export const guidePage = {
  onThisPage: "On this page",
  by: "By",
  related: "Related guides",
  disclaimerTitle: "General information only",
};

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export const faqPage = {
  title: "Frequently Asked Questions",
  metaTitle: "FAQ",
  breadcrumb: "FAQ",
  intro:
    "Straight answers about working with us, what it costs and how the process works.",
  categoriesLabel: "FAQ categories",
  stillHaveQuestions: "Still have questions?",
  contact: "Contact us",
};

export const contactPage = {
  title: "Contact Us",
  metaTitle: "Contact",
  intro:
    "Send us a message and we'll reply within one business day. For a new legal matter, the free consultation form is the fastest way to reach an attorney.",
  formHeading: "Send a message",
  consultationPrompt: "Have a new legal matter?",
  consultationLink: "Book a free consultation instead",
  officeHeading: "Our office",
  labels: {
    address: "Address",
    phone: "Phone",
    email: "Email",
    hours: "Hours",
  },
  mapLabel: "Map of our office location",
  fields: {
    name: "Full name",
    email: "Email",
    phone: "Phone (optional)",
    message: "How can we help?",
    consent:
      "I understand that sending this message does not create an attorney–client relationship.",
  },
  errors: {
    name: "Enter your name.",
    email: "Enter a valid email address.",
    phone: "Enter a 10-digit phone number, or leave it blank.",
    message: "Please write at least 10 characters.",
    consent: "Please confirm to send your message.",
  },
  submit: "Send message",
  sending: "Sending…",
  success: {
    title: "Message sent",
    body: (ref: string) =>
      `Thanks for reaching out. We'll reply within one business day. Your reference is ${ref}.`,
    another: "Send another message",
  },
};

export const portalHelpPage = {
  title: "Client Portal Help",
  metaTitle: "Client Portal Help",
  intro:
    "Everything you need to know about following your case online, from signing in for the first time to signing documents.",
  login: "Client Login",
  featuresHeading: "What you can do in the portal",
  features: [
    {
      icon: "timeline",
      title: "Follow your case",
      body: "See where your case stands, what's next and what has already been done.",
    },
    {
      icon: "documents",
      title: "Share documents",
      body: "Upload photos, records and letters securely, from your phone or computer.",
    },
    {
      icon: "sign",
      title: "Sign forms online",
      body: "Review and e-sign agreements and authorizations without printing anything.",
    },
    {
      icon: "messages",
      title: "Message your attorney",
      body: "Ask questions and get answers in one secure thread, instead of email chains.",
    },
    {
      icon: "billing",
      title: "View and pay invoices",
      body: "See statements, track payments and pay online when a bill is due.",
    },
    {
      icon: "appointments",
      title: "Manage appointments",
      body: "See upcoming meetings and court dates, with reminders before each one.",
    },
  ],
  stepsHeading: "Signing in for the first time",
  steps: [
    {
      title: "Check your email",
      body: "When you become a client, we send an invitation to the email address on file.",
    },
    {
      title: "Set your password",
      body: "Follow the link in the invitation and choose a secure password.",
    },
    {
      title: "Sign in any time",
      body: "Use the Client Login button at the top of any page to return to your portal.",
    },
  ],
  faqHeading: "Portal questions",
  helpPrompt: "Trouble signing in? Call us and we'll help.",
};

export const errorPage = {
  title: "Something Went Wrong",
  intro:
    "We couldn't load this page. Please try again, or call us if you need help right away.",
  retry: "Try again",
  home: "Back to home",
};

export const careersPage = {
  title: "Careers",
  intro: "We don't have any open positions right now. Please check back later.",
};
