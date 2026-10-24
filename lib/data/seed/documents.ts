import type { PracticeAreaSlug } from "@/lib/content/practice-areas";
import type {
  DocumentCategory,
  DocumentStatus,
  Matter,
  MatterDocument,
} from "../types";
import { past } from "./time";

type DocTemplate = [
  name: string,
  type: MatterDocument["type"],
  category: DocumentCategory,
];

const templates: Record<PracticeAreaSlug, DocTemplate[]> = {
  "personal-injury": [
    ["Police report", "pdf", "police"],
    ["Medical records", "pdf", "medical"],
    ["Photos of the scene", "image", "other"],
    ["Medical bills summary", "spreadsheet", "medical"],
  ],
  "family-law": [
    ["Financial affidavit", "pdf", "court"],
    ["Proposed parenting plan", "docx", "court"],
    ["Current court order", "pdf", "court"],
    ["Monthly expense worksheet", "spreadsheet", "other"],
  ],
  "estate-planning": [
    ["Asset inventory", "spreadsheet", "other"],
    ["Draft revocable trust", "docx", "contract"],
    ["Pour-over will", "pdf", "contract"],
    ["Durable power of attorney", "pdf", "contract"],
  ],
  "business-law": [
    ["Draft agreement", "docx", "contract"],
    ["Articles of organization", "pdf", "court"],
    ["Redline from other side", "docx", "correspondence"],
    ["Signature page", "pdf", "contract"],
  ],
  "criminal-defense": [
    ["Charging document", "pdf", "court"],
    ["Discovery from prosecutor", "pdf", "court"],
    ["Witness statement", "docx", "correspondence"],
    ["Bond paperwork", "pdf", "court"],
  ],
};

const openStatuses: DocumentStatus[] = [
  "uploaded",
  "reviewed",
  "requested",
  "sent_for_signature",
  "signed",
  "reviewed",
];

/** Maria's documents; two wait for her signature, as in the portal preview. */
function delgadoDocs(now: Date, matter: Matter): MatterDocument[] {
  const doc = (
    n: number,
    name: string,
    type: MatterDocument["type"],
    uploadedBy: string,
    daysAgo: number,
    status: DocumentStatus,
    category: DocumentCategory = "other",
  ): MatterDocument => ({
    id: `DOC-${matter.id}-${n}`,
    matterId: matter.id,
    name,
    type,
    uploadedBy,
    uploadedAt: past(now, daysAgo, 11 + n),
    status,
    category,
  });
  return [
    doc(1, "Police crash report", "pdf", "u-rosa", 68, "reviewed", "police"),
    doc(
      2,
      "Photos of vehicle damage",
      "image",
      matter.clientId,
      66,
      "reviewed",
      "other",
    ),
    doc(
      3,
      "Medical records — St. Brigid Medical Center",
      "pdf",
      "u-rosa",
      50,
      "reviewed",
      "medical",
    ),
    doc(
      4,
      "Pay stubs (lost wages)",
      "pdf",
      matter.clientId,
      11,
      "reviewed",
      "other",
    ),
    doc(
      5,
      "Demand letter to Keystone Casualty",
      "pdf",
      "u-daniel",
      23,
      "reviewed",
      "correspondence",
    ),
    doc(
      6,
      "Settlement authorization",
      "pdf",
      "u-daniel",
      1,
      "sent_for_signature",
      "contract",
    ),
    doc(
      7,
      "Medical records release (HIPAA)",
      "pdf",
      "u-rosa",
      1,
      "sent_for_signature",
      "medical",
    ),
  ];
}

/** 60 documents: Maria's seven, then one or two per other matter. */
export function buildDocuments(now: Date, matters: Matter[]): MatterDocument[] {
  const docs: MatterDocument[] = [];
  let count = 0;
  for (const matter of matters) {
    if (matter.id === "M-2026-0142") {
      docs.push(...delgadoDocs(now, matter));
      continue;
    }
    const opened = Math.round(
      (now.getTime() - new Date(matter.openedAt).getTime()) / 864e5,
    );
    const perMatter = count === 0 ? 1 : 2;
    for (let n = 0; n < perMatter; n++) {
      const [name, type, category] = templates[matter.practiceArea][
        (count + n) % 4
      ] ?? ["Document", "pdf", "other"];
      const status: DocumentStatus =
        matter.status === "closed"
          ? "signed"
          : openStatuses[(count * 2 + n) % openStatuses.length];
      const fromClient = status === "uploaded" || n === 1;
      docs.push({
        id: `DOC-${matter.id}-${n + 1}`,
        matterId: matter.id,
        name,
        type,
        category,
        uploadedBy: fromClient
          ? matter.clientId
          : matter.team[n % matter.team.length],
        uploadedAt: past(
          now,
          Math.max(Math.round(opened * (n === 0 ? 0.8 : 0.3)), 0),
          10 + n * 3,
          (count * 13) % 60,
        ),
        status,
      });
    }
    count++;
  }
  return docs;
}
