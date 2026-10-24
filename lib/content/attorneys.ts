import {
  type PracticeAreaSlug,
  practiceAreas,
} from "@/lib/content/practice-areas";

/** Fictional attorneys for the demo firm. */
export type Attorney = {
  slug: string;
  name: string;
  /** e.g. "Founding Partner", "Partner", "Associate". */
  title: string;
  practiceAreas: PracticeAreaSlug[];
  languages: string[];
  /** Two-sentence summary for cards and metadata. */
  bio: string;
  longBio: string[];
  focusAreas: string[];
  education: { degree: string; school: string; year: number }[];
  admissions: string[];
  memberships: string[];
  /** Ids from lib/content/results.ts */
  notableResults: string[];
  quote: string;
  email: string;
  yearsOfExperience: number;
  /** Optional portrait under /public; a textured placeholder is used otherwise. */
  image?: string;
  featured?: boolean;
};

export const attorneys: Attorney[] = [
  {
    slug: "eleanor-calloway",
    name: "Eleanor Calloway",
    title: "Founding Partner",
    practiceAreas: ["personal-injury"],
    languages: ["English"],
    bio: "Eleanor has represented injured people and their families for more than two decades, from first call to final verdict. She is known for meticulous trial preparation and for keeping clients informed at every step.",
    longBio: [
      "Eleanor founded the firm with a simple belief: people who have been hurt deserve a lawyer who treats their case like it matters, because it does. For more than two decades she has represented injured people and grieving families against insurance companies and large corporations.",
      "She is known for meticulous preparation. Eleanor builds every case as if it will go to trial, working with medical experts, accident reconstruction specialists and economists to show the full cost of an injury. That preparation is often what convinces the other side to make a fair offer.",
      "Outside the office, Eleanor mentors new attorneys and speaks to community groups about road safety. Clients describe her as calm, direct and relentless on their behalf.",
    ],
    focusAreas: [
      "Truck and commercial vehicle accidents",
      "Wrongful death claims",
      "Catastrophic and spinal injuries",
      "Trial preparation and jury trials",
    ],
    education: [
      { degree: "J.D.", school: "State University School of Law", year: 2002 },
      {
        degree: "B.A., Political Science",
        school: "Central State College",
        year: 1999,
      },
    ],
    admissions: ["State Bar", "U.S. District Court", "U.S. Court of Appeals"],
    memberships: ["State Trial Lawyers Association", "County Bar Association"],
    notableResults: ["truck-collision", "workplace-wrongful-death"],
    quote:
      "Every case gets prepared as if it's going to trial, because that's how you get a fair offer.",
    email: "eleanor@example.com",
    yearsOfExperience: 24,
    image: "/images/attorneys/eleanor-calloway.jpg",
    featured: true,
  },
  {
    slug: "daniel-reyes",
    name: "Daniel Reyes",
    title: "Founding Partner",
    practiceAreas: ["criminal-defense", "personal-injury"],
    languages: ["English", "Spanish"],
    bio: "Daniel is a former public defender who now leads the firm's criminal defense practice and handles serious injury cases. He works directly with clients in English and Spanish and is in court most weeks.",
    longBio: [
      "Daniel began his career as a public defender, where he learned how quickly a single charge can change someone's life. He co-founded the firm to give every client the kind of attention he wished more people could afford.",
      "Today he leads the criminal defense practice, handling DUI, drug and felony cases, and works alongside Eleanor on serious injury claims. He is in court most weeks and is known for finding the weak points in the other side's evidence.",
      "Daniel grew up speaking Spanish at home and works directly with Spanish-speaking clients, without interpreters, so nothing gets lost in translation.",
    ],
    focusAreas: [
      "DUI and DWI defense",
      "Drug charges and diversion programs",
      "Felony defense and trials",
      "Serious injury claims",
    ],
    education: [
      {
        degree: "J.D.",
        school: "Westbrook University School of Law",
        year: 2004,
      },
      { degree: "B.A., History", school: "State University", year: 2001 },
    ],
    admissions: ["State Bar", "U.S. District Court"],
    memberships: [
      "State Criminal Defense Lawyers Association",
      "County Bar Association",
    ],
    notableResults: ["felony-dui-dismissed", "drug-charges-reduced"],
    quote:
      "The first conversation matters most. I want clients to know their rights before anything else happens.",
    email: "daniel@example.com",
    yearsOfExperience: 22,
    image: "/images/attorneys/daniel-reyes.jpg",
    featured: true,
  },
  {
    slug: "priya-raman",
    name: "Priya Raman",
    title: "Partner",
    practiceAreas: ["family-law"],
    languages: ["English"],
    bio: "Priya guides clients through divorce, custody and support matters with a steady, practical approach. She is a trained mediator and resolves most cases without a contested trial.",
    longBio: [
      "Priya leads the firm's family law practice. She guides clients through divorce, custody and support with a steady, practical approach that keeps the focus on what matters most, especially when children are involved.",
      "As a trained mediator, she resolves most cases through negotiation, saving her clients time, money and stress. When a fair agreement isn't possible, she is a thorough, well-prepared advocate in court.",
      "Clients appreciate her honesty about what to expect and her availability when questions come up, often at the hardest moments of their lives.",
    ],
    focusAreas: [
      "Contested and uncontested divorce",
      "Child custody and parenting plans",
      "Child and spousal support",
      "Family mediation",
    ],
    education: [
      { degree: "J.D.", school: "Lakeview School of Law", year: 2011 },
      {
        degree: "B.S., Psychology",
        school: "Northern State University",
        year: 2008,
      },
    ],
    admissions: ["State Bar", "U.S. District Court"],
    memberships: ["State Family Law Association", "County Bar Association"],
    notableResults: ["contested-custody", "mediated-divorce"],
    quote:
      "Most families don't need a fight. They need a fair plan they can live with.",
    email: "priya@example.com",
    yearsOfExperience: 15,
    image: "/images/attorneys/priya-raman.jpg",
    featured: true,
  },
  {
    slug: "marcus-bell",
    name: "Marcus Bell",
    title: "Partner",
    practiceAreas: ["business-law"],
    languages: ["English"],
    bio: "Marcus advises founders and growing companies on formation, contracts and partnership disputes. Before joining the firm, he spent eight years as in-house counsel at a regional manufacturer.",
    longBio: [
      "Marcus advises founders, family businesses and growing companies on formation, contracts and partnership disputes. He understands that legal advice has to fit how a business actually runs.",
      "Before joining the firm, he spent eight years as in-house counsel at a regional manufacturer, negotiating supplier agreements and resolving disputes. That experience shapes his practical, business-first approach.",
      "Many of his clients stay with him for years, calling him for everything from a quick contract question to a major ownership change.",
    ],
    focusAreas: [
      "Business formation and structure",
      "Contract drafting and review",
      "Partnership and shareholder disputes",
      "Ongoing general counsel",
    ],
    education: [
      { degree: "J.D.", school: "State University School of Law", year: 2009 },
      { degree: "B.B.A., Finance", school: "Riverside College", year: 2006 },
    ],
    admissions: ["State Bar", "U.S. District Court"],
    memberships: ["State Business Law Section", "County Bar Association"],
    notableResults: ["contract-arbitration", "partnership-buyout"],
    quote:
      "Good contracts prevent most disputes. Clear advice handles the rest.",
    email: "marcus@example.com",
    yearsOfExperience: 17,
    image: "/images/attorneys/marcus-bell.jpg",
    featured: true,
  },
  {
    slug: "sofia-alvarez",
    name: "Sofia Alvarez",
    title: "Associate",
    practiceAreas: ["estate-planning"],
    languages: ["English", "Spanish"],
    bio: "Sofia helps families put clear wills, trusts and powers of attorney in place, and guides them through probate when the time comes. She makes complex documents easy to understand in English or Spanish.",
    longBio: [
      "Sofia helps families put clear wills, trusts and powers of attorney in place, and guides executors through probate when the time comes.",
      "She believes estate planning should feel reassuring, not overwhelming. Sofia explains every document in plain language, in English or Spanish, so clients understand exactly what they're signing and why.",
      "She also works with family business owners on succession plans, making sure the business can continue smoothly when ownership changes hands.",
    ],
    focusAreas: [
      "Wills and living trusts",
      "Powers of attorney and healthcare directives",
      "Probate and estate administration",
      "Family business succession",
    ],
    education: [
      {
        degree: "J.D.",
        school: "Westbrook University School of Law",
        year: 2018,
      },
      { degree: "B.A., Economics", school: "State University", year: 2015 },
    ],
    admissions: ["State Bar"],
    memberships: ["State Estate Planning Council", "County Bar Association"],
    notableResults: ["contested-trust", "probate-completed"],
    quote:
      "A good plan is one your family can actually understand when they need it.",
    email: "sofia@example.com",
    yearsOfExperience: 7,
    image: "/images/attorneys/sofia-alvarez.jpg",
  },
  {
    slug: "james-whitaker",
    name: "James Whitaker",
    title: "Associate",
    practiceAreas: ["personal-injury"],
    languages: ["English"],
    bio: "James works alongside Eleanor on personal injury cases, from gathering evidence to negotiating with insurers. He is the first point of contact for many new clients and returns every call the same day.",
    longBio: [
      "James works alongside Eleanor on personal injury cases, from gathering evidence in the first days after an accident to negotiating with insurers.",
      "He is often the first attorney new clients meet, and he makes a point of returning every call the same day. James keeps clients updated through the client portal, so they always know where their case stands.",
      "Before law school, James worked as an insurance claims adjuster, which gives him a clear view of how insurers evaluate and try to minimize claims.",
    ],
    focusAreas: [
      "Car accident claims",
      "Slip and fall injuries",
      "Insurance negotiations",
      "Medical records and damages",
    ],
    education: [
      { degree: "J.D.", school: "Lakeview School of Law", year: 2020 },
      {
        degree: "B.A., Communications",
        school: "Central State College",
        year: 2016,
      },
    ],
    admissions: ["State Bar", "U.S. District Court"],
    memberships: ["State Trial Lawyers Association", "County Bar Association"],
    notableResults: ["slip-and-fall"],
    quote:
      "Clients shouldn't have to chase their lawyer for an update. I call them first.",
    email: "james@example.com",
    yearsOfExperience: 5,
    image: "/images/attorneys/james-whitaker.jpg",
  },
];

export const featuredAttorneys = attorneys.filter((a) => a.featured);

export function getAttorney(slug: string) {
  return attorneys.find((a) => a.slug === slug);
}

export function attorneyInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export function firstName(name: string) {
  return name.split(" ")[0];
}

export function primaryPracticeArea(attorney: Attorney) {
  return practiceAreas.find((area) => area.slug === attorney.practiceAreas[0]);
}
