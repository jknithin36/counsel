import type { PracticeAreaSlug } from "@/lib/content/practice-areas";
import { matterStages } from "../stages";
import type {
  Client,
  FeeType,
  Lead,
  Matter,
  MatterStatus,
  MatterTask,
  MatterUpdate,
} from "../types";
import { at, past } from "./time";

type ClientDef = {
  key: string;
  name: string;
  email?: string;
  address: string;
  spanish?: boolean;
  trust: number;
};

type MatterDef = {
  key: string;
  client: string;
  title: string;
  area: PracticeAreaSlug;
  status: MatterStatus;
  stage: string;
  lead: string;
  team: string[];
  openedDaysAgo: number;
  fee: FeeType;
  amount: number;
  deadline?: [days: number, label: string];
  opposing: string[];
  related?: string[];
};

/** Clients who came in before the last 60 days of leads. */
const olderClients: ClientDef[] = [
  {
    key: "delgado",
    name: "Maria Delgado",
    email: "maria@example.com",
    address: "418 Linden Court, Apt 2B",
    spanish: true,
    trust: 0,
  },
  {
    key: "albright",
    name: "Thomas Albright",
    address: "77 Orchard Hill Road",
    trust: 3200,
  },
  {
    key: "pham",
    name: "Gloria Pham",
    address: "1520 Bayview Terrace",
    trust: 0,
  },
  {
    key: "castillo",
    name: "Raymond Castillo",
    address: "903 Mercer Street, Unit 4",
    spanish: true,
    trust: 4000,
  },
  {
    key: "shaw",
    name: "Evelyn Shaw",
    address: "26 Willow Bend Lane",
    trust: 0,
  },
  {
    key: "harbor-pine",
    name: "Harbor & Pine Bakery",
    email: "lena@harborandpine.example.com",
    address: "212 Front Street",
    trust: 1500,
  },
  {
    key: "ingram",
    name: "Walter Ingram",
    address: "4401 Ridgecrest Drive",
    trust: 0,
  },
  {
    key: "carver",
    name: "Denise Carver",
    address: "88 Fenwick Avenue",
    trust: 0,
  },
  { key: "moreau", name: "Julian Moreau", address: "350 Canal Row", trust: 0 },
  {
    key: "lin",
    name: "Patricia Lin",
    address: "1107 Sycamore Place",
    trust: 2750,
  },
  {
    key: "okoro",
    name: "Samuel Okoro",
    address: "61 Granite Way, Apt 9",
    trust: 0,
  },
  {
    key: "hollis",
    name: "Vivian Hollis",
    address: "500 Commerce Plaza, Suite 300",
    trust: 6000,
  },
];

/** Retained leads become clients; keyed by the lead's full name. */
const retainedClients: Record<string, Omit<ClientDef, "name">> = {
  "Nathan Cole": { key: "cole", address: "1934 Prairie Lane", trust: 0 },
  "Priscilla Wong": { key: "wong", address: "15 Lantern Hill", trust: 2600 },
  "Robert Okafor": { key: "okafor", address: "742 Elmhurst Road", trust: 5000 },
  "Jessica Tran": {
    key: "tran",
    address: "300 Market Street, Studio 12",
    trust: 1800,
  },
  "Luis Herrera": {
    key: "herrera",
    address: "58 Calle Verde",
    spanish: true,
    trust: 7500,
  },
  "Amanda Sinclair": {
    key: "sinclair",
    address: "2210 Oakmont Drive",
    trust: 0,
  },
  "Kwame Mensah": { key: "mensah", address: "47 Birchwood Court", trust: 2500 },
  "Charlotte Hayes": { key: "hayes", address: "9 Quarry Road", trust: 3750 },
  "Ethan Marsh": {
    key: "marsh",
    address: "120 Foundry Lane, Floor 2",
    trust: 8000,
  },
  "Stephanie Vance": {
    key: "vance",
    address: "631 Hawthorne Street",
    trust: 0,
  },
  "Malik Johnson": { key: "johnson", address: "84 Ridgeview Avenue", trust: 0 },
  "Rebecca Lindqvist": {
    key: "lindqvist",
    address: "19 Heron Point",
    trust: 4200,
  },
};

