import { practiceAreas } from "@/lib/content/practice-areas";

export type NavLink = {
  label: string;
  href: string;
};

export type NavMenuItem = {
  title: string;
  description: string;
  href: string;
};

export type NavMenu = {
  label: string;
  items: NavMenuItem[];
  footer?: NavLink;
};

export type NavEntry =
  | ({ type: "link" } & NavLink)
  | ({ type: "menu" } & NavMenu);

export const mainNav: NavEntry[] = [
  {
    type: "menu",
    label: "Practice Areas",
    items: practiceAreas.map(({ title, navDescription, href }) => ({
      title,
      description: navDescription,
      href,
    })),
    footer: { label: "View all practice areas", href: "/practice-areas" },
  },
  { type: "link", label: "Attorneys", href: "/attorneys" },
  { type: "link", label: "Results", href: "/results" },
  {
    type: "menu",
    label: "Resources",
    items: [
      {
        title: "Legal Guides",
        description: "Plain-language answers to common questions",
        href: "/resources",
      },
      { title: "FAQ", description: "What clients ask us most", href: "/faq" },
      {
        title: "Client Portal Help",
        description: "Signing in, documents and messages",
        href: "/portal-help",
      },
    ],
  },
  { type: "link", label: "About", href: "/about" },
];

export const navActions = {
  login: { label: "Client Login", href: "/login" },
  consultation: { label: "Free Consultation", href: "/consultation" },
} satisfies Record<string, NavLink>;

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Practice Areas",
    links: [
      ...practiceAreas.map(({ title, href }) => ({ label: title, href })),
      { label: "All practice areas", href: "/practice-areas" },
    ],
  },
  {
    heading: "Firm",
    links: [
      { label: "About", href: "/about" },
      { label: "Attorneys", href: "/attorneys" },
      { label: "Results", href: "/results" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Legal Guides", href: "/resources" },
      { label: "FAQ", href: "/faq" },
      { label: "Client Portal Help", href: "/portal-help" },
      { label: "Client Login", href: "/login" },
    ],
  },
];

/** Placeholder profiles: swap the hrefs for the firm's real pages. */
export const socialLinks = [
  { network: "linkedin", label: "LinkedIn", href: "#" },
  { network: "facebook", label: "Facebook", href: "#" },
  { network: "youtube", label: "YouTube", href: "#" },
] as const;

export const legalLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Legal Disclaimer", href: "/disclaimer" },
  { label: "Attorney Advertising", href: "/attorney-advertising" },
];

export const footerCopy = {
  connectHeading: "Connect",
  rights: "All rights reserved.",
  disclaimer:
    "The information on this website is for general informational purposes only and is not legal advice. Contacting us does not create an attorney–client relationship. Prior results do not guarantee a similar outcome.",
};
