import type { Faq } from "@/lib/content/faq";

export type PracticeAreaSlug =
  | "personal-injury"
  | "family-law"
  | "estate-planning"
  | "business-law"
  | "criminal-defense";

export type Audience = "individuals" | "business";

export type PracticeArea = {
  slug: PracticeAreaSlug;
  title: string;
  /** Longer description for the home page and index cards. */
  summary: string;
  /** Short line for the navbar dropdown. */
  navDescription: string;
  href: string;
  audience: Audience[];
  intro: string;
  commonCases: { title: string; body: string }[];
  howWeHelp: { title: string; body: string }[];
  whatToExpect: string;
  faqs: Faq[];
  /** Ids from lib/content/results.ts */
  relatedResults: string[];
  /** Slugs from lib/content/attorneys.ts */
  attorneys: string[];
};

const areas: Omit<PracticeArea, "href">[] = [
  {
    slug: "personal-injury",
    title: "Personal Injury",
    summary:
      "Car and truck accidents, slip and falls, and wrongful death. We handle the insurance companies so you can focus on recovering.",
    navDescription: "Accidents, injuries and wrongful death",
    audience: ["individuals"],
    intro:
      "An injury can upend your health, your work and your finances overnight. We take on the insurance companies, document every loss and fight for full compensation, while you focus on getting better.",
    commonCases: [
      {
        title: "Car accidents",
        body: "Collisions caused by distracted, impaired or careless drivers, including hit-and-run and uninsured motorist claims.",
      },
      {
        title: "Truck accidents",
        body: "Crashes involving commercial vehicles, where trucking companies and their insurers move quickly to limit what they pay.",
      },
      {
        title: "Slip and falls",
        body: "Injuries on unsafe property, from wet floors and broken stairs to poor lighting and icy walkways.",
      },
      {
        title: "Wrongful death",
        body: "Claims on behalf of families who have lost someone because of another person's negligence.",
      },
      {
        title: "Workplace injuries",
        body: "Injuries on the job where a third party, not just your employer, may be responsible.",
      },
      {
        title: "Pedestrian and bicycle accidents",
        body: "Serious injuries to people on foot or on a bike, often with complex questions about fault.",
      },
    ],
    howWeHelp: [
      {
        title: "Free case review",
        body: "We listen to what happened, review your documents and tell you honestly whether you have a claim.",
      },
      {
        title: "Investigation",
        body: "We gather records, photos, witness statements and expert opinions to prove what happened and what it cost you.",
      },
      {
        title: "Demand and negotiation",
        body: "We present a full demand to the insurer and negotiate firmly. Most cases settle at this stage.",
      },
      {
        title: "Trial, if needed",
        body: "If the offer isn't fair, we're ready to take your case to court and argue it in front of a jury.",
      },
    ],
    whatToExpect:
      "Personal injury cases are handled on contingency. You pay nothing upfront, and our fee is a percentage of what we recover for you. If we don't win, you don't owe us a fee.",
    faqs: [
      {
        question: "How much is my injury case worth?",
        answer:
          "It depends on your medical bills, lost income, the long-term effects of the injury and how clearly the other side was at fault. We'll give you a realistic range once we've reviewed your records.",
      },
      {
        question: "Should I talk to the other driver's insurance company?",
        answer:
          "It's best to let us handle that. Adjusters often ask for recorded statements early to look for reasons to reduce or deny a claim.",
      },
      {
        question: "How long do I have to file a claim?",
        answer:
          "Every state sets a deadline, called a statute of limitations, and some claims have shorter notice periods. Contact us as soon as possible so no deadline is missed.",
      },
      {
        question: "What if I was partly at fault?",
        answer:
          "In many cases you can still recover compensation, although the amount may be reduced by your share of fault. We'll explain how the rules apply to you.",
      },
    ],
    relatedResults: [
      "truck-collision",
      "workplace-wrongful-death",
      "slip-and-fall",
    ],
    attorneys: ["eleanor-calloway", "daniel-reyes", "james-whitaker"],
  },
  {
    slug: "family-law",
    title: "Family Law",
    summary:
      "Divorce, custody, child support and mediation, with a calm, practical approach to difficult transitions.",
    navDescription: "Divorce, custody and support",
    audience: ["individuals"],
    intro:
      "Family changes are personal, and the decisions you make now will shape the years ahead. We guide you through divorce, custody and support with clear advice, steady communication and a focus on what matters most to you.",
    commonCases: [
      {
        title: "Divorce",
        body: "Contested and uncontested divorces, including the division of homes, retirement accounts and businesses.",
      },
      {
        title: "Child custody",
        body: "Parenting plans and custody arrangements that put your children's stability first.",
      },
      {
        title: "Child support",
        body: "Calculating, establishing and modifying support so it reflects each parent's real situation.",
      },
      {
        title: "Spousal support",
        body: "Fair alimony arrangements, whether you will be paying or receiving support.",
      },
      {
        title: "Mediation",
        body: "Resolving disagreements outside of court, with less cost, less conflict and more control.",
      },
      {
        title: "Modifications",
        body: "Updating custody or support orders when jobs, homes or children's needs change.",
      },
    ],
    howWeHelp: [
      {
        title: "Understand your goals",
        body: "We start by learning what you want for yourself and your children, and what you're worried about.",
      },
      {
        title: "Plan the approach",
        body: "We explain your options, from mediation to litigation, with honest estimates of time and cost.",
      },
      {
        title: "Negotiate a fair agreement",
        body: "Most family matters settle. We negotiate firmly and keep the process as calm as possible.",
      },
      {
        title: "Represent you in court",
        body: "When agreement isn't possible, we prepare thoroughly and advocate for you in front of the judge.",
      },
    ],
    whatToExpect:
      "Family law matters are billed hourly or, for simpler matters like uncontested divorces, at a flat fee. You'll get a written estimate before we begin, and clear monthly statements in your client portal.",
    faqs: [
      {
        question: "How long does a divorce take?",
        answer:
          "An uncontested divorce can be finalized in a few months, depending on local waiting periods. Contested divorces take longer, often a year or more, depending on the issues involved.",
      },
      {
        question: "How is custody decided?",
        answer:
          "Courts focus on the best interests of the child, looking at stability, each parent's involvement and the child's needs. We help you present your role clearly and credibly.",
      },
      {
        question: "Do we have to go to court?",
        answer:
          "Not always. Many couples reach agreement through negotiation or mediation, and the court simply approves it.",
      },
      {
        question: "Can support be changed later?",
        answer:
          "Yes. If there's a significant change in income, living arrangements or a child's needs, support orders can be modified.",
      },
    ],
    relatedResults: ["contested-custody", "mediated-divorce"],
    attorneys: ["priya-raman"],
  },
  {
    slug: "estate-planning",
    title: "Estate Planning",
    summary:
      "Wills, trusts, powers of attorney and probate. Protect your family and make sure your wishes are followed.",
    navDescription: "Wills, trusts and probate",
    audience: ["individuals", "business"],
    intro:
      "A clear plan protects the people you love and spares them difficult decisions later. We prepare wills, trusts and powers of attorney that reflect your wishes, and guide families through probate when the time comes.",
    commonCases: [
      {
        title: "Wills",
        body: "Clear, valid wills that name guardians, direct your assets and reduce the chance of disputes.",
      },
      {
        title: "Living trusts",
        body: "Trusts that can avoid probate, protect privacy and manage assets for loved ones over time.",
      },
      {
        title: "Powers of attorney",
        body: "Financial powers of attorney so someone you trust can act for you if you can't.",
      },
      {
        title: "Healthcare directives",
        body: "Documents that state your medical wishes and name who can speak for you.",
      },
      {
        title: "Probate and administration",
        body: "Guiding executors and families through the court process, step by step.",
      },
      {
        title: "Business succession",
        body: "Plans that keep a family business running smoothly when ownership changes hands.",
      },
    ],
    howWeHelp: [
      {
        title: "Learn about your family",
        body: "We talk through your family, your assets and your concerns, in plain language.",
      },
      {
        title: "Design your plan",
        body: "We recommend the right mix of documents for your situation, without unnecessary extras.",
      },
      {
        title: "Sign and finalize",
        body: "We prepare your documents, walk you through each one and handle signing and witnessing.",
      },
      {
        title: "Keep it current",
        body: "We remind you to review your plan after major life events, so it never falls out of date.",
      },
    ],
    whatToExpect:
      "Most estate plans are prepared for a flat fee, quoted upfront after your consultation. Probate and trust administration are billed hourly or at a flat fee, depending on the size and complexity of the estate.",
    faqs: [
      {
        question: "Do I need a will or a trust?",
        answer:
          "It depends on your assets, your family and your goals. A will is enough for many people, while a trust can help avoid probate and manage assets over time. We'll recommend what fits.",
      },
      {
        question: "What happens if I die without a will?",
        answer:
          "State law decides who inherits your property, and a court appoints someone to manage your estate. The result may not match what you would have wanted.",
      },
      {
        question: "How often should I update my plan?",
        answer:
          "Review it every few years, and after any major change: marriage, divorce, a new child, a move or a significant change in assets.",
      },
      {
        question: "How long does probate take?",
        answer:
          "Simple estates may close in several months, while larger or contested estates can take a year or more. Good planning can shorten or avoid the process.",
      },
    ],
    relatedResults: ["contested-trust", "probate-completed"],
    attorneys: ["sofia-alvarez"],
  },
  {
    slug: "business-law",
    title: "Business Law",
    summary:
      "Formation, contracts, partnership disputes and ongoing counsel for growing companies.",
    navDescription: "Contracts, formation and disputes",
    audience: ["business"],
    intro:
      "Growing companies need a lawyer who understands the business, not just the law. We help founders and owners form companies, negotiate contracts and resolve disputes, and we stay on as steady counsel as you grow.",
    commonCases: [
      {
        title: "Business formation",
        body: "Choosing the right structure and setting up LLCs, corporations and partnerships correctly from day one.",
      },
      {
        title: "Contracts",
        body: "Drafting and reviewing customer, vendor, service and employment agreements.",
      },
      {
        title: "Partnership disputes",
        body: "Resolving disagreements between owners over control, money or the direction of the company.",
      },
      {
        title: "Operating agreements",
        body: "Clear rules for ownership, decisions, buyouts and what happens when a partner leaves.",
      },
      {
        title: "Commercial collections",
        body: "Recovering unpaid invoices and contract balances through negotiation, arbitration or court.",
      },
      {
        title: "Ongoing counsel",
        body: "A dependable legal partner for everyday questions, compliance and growth decisions.",
      },
    ],
    howWeHelp: [
      {
        title: "Understand the business",
        body: "We learn how your company works, who your partners are and where the risks sit.",
      },
      {
        title: "Spot the issues",
        body: "We review your documents and flag the problems that could cost you later.",
      },
      {
        title: "Draft and negotiate",
        body: "We draft clear agreements and negotiate terms that protect you and keep deals moving.",
      },
      {
        title: "Resolve disputes",
        body: "When conflicts arise, we push for a fast, practical resolution, and litigate when needed.",
      },
    ],
    whatToExpect:
      "Business matters are billed hourly or at a flat fee for defined projects like formations and contract reviews. Growing companies can also choose a monthly retainer for ongoing counsel.",
    faqs: [
      {
        question: "Should I form an LLC or a corporation?",
        answer:
          "It depends on how you plan to raise money, pay yourself and handle taxes. We'll walk through the trade-offs and recommend the structure that fits your plans.",
      },
      {
        question: "Can you review a contract before I sign it?",
        answer:
          "Yes. We review contracts quickly, explain the key terms in plain language and suggest changes that protect you.",
      },
      {
        question:
          "What can I do if my business partner isn't holding up their end?",
        answer:
          "Start with your operating or partnership agreement. We'll review your rights and options, from negotiation and mediation to a buyout or court action.",
      },
      {
        question: "Do you work with startups?",
        answer:
          "Yes. We help founders set up properly from the start, with formation, founder agreements and the first key contracts.",
      },
    ],
    relatedResults: ["contract-arbitration", "partnership-buyout"],
    attorneys: ["marcus-bell"],
  },
  {
    slug: "criminal-defense",
    title: "Criminal Defense",
    summary:
      "DUI, drug charges and felony defense. Immediate help when your freedom and future are on the line.",
    navDescription: "DUI, drug and felony charges",
    audience: ["individuals"],
    intro:
      "A criminal charge puts your freedom, your job and your reputation at risk. We act quickly, protect your rights from the first conversation and build the strongest possible defense.",
    commonCases: [
      {
        title: "DUI and DWI",
        body: "Challenging traffic stops, breath and blood tests, and license suspensions.",
      },
      {
        title: "Drug charges",
        body: "Possession, distribution and paraphernalia charges, including diversion programs where available.",
      },
      {
        title: "Felony defense",
        body: "Serious charges where experienced, aggressive defense can change the outcome.",
      },
      {
        title: "Assault and battery",
        body: "Defending against assault charges, including claims of self-defense.",
      },
      {
        title: "Theft and property crimes",
        body: "Shoplifting, burglary and fraud charges, from misdemeanors to felonies.",
      },
      {
        title: "Record sealing",
        body: "Helping eligible clients seal or expunge past records so they can move forward.",
      },
    ],
    howWeHelp: [
      {
        title: "Act immediately",
        body: "We step in right away to protect your rights and handle communication with law enforcement.",
      },
      {
        title: "Investigate the case",
        body: "We review the evidence, the police reports and how the stop or search was conducted.",
      },
      {
        title: "Challenge the evidence",
        body: "We file motions to suppress or dismiss when your rights were violated.",
      },
      {
        title: "Negotiate or go to trial",
        body: "We negotiate for reduced or dismissed charges, and we're ready to defend you at trial.",
      },
    ],
    whatToExpect:
      "Criminal defense is usually billed at a flat fee based on the charge and the stage of the case, so you know the cost upfront. We'll explain exactly what's included before you decide.",
    faqs: [
      {
        question: "What should I do if I've been arrested?",
        answer:
          "Stay calm, don't answer questions about the case, and ask for a lawyer. Then call us as soon as you can.",
      },
      {
        question: "Will I lose my license after a DUI?",
        answer:
          "Not necessarily. There are often deadlines to request a hearing, and we can challenge the suspension. Contact us quickly so those deadlines aren't missed.",
      },
      {
        question: "Can charges be dropped before trial?",
        answer:
          "Yes. Charges can be reduced or dismissed when evidence is weak or was obtained improperly, or through negotiation with the prosecutor.",
      },
      {
        question: "Can my record be sealed?",
        answer:
          "Many past charges and convictions can be sealed or expunged after a waiting period. We'll review your record and tell you what's possible.",
      },
    ],
    relatedResults: ["felony-dui-dismissed", "drug-charges-reduced"],
    attorneys: ["daniel-reyes"],
  },
];

export const practiceAreas: PracticeArea[] = areas.map((area) => ({
  ...area,
  href: `/practice-areas/${area.slug}`,
}));

export function getPracticeArea(slug: string) {
  return practiceAreas.find((area) => area.slug === slug);
}