const matterDefs: MatterDef[] = [
  {
    key: "albright-trust",
    client: "albright",
    title: "Albright Family Trust",
    area: "estate-planning",
    status: "open",
    stage: "funding",
    lead: "u-sofia",
    team: ["u-sofia", "u-rosa"],
    openedDaysAgo: 410,
    fee: "flat",
    amount: 4800,
    deadline: [21, "Retitle brokerage account into the trust"],
    opposing: [],
    related: ["Margaret Albright (spouse)", "Owen Albright (son)"],
  },
  {
    key: "albright-succession",
    client: "albright",
    title: "Albright Hardware — Succession Plan",
    area: "business-law",
    status: "open",
    stage: "drafting",
    lead: "u-marcus",
    team: ["u-marcus", "u-rosa"],
    openedDaysAgo: 120,
    fee: "hourly",
    amount: 18000,
    deadline: [6, "Send draft buy-sell agreement to client"],
    opposing: [],
    related: ["Albright Hardware Inc.", "Owen Albright (son)"],
  },
  {
    key: "pham",
    client: "pham",
    title: "Pham v. Westbrook Apartments",
    area: "personal-injury",
    status: "open",
    stage: "litigation",
    lead: "u-james",
    team: ["u-james", "u-rosa"],
    openedDaysAgo: 300,
    fee: "contingency",
    amount: 240000,
    deadline: [4, "Expert witness disclosures due"],
    opposing: ["Westbrook Apartments LLC", "Crestline Property Management"],
  },
  {
    key: "castillo",
    client: "castillo",
    title: "State v. Castillo",
    area: "criminal-defense",
    status: "open",
    stage: "pretrial",
    lead: "u-daniel",
    team: ["u-daniel", "u-rosa"],
    openedDaysAgo: 95,
    fee: "flat",
    amount: 12500,
    deadline: [2, "File motion to suppress"],
    opposing: ["County District Attorney's Office"],
  },
  {
    key: "shaw",
    client: "shaw",
    title: "In re Marriage of Shaw",
    area: "family-law",
    status: "closed",
    stage: "final_order",
    lead: "u-priya",
    team: ["u-priya"],
    openedDaysAgo: 260,
    fee: "hourly",
    amount: 15000,
    opposing: ["Martin Shaw"],
  },
  {
    key: "harbor-lease",
    client: "harbor-pine",
    title: "Harbor & Pine Bakery — Commercial Lease",
    area: "business-law",
    status: "open",
    stage: "negotiation",
    lead: "u-marcus",
    team: ["u-marcus"],
    openedDaysAgo: 150,
    fee: "hourly",
    amount: 9000,
    deadline: [19, "Landlord's lease redline due back"],
    opposing: ["Quayside Properties LLC"],
    related: ["Lena Moss (owner)"],
  },
  {
    key: "harbor-employment",
    client: "harbor-pine",
    title: "Harbor & Pine Bakery — Employment Policies",
    area: "business-law",
    status: "closed",
    stage: "closed",
    lead: "u-marcus",
    team: ["u-marcus"],
    openedDaysAgo: 230,
    fee: "flat",
    amount: 3500,
    opposing: [],
    related: ["Lena Moss (owner)"],
  },
  {
    key: "ingram",
    client: "ingram",
    title: "Estate of Ruth Ingram",
    area: "estate-planning",
    status: "closed",
    stage: "complete",
    lead: "u-sofia",
    team: ["u-sofia", "u-rosa"],
    openedDaysAgo: 340,
    fee: "flat",
    amount: 6500,
    opposing: [],
    related: ["Ruth Ingram (decedent)", "Clara Ingram (beneficiary)"],
  },
  {
    key: "carver",
    client: "carver",
    title: "Carver v. Northgate Mall Associates",
    area: "personal-injury",
    status: "open",
    stage: "demand",
    lead: "u-eleanor",
    team: ["u-eleanor", "u-rosa"],
    openedDaysAgo: 190,
    fee: "contingency",
    amount: 95000,
    deadline: [16, "Insurer's response to demand due"],
    opposing: ["Northgate Mall Associates", "Ironclad Facility Services"],
  },
  {
    key: "moreau",
    client: "moreau",
    title: "State v. Moreau",
    area: "criminal-defense",
    status: "closed",
    stage: "resolution",
    lead: "u-daniel",
    team: ["u-daniel"],
    openedDaysAgo: 280,
    fee: "flat",
    amount: 7500,
    opposing: ["County District Attorney's Office"],
  },
  {
    key: "lin-custody",
    client: "lin",
    title: "Lin v. Lin — Custody Modification",
    area: "family-law",
    status: "open",
    stage: "hearing",
    lead: "u-priya",
    team: ["u-priya", "u-rosa"],
    openedDaysAgo: 110,
    fee: "hourly",
    amount: 12000,
    deadline: [-1, "File updated financial affidavit"],
    opposing: ["Kevin Lin"],
    related: ["Emma Lin (child)"],
  },
  {
    key: "lin-estate",
    client: "lin",
    title: "Lin Estate Plan",
    area: "estate-planning",
    status: "open",
    stage: "client_review",
    lead: "u-sofia",
    team: ["u-sofia"],
    openedDaysAgo: 40,
    fee: "flat",
    amount: 3200,
    deadline: [23, "Client comments on draft trust"],
    opposing: [],
    related: ["Emma Lin (child)"],
  },
  {
    key: "okoro",
    client: "okoro",
    title: "Okoro v. Tallgrass Freight",
    area: "personal-injury",
    status: "open",
    stage: "investigation",
    lead: "u-james",
    team: ["u-james", "u-rosa"],
    openedDaysAgo: 60,
    fee: "contingency",
    amount: 150000,
    deadline: [27, "Request crash reconstruction report"],
    opposing: ["Tallgrass Freight Co.", "Darren Pruitt (driver)"],
  },
  {
    key: "hollis",
    client: "hollis",
    title: "Hollis Consulting — Partnership Dissolution",
    area: "business-law",
    status: "pending",
    stage: "negotiation",
    lead: "u-marcus",
    team: ["u-marcus"],
    openedDaysAgo: 85,
    fee: "hourly",
    amount: 14000,
    deadline: [3, "Respond to buyout proposal"],
    opposing: ["Graham Pell"],
    related: ["Hollis & Pell Consulting LLP"],
  },
  {
    key: "delgado",
    client: "delgado",
    title: "Delgado v. Ridgeline Freight",
    area: "personal-injury",
    status: "open",
    stage: "negotiation",
    lead: "u-daniel",
    team: ["u-daniel", "u-rosa"],
    openedDaysAgo: 72,
    fee: "contingency",
    amount: 185000,
    deadline: [9, "Respond to settlement offer"],
    opposing: ["Ridgeline Freight LLC", "Keystone Casualty (insurer)"],
    related: ["Carlos Delgado (spouse)"],
  },
  {
    key: "cole",
    client: "cole",
    title: "Cole v. Blue Mesa Logistics",
    area: "personal-injury",
    status: "open",
    stage: "investigation",
    lead: "u-james",
    team: ["u-james", "u-rosa"],
    openedDaysAgo: 9,
    fee: "contingency",
    amount: 320000,
    deadline: [18, "Collect medical records"],
    opposing: ["Blue Mesa Logistics", "Ray Dunmore (driver)"],
  },
  {
    key: "wong",
    client: "wong",
    title: "Wong Family Estate Plan",
    area: "estate-planning",
    status: "pending",
    stage: "client_review",
    lead: "u-sofia",
    team: ["u-sofia"],
    openedDaysAgo: 12,
    fee: "flat",
    amount: 5200,
    deadline: [18, "Signing meeting"],
    opposing: [],
    related: ["Henry Wong (spouse)"],
  },
  {
    key: "okafor",
    client: "okafor",
    title: "In re Marriage of Okafor",
    area: "family-law",
    status: "open",
    stage: "filing",
    lead: "u-priya",
    team: ["u-priya", "u-rosa"],
    openedDaysAgo: 15,
    fee: "hourly",
    amount: 20000,
    deadline: [1, "Response to divorce petition due"],
    opposing: ["Adaeze Okafor"],
    related: ["Okafor Home Services LLC"],
  },
  {
    key: "lumen-formation",
    client: "tran",
    title: "Lumen Botanics — Formation & Operating Agreement",
    area: "business-law",
    status: "open",
    stage: "drafting",
    lead: "u-marcus",
    team: ["u-marcus"],
    openedDaysAgo: 18,
    fee: "flat",
    amount: 4500,
    deadline: [19, "Operating agreement draft to co-founders"],
    opposing: [],
    related: ["Lumen Botanics LLC", "Ava Chen (co-founder)"],
  },
  {
    key: "lumen-trademark",
    client: "tran",
    title: "Lumen Botanics — Trademark Filings",
    area: "business-law",
    status: "open",
    stage: "review",
    lead: "u-marcus",
    team: ["u-marcus"],
    openedDaysAgo: 16,
    fee: "flat",
    amount: 2800,
    deadline: [30, "File trademark applications"],
    opposing: [],
    related: ["Lumen Botanics LLC"],
  },
  {
    key: "herrera",
    client: "herrera",
    title: "State v. Herrera",
    area: "criminal-defense",
    status: "open",
    stage: "discovery",
    lead: "u-daniel",
    team: ["u-daniel", "u-rosa"],
    openedDaysAgo: 21,
    fee: "flat",
    amount: 15000,
    deadline: [17, "Preliminary hearing"],
    opposing: ["County District Attorney's Office"],
    related: ["Wade Corley (complaining witness)"],
  },
  {
    key: "sinclair",
    client: "sinclair",
    title: "Sinclair v. Metro Transit Authority",
    area: "personal-injury",
    status: "open",
    stage: "demand",
    lead: "u-eleanor",
    team: ["u-eleanor", "u-rosa"],
    openedDaysAgo: 24,
    fee: "contingency",
    amount: 140000,
    deadline: [6, "File notice of claim with the city"],
    opposing: ["Metro Transit Authority"],
  },
  {
    key: "mensah",
    client: "mensah",
    title: "Mensah v. Whitlock — Custody Enforcement",
    area: "family-law",
    status: "open",
    stage: "filing",
    lead: "u-priya",
    team: ["u-priya"],
    openedDaysAgo: 28,
    fee: "hourly",
    amount: 8000,
    deadline: [15, "Enforcement hearing"],
    opposing: ["Dana Whitlock"],
    related: ["Ama Mensah (child)"],
  },
  {
    key: "hayes",
    client: "hayes",
    title: "Estate of Gerald Hayes",
    area: "estate-planning",
    status: "open",
    stage: "drafting",
    lead: "u-sofia",
    team: ["u-sofia", "u-rosa"],
    openedDaysAgo: 32,
    fee: "flat",
    amount: 7500,
    deadline: [20, "File estate inventory with probate court"],
    opposing: [],
    related: ["Gerald Hayes (decedent)", "Paul Hayes", "Irene Hayes-Ford"],
  },
  {
    key: "quillstone",
    client: "marsh",
    title: "Quillstone Software — Seed Financing",
    area: "business-law",
    status: "pending",
    stage: "negotiation",
    lead: "u-marcus",
    team: ["u-marcus"],
    openedDaysAgo: 36,
    fee: "hourly",
    amount: 22000,
    deadline: [24, "Investor comments on purchase agreement"],
    opposing: ["Lattice Peak Ventures"],
    related: ["Quillstone Software Inc."],
  },
  {
    key: "vance",
    client: "vance",
    title: "Vance v. Brightwarm Appliances",
    area: "personal-injury",
    status: "open",
    stage: "investigation",
    lead: "u-james",
    team: ["u-james"],
    openedDaysAgo: 40,
    fee: "contingency",
    amount: 210000,
    deadline: [16, "Send heater for independent testing"],
    opposing: ["Brightwarm Appliances", "Kessler Home Goods (retailer)"],
  },
  {
    key: "johnson",
    client: "johnson",
    title: "Johnson v. Bramble",
    area: "personal-injury",
    status: "open",
    stage: "demand",
    lead: "u-daniel",
    team: ["u-daniel", "u-rosa"],
    openedDaysAgo: 45,
    fee: "contingency",
    amount: 120000,
    deadline: [2, "Send demand letter"],
    opposing: ["Curtis Bramble", "Harborline Insurance"],
  },
  {
    key: "lindqvist",
    client: "lindqvist",
    title: "In re Marriage of Lindqvist",
    area: "family-law",
    status: "open",
    stage: "mediation",
    lead: "u-priya",
    team: ["u-priya", "u-rosa"],
    openedDaysAgo: 51,
    fee: "hourly",
    amount: 18000,
    deadline: [21, "Mediation session"],
    opposing: ["Erik Lindqvist"],
    related: ["Nora Lindqvist (child)"],
  },
];

