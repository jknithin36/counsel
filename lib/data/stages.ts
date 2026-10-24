import type { PracticeAreaSlug } from "@/lib/content/practice-areas";

/** Matter stages per practice area, in order. */
export const matterStages: Record<
  PracticeAreaSlug,
  { key: string; label: string }[]
> = {
  "personal-injury": [
    { key: "intake", label: "Intake" },
    { key: "investigation", label: "Investigation" },
    { key: "demand", label: "Demand" },
    { key: "negotiation", label: "Negotiation" },
    { key: "litigation", label: "Litigation" },
    { key: "resolution", label: "Resolution" },
  ],
  "family-law": [
    { key: "intake", label: "Intake" },
    { key: "filing", label: "Filing" },
    { key: "discovery", label: "Discovery" },
    { key: "mediation", label: "Mediation" },
    { key: "hearing", label: "Hearing" },
    { key: "final_order", label: "Final order" },
  ],
  "estate-planning": [
    { key: "intake", label: "Intake" },
    { key: "drafting", label: "Drafting" },
    { key: "client_review", label: "Client review" },
    { key: "signing", label: "Signing" },
    { key: "funding", label: "Trust funding" },
    { key: "complete", label: "Complete" },
  ],
  "business-law": [
    { key: "intake", label: "Intake" },
    { key: "review", label: "Review" },
    { key: "drafting", label: "Drafting" },
    { key: "negotiation", label: "Negotiation" },
    { key: "execution", label: "Execution" },
    { key: "closed", label: "Closed" },
  ],
  "criminal-defense": [
    { key: "intake", label: "Intake" },
    { key: "arraignment", label: "Arraignment" },
    { key: "discovery", label: "Discovery" },
    { key: "pretrial", label: "Pretrial motions" },
    { key: "trial", label: "Trial" },
    { key: "resolution", label: "Resolution" },
  ],
};

export function stageLabel(area: PracticeAreaSlug, key: string) {
  return matterStages[area].find((stage) => stage.key === key)?.label ?? key;
}
