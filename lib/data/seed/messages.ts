import type { Client, Matter, Message, MessageThread } from "../types";
import { past } from "./time";

/** [author ("client" or a user id), body, days ago, hour, read by the other side] */
type Line = [string, string, number, number, boolean];

const delgado: Line[] = [
  [
    "client",
    "Hi Daniel, the adjuster from Keystone called me again today asking about my physical therapy. Should I talk to them?",
    20,
    10,
    true,
  ],
  [
    "u-daniel",
    "Please don't speak with them directly. Refer any calls to our office and I'll remind them that all communication goes through us.",
    20,
    11,
    true,
  ],
  [
    "u-rosa",
    "Hi Maria, could you upload your last two pay stubs? We need them for the lost wages part of your claim.",
    12,
    9,
    true,
  ],
  [
    "client",
    "I just uploaded both. Let me know if you need anything else.",
    11,
    18,
    true,
  ],
  ["u-rosa", "Got them, thank you. Everything looks good.", 11, 19, true],
  ["client", "Any word from the insurance company yet?", 3, 12, true],
  [
    "u-rosa",
    "I've sent you two documents to sign electronically: the settlement authorization and a medical records release.",
    1,
    15,
    false,
  ],
  [
    "u-daniel",
    "The insurer responded to our demand letter. Let's review their offer together on Thursday.",
    0,
    -2,
    false,
  ],
];

/** Shorter threads on other matters, keyed by matter title. */
const others: Record<string, { subject: string; lines: Line[] }> = {
  "Pham v. Westbrook Apartments": {
    subject: "Deposition prep",
    lines: [
      [
        "u-james",
        "Your deposition is confirmed. Can we meet the week before to prepare?",
        6,
        10,
        true,
      ],
      [
        "client",
        "Yes, Tuesday or Wednesday afternoon works for me.",
        6,
        16,
        true,
      ],
      [
        "u-james",
        "Wednesday at 2:00 PM it is. Rosa will send a calendar invite.",
        5,
        9,
        true,
      ],
    ],
  },
  "State v. Castillo": {
    subject: "Hearing next week",
    lines: [
      [
        "u-daniel",
        "We're filing the motion to suppress this week. I'll send you a copy once it's filed.",
        4,
        11,
        true,
      ],
      [
        "client",
        "Thank you. Do I need to be in court for the motion hearing?",
        0,
        -3,
        false,
      ],
    ],
  },
  "Lin v. Lin — Custody Modification": {
    subject: "Financial affidavit",
    lines: [
      [
        "u-priya",
        "We still need your updated financial affidavit. The court deadline has passed, so please send it today if you can.",
        1,
        9,
        true,
      ],
      ["client", "So sorry, I'll have it to you by tonight.", 1, 13, true],
    ],
  },
  "Hollis Consulting — Partnership Dissolution": {
    subject: "Buyout proposal",
    lines: [
      [
        "u-marcus",
        "Graham's attorney sent a buyout proposal. It values the firm about 20% below our estimate.",
        2,
        10,
        true,
      ],
      [
        "client",
        "That's lower than I expected. Can we talk through a counteroffer?",
        0,
        -5,
        false,
      ],
    ],
  },
  "Cole v. Blue Mesa Logistics": {
    subject: "Medical records",
    lines: [
      [
        "u-rosa",
        "Welcome aboard, Nathan. Could you send us a list of every doctor and clinic you've seen since the crash?",
        8,
        10,
        true,
      ],
      [
        "client",
        "Attached the list. My physical therapist is the one I see most.",
        7,
        17,
        true,
      ],
    ],
  },
  "In re Marriage of Okafor": {
    subject: "Response to petition",
    lines: [
      [
        "u-priya",
        "Our response to the petition is due tomorrow. I'll send the final draft for your review this afternoon.",
        0,
        -6,
        true,
      ],
      [
        "client",
        "Thanks Priya. I'll read it as soon as it arrives.",
        0,
        -4,
        false,
      ],
    ],
  },
  "Lumen Botanics — Formation & Operating Agreement": {
    subject: "Operating agreement questions",
    lines: [
      [
        "client",
        "Ava and I want to split ownership 60/40. Does that change how voting works?",
        5,
        12,
        true,
      ],
      [
        "u-marcus",
        "Not automatically. We can keep major decisions unanimous even with a 60/40 split. I'll add options to the draft.",
        5,
        15,
        true,
      ],
    ],
  },
  "Sinclair v. Metro Transit Authority": {
    subject: "Notice of claim",
    lines: [
      [
        "u-eleanor",
        "We're filing the notice of claim with the city this week, well ahead of the deadline.",
        3,
        9,
        true,
      ],
      [
        "client",
        "That's a relief. Is there anything else you need from me?",
        3,
        14,
        true,
      ],
      [
        "u-eleanor",
        "Just your surgeon's follow-up notes when you have them.",
        2,
        10,
        true,
      ],
    ],
  },
  "In re Marriage of Lindqvist": {
    subject: "Mediation",
    lines: [
      [
        "u-priya",
        "Mediation is set. I'll send a short summary of our proposal before then.",
        9,
        11,
        true,
      ],
      [
        "client",
        "Could we also talk about the summer schedule for Nora?",
        0,
        -1,
        false,
      ],
    ],
  },
};

function toMessages(
  now: Date,
  lines: Line[],
  clientUserId: string,
  prefix: string,
): Message[] {
  return lines.map(([author, body, daysAgo, hour, read], i) => ({
    id: `${prefix}-m${i + 1}`,
    authorId: author === "client" ? clientUserId : author,
    body,
    // A negative hour means "this many hours ago" today.
    sentAt:
      hour < 0
        ? new Date(now.getTime() + hour * 3_600_000).toISOString()
        : past(now, daysAgo, hour, (i * 11) % 60),
    read,
  }));
}

export function buildThreads(
  now: Date,
  matters: Matter[],
  clients: Client[],
): MessageThread[] {
  const threads: MessageThread[] = [];
  for (const matter of matters) {
    const client = clients.find((c) => c.id === matter.clientId);
    if (!client) continue;
    const isDelgado = matter.id === "M-2026-0142";
    const other = others[matter.title];
    if (!isDelgado && !other) continue;
    const id = `TH-${matter.id}`;
    threads.push({
      id,
      matterId: matter.id,
      clientId: client.id,
      subject: isDelgado ? "Your case" : (other?.subject ?? ""),
      // Maria has a real login; other clients are represented by their id.
      messages: toMessages(
        now,
        isDelgado ? delgado : (other?.lines ?? []),
        isDelgado ? "u-maria" : client.id,
        id,
      ),
    });
  }
  return threads;
}