/** One line per stage, used for the matter timeline. */
const stageUpdates: Record<string, string> = {
  intake:
    "Engagement letter signed and conflict check cleared. File opened and initial documents requested.",
  investigation:
    "Gathering records, photos and witness statements. Insurance claims opened with all carriers.",
  demand:
    "Demand package prepared with medical records, bills and lost wages, and sent to the insurer.",
  negotiation:
    "The other side has responded. We're reviewing the offer and preparing a counter.",
  litigation:
    "Complaint filed and served. Discovery is under way and depositions are being scheduled.",
  resolution: "Case resolved. Final paperwork and disbursement in progress.",
  filing:
    "Petition and supporting papers filed with the court and served on the other party.",
  discovery:
    "Exchanging financial disclosures and documents with the other side.",
  mediation:
    "Mediation scheduled. We've prepared a settlement proposal for review.",
  hearing: "Hearing date set. Preparing exhibits and witness outlines.",
  final_order:
    "The court entered the final order. Copies sent to the client for their records.",
  drafting: "First drafts prepared from the intake questionnaire.",
  client_review: "Drafts sent to the client for review and comments.",
  signing: "Signing meeting held; documents executed and notarized.",
  funding: "Retitling accounts and property into the trust.",
  complete: "All documents finalized and originals delivered to the client.",
  review: "Reviewing existing documents, filings and risks.",
  execution: "Final agreements signed by all parties.",
  closed: "Matter closed. Final documents delivered to the client.",
  arraignment: "Client arraigned and entered a plea of not guilty.",
  pretrial: "Pretrial motions being prepared and filed.",
  trial: "Trial date set. Preparing witnesses and exhibits.",
};

