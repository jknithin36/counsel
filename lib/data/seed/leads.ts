import type {
  ActivityEvent,
  Lead,
  LeadSource,
  LeadStatus,
  MeetingType,
  Note,
  Urgency,
} from "../types";
import { past } from "./time";
import { findDemoUser } from "./users";

type Row = {
  first: string;
  last: string;
  area: string;
  status: LeadStatus;
  source: LeadSource;
  urgency: Urgency;
  daysAgo: number;
  hour: number;
  description: string;
  opposing?: string;
  spanish?: boolean;
  referral?: string;
  attorney?: string;
  /** Why the firm declined, for not_a_fit leads. */
  reason?: string;
};

/** 45 fictional leads from the last 60 days. */
const rows: Row[] = [
  // New (9)
  {
    first: "Jordan",
    last: "Whitfield",
    area: "personal-injury",
    status: "new",
    source: "website",
    urgency: "urgent",
    daysAgo: 0,
    hour: 8,
    description:
      "A Ridgeline Freight delivery truck rear-ended me at a stoplight on Harbor Avenue two days ago, and my neck and shoulder have gotten worse since. Their insurer already called asking for a recorded statement. I haven't given one and want to know what to say.",
    opposing: "Ridgeline Freight",
  },
  {
    first: "Aisha",
    last: "Rahman",
    area: "family-law",
    status: "new",
    source: "google",
    urgency: "soon",
    daysAgo: 0,
    hour: 7,
    description:
      "My ex-husband has started missing his weekend pickups and wants to change our parenting schedule informally. I'd like to understand whether we need to modify the order through the court. We have two children, ages 7 and 10.",
    opposing: "Omar Rahman",
  },
  {
    first: "Kevin",
    last: "Osei",
    area: "criminal-defense",
    status: "new",
    source: "phone",
    urgency: "urgent",
    daysAgo: 1,
    hour: 21,
    description:
      "I was arrested last night for driving under the influence and released this morning. My arraignment is next week and my license was taken at the scene. I need to know what happens next and whether I can keep driving for work.",
  },
  {
    first: "Linda",
    last: "Park",
    area: "estate-planning",
    status: "new",
    source: "website",
    urgency: "researching",
    daysAgo: 1,
    hour: 13,
    description:
      "My husband and I are in our sixties and have never written wills. We own our home and a small rental property and want to avoid probate for our kids. We'd like to know whether a trust makes sense for us.",
  },
  {
    first: "Marco",
    last: "Bellini",
    area: "business-law",
    status: "new",
    source: "referral",
    urgency: "soon",
    daysAgo: 2,
    hour: 11,
    referral: "Hartwell & Co. accountants",
    description:
      "I'm opening a second location of my restaurant, and my business partner and I never signed an operating agreement. Before we take on a new lease I want our ownership and decision-making in writing.",
  },
  {
    first: "Tanya",
    last: "Brooks",
    area: "personal-injury",
    status: "new",
    source: "social",
    urgency: "soon",
    daysAgo: 2,
    hour: 16,
    description:
      "I slipped on a wet floor at a grocery store last month and fractured my wrist. There was no warning sign and an employee saw it happen. I've missed three weeks of work so far.",
    opposing: "Freshway Markets",
  },
  {
    first: "Samuel",
    last: "Ortiz",
    area: "personal-injury",
    status: "new",
    source: "website",
    urgency: "urgent",
    daysAgo: 3,
    hour: 9,
    spanish: true,
    description:
      "My son was hit by a car while riding his bike near his school and is in the hospital with a broken leg. The driver stayed at the scene and police took a report. We need help with the medical bills and the insurance company.",
  },
  {
    first: "Hannah",
    last: "Lowe",
    area: "family-law",
    status: "new",
    source: "google",
    urgency: "researching",
    daysAgo: 4,
    hour: 19,
    description:
      "I'm thinking about filing for divorce after twelve years of marriage. We have a house, two retirement accounts and a teenage daughter. I want to understand the process and costs before I talk to my spouse.",
  },
  {
    first: "Derek",
    last: "Simmons",
    area: "business-law",
    status: "new",
    source: "website",
    urgency: "soon",
    daysAgo: 5,
    hour: 14,
    description:
      "A former employee has started a competing company and is contacting our clients. He signed a non-solicitation agreement when he was hired. I'd like to know what our options are.",
    opposing: "Ashgrove Analytics LLC",
  },

  // Contacted (10)
  {
    first: "Grace",
    last: "Kim",
    area: "estate-planning",
    status: "contacted",
    source: "referral",
    urgency: "soon",
    daysAgo: 1,
    hour: 15,
    referral: "Dr. Helen Ward, family physician",
    description:
      "My mother was recently diagnosed with early-stage dementia. We need to put a power of attorney and health care directive in place while she can still sign them. My brother and I both want to be involved.",
  },
  {
    first: "Victor",
    last: "Hale",
    area: "criminal-defense",
    status: "contacted",
    source: "phone",
    urgency: "urgent",
    daysAgo: 2,
    hour: 18,
    description:
      "I've been charged with misdemeanor assault after an argument outside a bar. I have no prior record. My court date is in three weeks and I want to avoid a conviction that shows up on background checks.",
  },
  {
    first: "Rachel",
    last: "Nguyen",
    area: "personal-injury",
    status: "contacted",
    source: "google",
    urgency: "soon",
    daysAgo: 3,
    hour: 12,
    description:
      "I was injured when a delivery van backed into my car in a parking lot. The van's company admitted fault but is offering only enough to cover the repair. I'm still in physical therapy for my lower back.",
    opposing: "Swiftline Couriers",
  },
  {
    first: "Ben",
    last: "Carter",
    area: "business-law",
    status: "contacted",
    source: "website",
    urgency: "researching",
    daysAgo: 4,
    hour: 10,
    description:
      "I'm a freelance designer forming an LLC and want help with the formation and a standard client contract. I'd also like to understand what insurance I should carry.",
  },
  {
    first: "Elena",
    last: "Ruiz",
    area: "family-law",
    status: "contacted",
    source: "referral",
    urgency: "urgent",
    daysAgo: 5,
    hour: 9,
    spanish: true,
    referral: "Former client",
    description:
      "My partner and I separated and he has kept our son for the past week without agreeing to a schedule. We were never married. I need to know how to establish custody quickly.",
    opposing: "Luis Moreno",
  },
  {
    first: "Paul",
    last: "Jensen",
    area: "personal-injury",
    status: "contacted",
    source: "website",
    urgency: "soon",
    daysAgo: 6,
    hour: 17,
    description:
      "My father fell at his assisted living facility and broke his hip. It was the second fall in two months, and the staff didn't tell us about the first one until much later. We want to understand whether the facility is responsible.",
    opposing: "Maple Grove Senior Living",
  },
  {
    first: "Olivia",
    last: "Grant",
    area: "estate-planning",
    status: "contacted",
    source: "social",
    urgency: "researching",
    daysAgo: 8,
    hour: 20,
    description:
      "I'm a single parent and want to name a guardian for my two kids. I'd also like to set things up so their inheritance isn't handed to them at eighteen. I have a life insurance policy through work.",
  },
  {
    first: "Andre",
    last: "Wallace",
    area: "criminal-defense",
    status: "contacted",
    source: "google",
    urgency: "soon",
    daysAgo: 10,
    hour: 11,
    description:
      "My teenage son was cited for shoplifting at a mall. He's 16 and this is his first offense. We want to know whether this can be handled without a juvenile record.",
  },
  {
    first: "Megan",
    last: "Foster",
    area: "personal-injury",
    status: "contacted",
    source: "phone",
    urgency: "soon",
    daysAgo: 12,
    hour: 14,
    description:
      "A neighbor's dog bit my daughter on the arm while she was walking home from school. She needed stitches and is now afraid to walk outside. The neighbor's homeowners insurer has asked for medical records.",
    opposing: "Pinecrest Home Insurance",
  },
  {
    first: "Chris",
    last: "Doyle",
    area: "business-law",
    status: "contacted",
    source: "referral",
    urgency: "soon",
    daysAgo: 14,
    hour: 13,
    referral: "Westlake Business Bank",
    description:
      "We're buying a small HVAC company from its retiring owner. We've agreed on a price but need someone to review the purchase agreement and do due diligence on the company's contracts.",
    opposing: "Northfield Heating & Air",
  },

  // Consultation scheduled (8)
  {
    first: "Natalie",
    last: "Hughes",
    area: "personal-injury",
    status: "consultation_scheduled",
    source: "website",
    urgency: "urgent",
    daysAgo: 2,
    hour: 10,
    description:
      "I was T-boned in an intersection by a driver who ran a red light. My car was totaled, and I have a concussion and two broken ribs. A witness gave a statement to police.",
    opposing: "Summit Ridge Auto Insurance",
  },
  {
    first: "Isaac",
    last: "Fernandez",
    area: "family-law",
    status: "consultation_scheduled",
    source: "google",
    urgency: "soon",
    daysAgo: 3,
    hour: 15,
    description:
      "My wife and I have agreed to divorce and want to keep it amicable. We'd like help with a settlement agreement covering the house, our savings and a parenting plan for our son.",
    opposing: "Carmen Fernandez",
  },
  {
    first: "Diane",
    last: "Mercer",
    area: "estate-planning",
    status: "consultation_scheduled",
    source: "referral",
    urgency: "researching",
    daysAgo: 4,
    hour: 11,
    referral: "Former client",
    description:
      "My late husband's will named me executor and I don't know where to start. There's a house, a brokerage account and some debts. His brother has already asked when he'll receive his share.",
  },
  {
    first: "Tyler",
    last: "Brennan",
    area: "criminal-defense",
    status: "consultation_scheduled",
    source: "phone",
    urgency: "urgent",
    daysAgo: 5,
    hour: 22,
    description:
      "I was pulled over and police found a small amount of marijuana and a pipe in my car. I was charged with possession and paraphernalia. I'm a nursing student and worried about my license.",
  },
  {
    first: "Sophie",
    last: "Laurent",
    area: "business-law",
    status: "consultation_scheduled",
    source: "website",
    urgency: "soon",
    daysAgo: 6,
    hour: 9,
    description:
      "A supplier delivered a large order of defective packaging and refuses to issue a refund. The contract has a dispute clause I don't fully understand. We've lost about $40,000 in product.",
    opposing: "Corrugate Solutions Inc.",
  },
  {
    first: "Omar",
    last: "Haddad",
    area: "personal-injury",
    status: "consultation_scheduled",
    source: "referral",
    urgency: "soon",
    daysAgo: 7,
    hour: 16,
    referral: "Local 412 union representative",
    description:
      "I was hurt at work when scaffolding collapsed on a job site. Workers' comp is covering some costs, but the scaffolding belonged to a different contractor. I'd like to know if I have a separate claim.",
    opposing: "Apex Scaffold Rentals",
  },
  {
    first: "Lauren",
    last: "Pierce",
    area: "family-law",
    status: "consultation_scheduled",
    source: "social",
    urgency: "soon",
    daysAgo: 9,
    hour: 12,
    description:
      "My ex-husband wants to move out of state with our daughter for a new job. Our custody order gives us joint custody. I want to understand whether I can stop the move or change the schedule.",
    opposing: "Adam Pierce",
  },
  {
    first: "Gabriel",
    last: "Santos",
    area: "personal-injury",
    status: "consultation_scheduled",
    source: "website",
    urgency: "soon",
    daysAgo: 11,
    hour: 10,
    spanish: true,
    description:
      "I was a passenger in a rideshare when the driver crashed into a guardrail. I hurt my shoulder and needed surgery. I'm not sure whose insurance should pay.",
    opposing: "Metro Rides Inc.",
  },

  // Retained (12)
  {
    first: "Nathan",
    last: "Cole",
    area: "personal-injury",
    status: "retained",
    source: "website",
    urgency: "urgent",
    daysAgo: 14,
    hour: 9,
    attorney: "u-james",
    description:
      "I was hit by a commercial truck merging onto the highway. I have a herniated disc and have been out of work for six weeks. The trucking company's adjuster keeps calling me.",
    opposing: "Blue Mesa Logistics",
  },
  {
    first: "Priscilla",
    last: "Wong",
    area: "estate-planning",
    status: "retained",
    source: "referral",
    urgency: "researching",
    daysAgo: 17,
    hour: 14,
    referral: "Thomas Albright (client)",
    description:
      "My wife and I want to update our estate plan now that our first grandchild is born. Our current wills are fifteen years old and name guardians who have since moved away. We'd also like to set up a trust for education.",
  },
  {
    first: "Robert",
    last: "Okafor",
    area: "family-law",
    status: "retained",
    source: "google",
    urgency: "soon",
    daysAgo: 20,
    hour: 11,
    description:
      "I'm filing for divorce after eight years. My spouse has already hired an attorney and served me with papers last week. We have a house and a small business we built together.",
    opposing: "Adaeze Okafor",
  },
  {
    first: "Jessica",
    last: "Tran",
    area: "business-law",
    status: "retained",
    source: "website",
    urgency: "soon",
    daysAgo: 23,
    hour: 15,
    description:
      "I'm launching a skincare brand and need trademark help, an operating agreement for me and my co-founder, and a manufacturing agreement with our supplier.",
  },
  {
    first: "Luis",
    last: "Herrera",
    area: "criminal-defense",
    status: "retained",
    source: "phone",
    urgency: "urgent",
    daysAgo: 26,
    hour: 20,
    spanish: true,
    description:
      "I was charged with a felony after a bar fight where the other man was injured. I acted in self-defense and there were witnesses. I'm out on bail and have a hearing next month.",
  },
  {
    first: "Amanda",
    last: "Sinclair",
    area: "personal-injury",
    status: "retained",
    source: "referral",
    urgency: "soon",
    daysAgo: 29,
    hour: 10,
    attorney: "u-eleanor",
    referral: "Gloria Pham (client)",
    description:
      "My car was struck by a city bus that ran a stop sign. I fractured my ankle and needed surgery. I've heard claims against the city have strict deadlines.",
    opposing: "Metro Transit Authority",
  },
  {
    first: "Kwame",
    last: "Mensah",
    area: "family-law",
    status: "retained",
    source: "website",
    urgency: "urgent",
    daysAgo: 33,
    hour: 13,
    description:
      "My ex-partner has stopped letting me see my daughter despite our agreed schedule. I've missed four weekends in a row. I want to enforce the custody order.",
    opposing: "Dana Whitlock",
  },
  {
    first: "Charlotte",
    last: "Hayes",
    area: "estate-planning",
    status: "retained",
    source: "google",
    urgency: "researching",
    daysAgo: 37,
    hour: 16,
    description:
      "My father passed away last month without a will. He owned a house and has three children from two marriages. We want to settle the estate fairly and without fighting.",
  },
  {
    first: "Ethan",
    last: "Marsh",
    area: "business-law",
    status: "retained",
    source: "referral",
    urgency: "soon",
    daysAgo: 41,
    hour: 12,
    referral: "Northgate Startup Studio",
    description:
      "Our software company is raising a seed round and investors have sent a term sheet. We need someone to review it and help with the stock purchase documents.",
  },
  {
    first: "Stephanie",
    last: "Vance",
    area: "personal-injury",
    status: "retained",
    source: "google",
    urgency: "soon",
    daysAgo: 45,
    hour: 11,
    attorney: "u-james",
    description:
      "I was injured by a space heater that caught fire in my apartment. I have burns on my hands and arms. The heater was less than a year old.",
    opposing: "Brightwarm Appliances",
  },
  {
    first: "Malik",
    last: "Johnson",
    area: "personal-injury",
    status: "retained",
    source: "phone",
    urgency: "urgent",
    daysAgo: 50,
    hour: 18,
    attorney: "u-daniel",
    description:
      "I was knocked off my motorcycle by a driver who changed lanes without looking. I broke my collarbone and my bike is destroyed. The driver was cited at the scene.",
    opposing: "Curtis Bramble",
  },
  {
    first: "Rebecca",
    last: "Lindqvist",
    area: "family-law",
    status: "retained",
    source: "referral",
    urgency: "soon",
    daysAgo: 56,
    hour: 14,
    referral: "Former client",
    description:
      "My husband and I are separating and need a fair child support and spousal support arrangement. He earns significantly more than I do and handles all of our finances.",
    opposing: "Erik Lindqvist",
  },

  // Not a fit (6)
  {
    first: "Gary",
    last: "Whitman",
    area: "general-inquiry",
    status: "not_a_fit",
    source: "website",
    urgency: "researching",
    daysAgo: 9,
    hour: 15,
    description:
      "I want to sue my neighbor over a fence that's two feet onto my property. I've had a survey done and he refuses to move it.",
    reason:
      "Boundary dispute is real estate litigation, which we don't handle. Sent referral list.",
  },
  {
    first: "Nicole",
    last: "Barrett",
    area: "personal-injury",
    status: "not_a_fit",
    source: "google",
    urgency: "soon",
    daysAgo: 16,
    hour: 10,
    description:
      "I tripped on an uneven sidewalk outside my office three years ago and hurt my knee. I didn't see a doctor until recently. I want to know if it's too late to file a claim.",
    reason:
      "Claim is past the filing deadline. Explained by phone and sent a closing letter.",
  },
  {
    first: "Steven",
    last: "Pratt",
    area: "criminal-defense",
    status: "not_a_fit",
    source: "phone",
    urgency: "urgent",
    daysAgo: 24,
    hour: 21,
    description:
      "I received a federal grand jury subpoena related to my former employer's billing practices. I haven't been charged with anything. I don't know whether I need my own lawyer.",
    reason:
      "Federal white-collar matter. Referred to outside federal defense counsel.",
  },
  {
    first: "Monica",
    last: "Sterling",
    area: "family-law",
    status: "not_a_fit",
    source: "social",
    urgency: "researching",
    daysAgo: 31,
    hour: 19,
    description:
      "My sister lives in another state and is going through a custody dispute there. I'm trying to help her find a lawyer near her. She can't afford much.",
    reason:
      "Case is out of state. Shared the other state's bar referral service.",
  },
  {
    first: "Howard",
    last: "Finch",
    area: "business-law",
    status: "not_a_fit",
    source: "referral",
    urgency: "soon",
    daysAgo: 39,
    hour: 11,
    referral: "Westlake Business Bank",
    description:
      "We need help with a patent application for a new medical device our company developed. We'd also like a freedom-to-operate review before launch.",
    reason:
      "Patent prosecution is outside our practice. Referred to IP counsel.",
  },
  {
    first: "Yolanda",
    last: "Price",
    area: "general-inquiry",
    status: "not_a_fit",
    source: "website",
    urgency: "researching",
    daysAgo: 52,
    hour: 13,
    description:
      "My landlord hasn't returned my security deposit two months after I moved out. It's about $1,800. I'm not sure whether this is something small claims court can handle.",
    reason:
      "Good fit for small claims court. Sent the self-help guide; no representation needed.",
  },
];

