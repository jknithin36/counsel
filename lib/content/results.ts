import type { PracticeAreaSlug } from "@/lib/content/practice-areas";

/** Fictional case results for the demo firm. */
export type CaseResult = {
  id: string;
  amount: string;
  type: "Settlement" | "Verdict" | "Outcome" | "Recovered" | "Estate";
  area: PracticeAreaSlug;
  summary: string;
  year: number;
  /** Slug from lib/content/attorneys.ts */
  attorney: string;
  /** Shown in the home page grid. */
  featured?: boolean;
};

export const resultsDisclaimer =
  "Past results do not guarantee a similar outcome. Each case depends on its own facts.";

export const caseResults: CaseResult[] = [
  {
    id: "truck-collision",
    year: 2025,
    attorney: "eleanor-calloway",
    amount: "$2.4M",
    type: "Settlement",
    area: "personal-injury",
    summary:
      "Commercial truck collision on a highway on-ramp. Client suffered spinal injuries.",
    featured: true,
  },
  {
    id: "workplace-wrongful-death",
    year: 2024,
    attorney: "eleanor-calloway",
    amount: "$1.1M",
    type: "Settlement",
    area: "personal-injury",
    summary:
      "Wrongful death claim on behalf of a family after a workplace accident.",
    featured: true,
  },
  {
    id: "felony-dui-dismissed",
    year: 2025,
    attorney: "daniel-reyes",
    amount: "Dismissed",
    type: "Outcome",
    area: "criminal-defense",
    summary:
      "Felony DUI charges dismissed after we challenged the traffic stop and test results.",
    featured: true,
  },
  {
    id: "contested-custody",
    year: 2024,
    attorney: "priya-raman",
    amount: "Full custody",
    type: "Outcome",
    area: "family-law",
    summary:
      "Primary custody awarded to our client after a contested two-year case.",
    featured: true,
  },
  {
    id: "contract-arbitration",
    year: 2025,
    attorney: "marcus-bell",
    amount: "$680K",
    type: "Recovered",
    area: "business-law",
    summary:
      "Unpaid contract balance recovered for a manufacturing client through arbitration.",
    featured: true,
  },
  {
    id: "contested-trust",
    year: 2023,
    attorney: "sofia-alvarez",
    amount: "$3.2M",
    type: "Estate",
    area: "estate-planning",
    summary:
      "Contested trust resolved and assets distributed according to the client's wishes.",
    featured: true,
  },
  {
    id: "slip-and-fall",
    year: 2025,
    attorney: "james-whitaker",
    amount: "$425K",
    type: "Settlement",
    area: "personal-injury",
    summary:
      "Fall at a retail store caused by an unmarked wet floor. Client needed knee surgery.",
  },
  {
    id: "drug-charges-reduced",
    year: 2024,
    attorney: "daniel-reyes",
    amount: "Reduced",
    type: "Outcome",
    area: "criminal-defense",
    summary:
      "Felony possession charge reduced to a misdemeanor with no jail time.",
  },
  {
    id: "mediated-divorce",
    year: 2025,
    attorney: "priya-raman",
    amount: "Settled",
    type: "Outcome",
    area: "family-law",
    summary:
      "Divorce with a family business resolved through mediation in under five months.",
  },
  {
    id: "partnership-buyout",
    year: 2024,
    attorney: "marcus-bell",
    amount: "$1.4M",
    type: "Recovered",
    area: "business-law",
    summary:
      "Fair buyout secured for a minority partner pushed out of a growing company.",
  },
  {
    id: "probate-completed",
    year: 2025,
    attorney: "sofia-alvarez",
    amount: "9 months",
    type: "Estate",
    area: "estate-planning",
    summary:
      "Out-of-state probate completed for a family without a single court hearing.",
  },
  {
    id: "rear-end-verdict",
    year: 2023,
    attorney: "eleanor-calloway",
    amount: "$1.8M",
    type: "Verdict",
    area: "personal-injury",
    summary:
      "Jury verdict for a driver left with a permanent shoulder injury after the insurer refused to settle.",
  },
  {
    id: "assault-acquittal",
    year: 2023,
    attorney: "daniel-reyes",
    amount: "Not guilty",
    type: "Verdict",
    area: "criminal-defense",
    summary:
      "Acquittal at trial on an assault charge after we showed our client acted in self-defense.",
  },
  {
    id: "relocation-custody",
    year: 2025,
    attorney: "priya-raman",
    amount: "Relocation approved",
    type: "Outcome",
    area: "family-law",
    summary:
      "Court approved a parent's move for a new job, with a long-distance parenting plan that kept both parents involved.",
  },
  {
    id: "vendor-dispute",
    year: 2025,
    attorney: "marcus-bell",
    amount: "$310K",
    type: "Recovered",
    area: "business-law",
    summary:
      "Defective-goods claim against a supplier settled before trial, covering replacement costs and lost orders.",
  },
];

export const featuredResults = caseResults.filter((r) => r.featured);

export function resultsByIds(ids: string[]) {
  return ids
    .map((id) => caseResults.find((r) => r.id === id))
    .filter((r): r is CaseResult => Boolean(r));
}

/** "$2.4M" -> 2400000, "$680K" -> 680000; non-monetary outcomes -> 0. */
export function resultValue(result: CaseResult) {
  const match = result.amount.match(/^\$([\d.]+)([KM])?/);
  if (!match) return 0;
  const n = Number(match[1]);
  return match[2] === "M" ? n * 1_000_000 : match[2] === "K" ? n * 1_000 : n;
}