const taskTemplates: Record<PracticeAreaSlug, string[]> = {
  "personal-injury": [
    "Request updated medical records",
    "Calculate lost wages",
    "Follow up with adjuster",
  ],
  "family-law": [
    "Prepare financial disclosure",
    "Draft parenting plan",
    "Schedule client prep call",
  ],
  "estate-planning": [
    "Confirm beneficiary designations",
    "Prepare signing checklist",
    "Order certified copies",
  ],
  "business-law": [
    "Review redlines from other side",
    "Update cap table summary",
    "Prepare closing checklist",
  ],
  "criminal-defense": [
    "Review discovery from prosecutor",
    "Interview defense witnesses",
    "Prepare client for hearing",
  ],
};

/** Maria's dates match the client portal preview on the home page. */
const delgadoUpdates = (now: Date): MatterUpdate[] => [
  {
    id: "delgado-u1",
    createdAt: past(now, 72, 10),
    authorId: "u-daniel",
    title: "Intake",
    body: stageUpdates.intake,
    shared: true,
  },
  {
    id: "delgado-u2",
    createdAt: past(now, 56, 14),
    authorId: "u-rosa",
    title: "Investigation",
    body: "Police report, crash photos and medical records collected. Claim opened with Keystone Casualty.",
    shared: true,
  },
  {
    id: "delgado-u3",
    createdAt: past(now, 23, 11),
    authorId: "u-daniel",
    title: "Demand sent",
    body: "Demand letter sent to Keystone Casualty with medical bills, records and lost wages.",
    shared: true,
  },
  {
    id: "delgado-u4",
    createdAt: past(now, 0, 7, 30),
    authorId: "u-daniel",
    title: "Negotiation",
    body: "The insurer responded to our demand with an initial offer. We'll review it together before responding.",
    shared: true,
  },
];

