import type { ReactNode } from "react";
import { FilterTabs } from "@/components/site/filter-tabs";
import { practiceAreasPage as copy } from "@/lib/content/pages";

export type FilterKey = "all" | "individuals" | "business";

export type AreaCard = {
  slug: string;
  audience: string[];
  node: ReactNode;
};

const tabs = copy.filters.map((f) => ({
  ...f,
  href: f.key === "all" ? "/practice-areas" : `/practice-areas?for=${f.key}`,
}));

/** Tabs + card grid. Rendered by the server (all) and the client (filtered). */
export function PracticeAreaGrid({
  cards,
  active,
}: {
  cards: AreaCard[];
  active: FilterKey;
}) {
  const visible =
    active === "all" ? cards : cards.filter((c) => c.audience.includes(active));

  return (
    <>
      <FilterTabs label={copy.filterLabel} tabs={tabs} active={active} />
      <ul className="mt-12 grid gap-x-8 gap-y-16 lg:grid-cols-2">
        {visible.map((card) => (
          <li key={card.slug}>{card.node}</li>
        ))}
      </ul>
    </>
  );
}