const defaultAttorney: Record<string, string> = {
  "personal-injury": "u-daniel",
  "family-law": "u-priya",
  "estate-planning": "u-sofia",
  "business-law": "u-marcus",
  "criminal-defense": "u-daniel",
};

const meetingTypes: MeetingType[] = ["video", "phone", "in_person"];
const timeOptions = [
  ["Weekday mornings"],
  ["Weekday afternoons"],
  ["Evenings"],
  ["Weekday mornings", "Evenings"],
];
const contactPrefs = ["phone", "email", "text"] as const;

const sourceMessage: Record<LeadSource, string> = {
  website: "Lead submitted via website",
  google: "Lead submitted via website (from Google)",
  social: "Lead submitted via website (from social media)",
  referral: "Lead created from a referral",
  phone: "Lead created from a phone call",
};

const statusLabel: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  consultation_scheduled: "Consultation scheduled",
  retained: "Retained",
  not_a_fit: "Not a fit",
};

/** Lead ids are stable so consultations and clients can point at them. */
export const seedLeadId = (index: number) => `CR-${3107 + index * 41}`;

export function buildLeads(now: Date): Lead[] {
  return rows.map((row, i) => {
    const id = seedLeadId(i);
    const createdAt = past(now, row.daysAgo, row.hour, (i * 17) % 60);
    const step = (hours: number) => {
      const t = new Date(createdAt).getTime() + hours * 3_600_000;
      return new Date(Math.min(t, now.getTime())).toISOString();
    };
    const isNew = row.status === "new";
    const attorney =
      row.attorney ??
      (isNew && i % 2 === 0 ? undefined : defaultAttorney[row.area]);
    const attorneyName = attorney ? findDemoUser(attorney)?.name : undefined;

    const notes: Note[] = [];
    const activity: ActivityEvent[] = [
      {
        id: `${id}-a1`,
        createdAt,
        type: "submitted",
        message: sourceMessage[row.source],
      },
    ];
    if (attorneyName) {
      activity.push({
        id: `${id}-a2`,
        createdAt: step(2),
        type: "assigned",
        message: `Assigned to ${attorneyName}`,
      });
    }
    if (!isNew) {
      activity.push({
        id: `${id}-a3`,
        createdAt: step(5),
        type: "status_changed",
        message: `Status changed to ${statusLabel.contacted}`,
      });
      notes.push({
        id: `${id}-n1`,
        createdAt: step(5),
        author: "Tom Becker",
        body:
          i % 3 === 0
            ? `Spoke with ${row.first} for about 15 minutes. Confirmed the basic facts and explained how a consultation works.`
            : `Called ${row.first} and left a voicemail, then followed up by email with our intake questions.`,
      });
    }
    if (row.status !== "new" && row.status !== "contacted") {
      activity.push({
        id: `${id}-a4`,
        createdAt: step(8),
        type: "status_changed",
        message: `Status changed to ${statusLabel[row.status]}`,
      });
    }
    if (row.status === "retained") {
      notes.push({
        id: `${id}-n2`,
        createdAt: step(8),
        author: attorneyName ?? "Eleanor Calloway",
        body: "Engagement letter signed and conflict check cleared. Matter opened.",
      });
    }
    if (row.reason) {
      notes.push({
        id: `${id}-n2`,
        createdAt: step(8),
        author: attorneyName ?? "Tom Becker",
        body: row.reason,
      });
    }

    return {
      id,
      createdAt,
      status: row.status,
      practiceArea: row.area,
      firstName: row.first,
      lastName: row.last,
      email: `${row.first}.${row.last}@example.com`.toLowerCase(),
      phone: `(555) 555-${String(1200 + i * 37).slice(-4)}`,
      preferredContact: contactPrefs[i % 3],
      language: row.spanish ? "Spanish" : "English",
      description: row.description,
      urgency: row.urgency,
      opposingParty: row.opposing,
      preferredTimes: timeOptions[i % timeOptions.length],
      meetingType: meetingTypes[i % 3],
      source: row.source,
      referralSource: row.referral,
      consent: true,
      notes,
      activity,
      assignedAttorney: attorney,
    };
  });
}