function buildUpdates(def: MatterDef, now: Date): MatterUpdate[] {
  const stages = matterStages[def.area];
  const current = stages.findIndex((s) => s.key === def.stage);
  const span = Math.max(def.openedDaysAgo - 2, 1);
  return stages.slice(0, current + 1).map((stage, i) => ({
    id: `${def.key}-u${i + 1}`,
    createdAt: past(
      now,
      Math.round(def.openedDaysAgo - (span * i) / Math.max(current, 1)),
      10 + (i % 5),
    ),
    authorId: i % 2 === 0 ? def.lead : (def.team[1] ?? def.lead),
    title: stage.label,
    body: stageUpdates[stage.key] ?? "",
    shared: true,
  }));
}

function buildTasks(def: MatterDef, now: Date): MatterTask[] {
  if (def.status === "closed") return [];
  return taskTemplates[def.area].map((title, i) => ({
    id: `${def.key}-t${i + 1}`,
    title,
    dueAt: at(now, i * 5 - 2, 17),
    assigneeId: def.team[i % def.team.length],
    done: i === 0,
    priority: (["high", "medium", "low"] as const)[(i + def.key.length) % 3],
  }));
}

/**
 * A fictional hard deadline: two years from the incident for injury
 * claims, a speedy-trial date for criminal cases.
 */
