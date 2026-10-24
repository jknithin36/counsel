import type { PracticeAreaSlug } from "@/lib/content/practice-areas";

export type GuideSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  practiceArea: PracticeAreaSlug;
  readTime: string;
  /** ISO date */
  publishedAt: string;
  /** Attorney slug */
  author: string;
  sections: GuideSection[];
};

export const guideDisclaimer =
  "This guide is general information, not legal advice. Laws vary by state and every situation is different. Talk to an attorney about your specific circumstances.";

export const guides: Guide[] = [
  {
    slug: "first-72-hours-after-a-car-accident",
    title: "What to Do in the First 72 Hours After a Car Accident",
    excerpt:
      "The steps you take in the first few days can protect your health and your claim. Here's a simple checklist.",
    practiceArea: "personal-injury",
    readTime: "6 min read",
    publishedAt: "2026-09-18",
    author: "james-whitaker",
    sections: [
      {
        id: "at-the-scene",
        heading: "At the scene",
        paragraphs: [
          "Your first priority is safety. Move to a safe place if you can, turn on your hazard lights and call emergency services if anyone is hurt or the vehicles are blocking traffic.",
        ],
        bullets: [
          "Exchange names, phone numbers, license plates and insurance details with the other driver.",
          "Take photos of the vehicles, the road, traffic signs and any visible injuries.",
          "Get contact information from anyone who saw the accident.",
          "Avoid discussing who was at fault. Stick to the facts.",
        ],
      },
      {
        id: "get-medical-care",
        heading: "Get medical care, even if you feel fine",
        paragraphs: [
          "Some injuries, including concussions and soft-tissue injuries, don't show symptoms right away. A same-day or next-day medical visit protects your health and creates a record that links your injuries to the accident.",
          "Follow your doctor's treatment plan and keep every bill, receipt and note. Gaps in treatment are one of the first things an insurance company will point to.",
        ],
      },
      {
        id: "report-the-accident",
        heading: "Report the accident",
        paragraphs: [
          "Make sure a police report is filed, and ask how to get a copy. Notify your own insurance company promptly, as most policies require.",
        ],
      },
      {
        id: "be-careful-with-insurers",
        heading: "Be careful with the other driver's insurer",
        paragraphs: [
          "The other driver's insurance adjuster may call quickly and sound helpful. Their job is to limit what the company pays. You don't have to give a recorded statement, and it's wise to speak with an attorney before you do.",
        ],
        bullets: [
          "Don't sign medical releases or settlement papers without advice.",
          "Don't post about the accident or your injuries on social media.",
          "Keep a simple daily journal of your pain, appointments and missed work.",
        ],
      },
      {
        id: "talk-to-an-attorney",
        heading: "Talk to an attorney early",
        paragraphs: [
          "Evidence fades quickly: skid marks disappear, footage is recorded over, and witnesses forget. An early consultation helps preserve what matters, and most injury attorneys offer it free.",
        ],
      },
    ],
  },
  {
    slug: "how-child-custody-decisions-are-made",
    title: "How Child Custody Decisions Are Made",
    excerpt:
      "Courts focus on one question: what's best for the child. Here's what that means in practice.",
    practiceArea: "family-law",
    readTime: "7 min read",
    publishedAt: "2026-08-27",
    author: "priya-raman",
    sections: [
      {
        id: "best-interests",
        heading: "The best-interests standard",
        paragraphs: [
          "In nearly every state, custody decisions are guided by the best interests of the child. The court isn't deciding which parent is better. It's deciding which arrangement gives the child the most stability, safety and support.",
        ],
      },
      {
        id: "types-of-custody",
        heading: "Legal and physical custody",
        paragraphs: [
          "Legal custody is the right to make major decisions about a child's education, health care and upbringing. Physical custody is about where the child lives day to day. Either can be shared or awarded mainly to one parent.",
        ],
      },
      {
        id: "what-courts-consider",
        heading: "What courts look at",
        paragraphs: [
          "Judges typically consider a range of factors, including:",
        ],
        bullets: [
          "Each parent's role in the child's daily life so far.",
          "The child's ties to school, community and siblings.",
          "Each parent's ability to support the child's relationship with the other parent.",
          "Any history of family violence or substance abuse.",
          "In some cases, the child's own preferences, depending on age and maturity.",
        ],
      },
      {
        id: "parenting-plans",
        heading: "Parenting plans",
        paragraphs: [
          "Most custody cases end with a written parenting plan: a schedule for regular time, holidays and school breaks, plus rules for communication and decision-making. Plans that parents agree on are usually approved by the court and tend to work better long term.",
        ],
      },
      {
        id: "preparing",
        heading: "How to prepare",
        paragraphs: [
          "Keep a calendar of your time with your child, stay involved in school and medical appointments, and keep communication with the other parent respectful and in writing where possible. Courts notice which parent puts the child first.",
        ],
      },
    ],
  },
  {
    slug: "wills-vs-trusts",
    title: "Wills vs. Trusts: Which Is Right for Your Family?",
    excerpt:
      "Both pass your property to the people you choose. The difference is in how, when and how publicly.",
    practiceArea: "estate-planning",
    readTime: "6 min read",
    publishedAt: "2026-08-04",
    author: "sofia-alvarez",
    sections: [
      {
        id: "what-a-will-does",
        heading: "What a will does",
        paragraphs: [
          "A will names who receives your property, who will manage your estate, and who will care for minor children. It's simple and affordable, but it generally goes through probate, a court process that can take months and is part of the public record.",
        ],
      },
      {
        id: "what-a-trust-does",
        heading: "What a living trust does",
        paragraphs: [
          "A revocable living trust holds your assets during your lifetime, with you in control. When you die, your chosen successor trustee distributes them, usually without probate and privately.",
        ],
      },
      {
        id: "comparing",
        heading: "Comparing the two",
        paragraphs: ["Consider a trust if any of these apply to you:"],
        bullets: [
          "You own real estate, especially in more than one state.",
          "You want to keep your estate private.",
          "You want to manage how and when children or other heirs receive money.",
          "You want a plan for managing your assets if you become unable to.",
        ],
      },
      {
        id: "most-people-need-both",
        heading: "Most plans include more than one document",
        paragraphs: [
          "Even with a trust, you'll usually want a short 'pour-over' will, a financial power of attorney and a healthcare directive. Together they cover your property, your finances and your medical wishes.",
        ],
      },
    ],
  },
  {
    slug: "partnership-agreement-clauses",
    title: "5 Clauses Every Partnership Agreement Needs",
    excerpt:
      "Most partnership disputes come down to something the agreement didn't cover. Start with these five.",
    practiceArea: "business-law",
    readTime: "5 min read",
    publishedAt: "2026-07-15",
    author: "marcus-bell",
    sections: [
      {
        id: "ownership-and-contributions",
        heading: "1. Ownership and contributions",
        paragraphs: [
          "Spell out who owns what percentage, what each partner contributed (money, property or work) and what happens if more money is needed later.",
        ],
      },
      {
        id: "decision-making",
        heading: "2. Decision-making",
        paragraphs: [
          "Decide which choices need a simple majority, which need everyone's approval, and who handles day-to-day management.",
        ],
      },
      {
        id: "profits-and-pay",
        heading: "3. Profits, losses and pay",
        paragraphs: [
          "Explain how profits are shared, when distributions are made, and whether partners who work in the business receive a salary.",
        ],
      },
      {
        id: "buy-sell",
        heading: "4. Buy-sell provisions",
        paragraphs: [
          "This is the clause partners most often skip and most often regret. It covers what happens when a partner wants to leave, retires, becomes disabled or dies:",
        ],
        bullets: [
          "Who can buy the departing partner's share.",
          "How the share will be valued.",
          "How and over what period the buyout will be paid.",
        ],
      },
      {
        id: "dispute-resolution",
        heading: "5. Dispute resolution",
        paragraphs: [
          "Agree in advance how disagreements will be handled, for example negotiation first, then mediation, then arbitration. It's far easier to agree on a process before there's a conflict.",
        ],
      },
    ],
  },
  {
    slug: "what-happens-after-a-dui-arrest",
    title: "What Happens After a DUI Arrest",
    excerpt:
      "A DUI arrest starts two separate processes: a criminal case and a license case. Here's what to expect.",
    practiceArea: "criminal-defense",
    readTime: "6 min read",
    publishedAt: "2026-06-30",
    author: "daniel-reyes",
    sections: [
      {
        id: "two-cases",
        heading: "Two cases, not one",
        paragraphs: [
          "After a DUI arrest, most people face a criminal case in court and a separate administrative case about their driver's license. The license case often has a very short deadline to request a hearing, sometimes just days.",
        ],
      },
      {
        id: "first-steps",
        heading: "Your first steps",
        bullets: [
          "Write down everything you remember about the stop, the tests and the arrest.",
          "Keep all paperwork you were given, including any temporary license.",
          "Don't discuss the case with anyone except your attorney.",
          "Contact a defense attorney quickly so no deadline is missed.",
        ],
        paragraphs: [],
      },
      {
        id: "how-cases-are-challenged",
        heading: "How DUI cases are challenged",
        paragraphs: [
          "A strong defense looks closely at every step: whether the stop was lawful, whether field sobriety tests were given correctly, and whether breath or blood tests were properly administered and maintained. Problems at any step can lead to reduced or dismissed charges.",
        ],
      },
      {
        id: "possible-outcomes",
        heading: "Possible outcomes",
        paragraphs: [
          "Depending on the facts and your history, outcomes range from dismissal, to a reduced charge, to diversion or treatment programs, to conviction with penalties such as fines, classes or license restrictions. An experienced attorney can explain which outcomes are realistic in your case.",
        ],
      },
    ],
  },
  {
    slug: "how-contingency-fees-work",
    title: "How Contingency Fees Work",
    excerpt:
      "No fee unless you win. Here's exactly what that means, and the questions to ask before you sign.",
    practiceArea: "personal-injury",
    readTime: "4 min read",
    publishedAt: "2026-06-12",
    author: "eleanor-calloway",
    sections: [
      {
        id: "the-basics",
        heading: "The basics",
        paragraphs: [
          "With a contingency fee, your attorney is paid a percentage of the money recovered for you, through a settlement or a verdict. If there's no recovery, you don't owe a fee. This lets people pursue a claim without paying anything upfront.",
        ],
      },
      {
        id: "fees-vs-costs",
        heading: "Fees vs. costs",
        paragraphs: [
          "Fees pay for the attorney's work. Costs are case expenses, like filing fees, medical records and expert witnesses. Ask how costs are handled: whether the firm advances them, and whether they're deducted before or after the fee is calculated.",
        ],
      },
      {
        id: "questions-to-ask",
        heading: "Questions to ask before you sign",
        paragraphs: [],
        bullets: [
          "What percentage is the fee, and does it change if the case goes to trial?",
          "Who pays case costs if we don't win?",
          "Will I get a written agreement and a written breakdown at the end?",
          "Who will actually work on my case day to day?",
        ],
      },
      {
        id: "get-it-in-writing",
        heading: "Get it in writing",
        paragraphs: [
          "A reputable firm will give you a clear written fee agreement and walk you through it before you sign. If anything is unclear, ask. You should never be surprised by your final statement.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
