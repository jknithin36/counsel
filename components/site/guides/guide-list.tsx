import type { ReactNode } from "react";
import { FilterTabs } from "@/components/site/filter-tabs";
import { resourcesPage as copy } from "@/lib/content/pages";
import { practiceAreas } from "@/lib/content/practice-areas";

export type GuideItem = {
  slug: string;
  area: string;
  featured: ReactNode;
  card: ReactNode;
};

const tabs = [
  { key: "all", label: copy.all, href: "/resources" },
  ...practiceAreas.map((a) => ({
    key: a.slug,
    label: a.title,
    href: `/resources?area=${a.slug}`,
  })),
];

/** Tabs, the first matching guide as a feature, then a 3-column grid. */
export function GuideList({
  items,
  active,
}: {
  items: GuideItem[];
  active: string;
}) {
  const visible =
    active === "all" ? items : items.filter((i) => i.area === active);
  const [first, ...rest] = visible;

  return (
    <>
      <FilterTabs label={copy.filterLabel} tabs={tabs} active={active} />
      {!first ? (
        <p className="mt-12 text-[17px] text-muted-foreground">{copy.empty}</p>
      ) : (
        <>
          <div className="mt-12">{first.featured}</div>
          {rest.length > 0 && (
            <ul className="mt-20 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((item) => (
                <li key={item.slug}>{item.card}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