function limitationsDate(def: MatterDef, now: Date) {
  if (def.status === "closed") return undefined;
  if (def.area === "personal-injury")
    return at(now, 2 * 365 - def.openedDaysAgo - 21, 17);
  if (def.area === "criminal-defense")
    return at(now, 70 - Math.min(def.openedDaysAgo, 60), 17);
  return undefined;
}

/** Clients who were sent a portal invite but haven't signed in yet. */
const invited = ["pham", "albright", "cole", "sinclair"];

export type MatterSeed = { clients: Client[]; matters: Matter[] };

export function buildClientsAndMatters(now: Date, leads: Lead[]): MatterSeed {
  const defs: (ClientDef & { leadId?: string })[] = [
    ...olderClients,
    ...leads
      .filter((lead) => lead.status === "retained")
      .map((lead) => {
        const name = `${lead.firstName} ${lead.lastName}`;
        const extra = retainedClients[name];
        if (!extra) throw new Error(`No client seed for ${name}`);
        return {
          ...extra,
          name,
          email: lead.email,
          spanish: lead.language === "Spanish",
          leadId: lead.id,
        };
      }),
  ];

  // Number matters in the order they were opened. Maria's is fixed
  // because the portal preview and her demo account use it.
  const ordered = [...matterDefs].sort(
    (a, b) => b.openedDaysAgo - a.openedDaysAgo,
  );
  const fixed = ordered.findIndex((d) => d.key === "delgado");
  const numbers = new Map(
    ordered.map((def, i) => {
      if (def.key === "delgado") return [def.key, "M-2026-0142"];
      const year = new Date(past(now, def.openedDaysAgo)).getFullYear();
      const seq = 142 + (i - fixed) * 4 + ((i * 7) % 3);
      return [def.key, `M-${year}-${String(seq).padStart(4, "0")}`];
    }),
  );

  const matters: Matter[] = matterDefs.map((def) => {
    const id = numbers.get(def.key) ?? def.key;
    const isDelgado = def.key === "delgado";
    return {
      id,
      title: def.title,
      clientId: `cl-${def.client}`,
      practiceArea: def.area,
      status: def.status,
      stage: def.stage,
      leadAttorneyId: def.lead,
      team: def.team,
      openedAt: past(now, def.openedDaysAgo, 10),
      nextDeadline: def.deadline && {
        date: at(now, def.deadline[0], 17),
        label: def.deadline[1],
      },
      nextAppointment: isDelgado
        ? {
            start: at(now, 14, 10),
            type: "video",
            label: "Review the settlement offer",
          }
        : undefined,
      limitationsDate: limitationsDate(def, now),
      feeType: def.fee,
      budget: def.fee === "contingency" ? undefined : def.amount,
      estimatedValue: def.fee === "contingency" ? def.amount : undefined,
      tasks: buildTasks(def, now),
      updates: isDelgado ? delgadoUpdates(now) : buildUpdates(def, now),
      opposingParties: def.opposing,
      relatedParties: def.related ?? [],
    };
  });

  const clients: Client[] = defs.map((def, i) => {
    const own = matters.filter((m) => m.clientId === `cl-${def.key}`);
    const since = own
      .map((m) => m.openedAt)
      .sort()
      .at(0);
    return {
      id: `cl-${def.key}`,
      name: def.name,
      email:
        def.email ??
        `${def.name.split(" ").join(".").toLowerCase()}@example.com`,
      phone: `(555) 555-${String(2300 + i * 53).slice(-4)}`,
      address: def.address,
      language: def.spanish ? "Spanish" : "English",
      since: since ?? past(now, 30),
      matters: own.map((m) => m.id),
      trustBalance: def.trust,
      leadId: def.leadId,
      portalStatus:
        def.key === "delgado"
          ? "active"
          : invited.includes(def.key)
            ? "invited"
            : i % 3 === 0
              ? "active"
              : "not_invited",
      preferredContact: (["email", "phone", "text"] as const)[i % 3],
      notes:
        def.key === "delgado"
          ? [
              {
                id: "delgado-note-1",
                createdAt: past(now, 12, 15),
                author: "Rosa Medina",
                authorId: "u-rosa",
                body: "Prefers Spanish for phone calls; email is fine in English. Best reached after 5 PM.",
              },
            ]
          : [],
    };
  });

  return { clients, matters };
}
