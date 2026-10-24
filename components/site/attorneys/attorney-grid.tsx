import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { attorneysPage as copy } from "@/lib/content/pages";
import type { PracticeAreaSlug } from "@/lib/content/practice-areas";
import { cn } from "@/lib/utils";

export type AttorneyCardItem = {
  slug: string;
  practiceAreas: PracticeAreaSlug[];
  speaksSpanish: boolean;
  node: ReactNode;
};

export type AttorneyFilters = {
  practice: "all" | PracticeAreaSlug;
  language: "all" | "spanish";
};

function filterHref(filters: AttorneyFilters) {
  const params = new URLSearchParams();
  if (filters.practice !== "all") params.set("practice", filters.practice);
  if (filters.language !== "all") params.set("language", filters.language);
  const query = params.toString();
  return query ? `/attorneys?${query}` : "/attorneys";
}

export function AttorneyGrid({
  cards,
  filters,
  practiceTabs,
}: {
  cards: AttorneyCardItem[];
  filters: AttorneyFilters;
  practiceTabs: { key: AttorneyFilters["practice"]; label: string }[];
}) {
  const visible = cards.filter(
    (card) =>
      (filters.practice === "all" ||
        card.practiceAreas.includes(filters.practice)) &&
      (filters.language === "all" || card.speaksSpanish),
  );

  return (
    <>
      <div className="flex flex-col gap-8">
        <nav aria-label={copy.areaFilterLabel}>
          <ul className="flex flex-wrap gap-2">
            {practiceTabs.map((tab) => {
              const current = filters.practice === tab.key;
              return (
                <li key={tab.key}>
                  <Link
                    href={filterHref({ ...filters, practice: tab.key })}
                    scroll={false}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "inline-flex min-h-10 items-center rounded-full border px-4 text-[14px] font-medium transition-colors",
                      current
                        ? "border-[#111] bg-[#111] text-white"
                        : "border-border bg-white text-[#3a3a3a] hover:border-[#111] hover:text-[#111]",
                    )}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav aria-label={copy.languageFilterLabel}>
          <ul className="inline-flex rounded-full bg-surface p-1">
            {(
              [
                { key: "all", label: copy.all },
                { key: "spanish", label: copy.speaksSpanish },
              ] as const
            ).map((tab) => {
              const current = filters.language === tab.key;
              return (
                <li key={tab.key}>
                  <Link
                    href={filterHref({ ...filters, language: tab.key })}
                    scroll={false}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "inline-flex min-h-9 items-center rounded-full px-4 text-[13px] font-medium transition-colors",
                      current
                        ? "bg-white text-[#111] shadow-sm"
                        : "text-muted-foreground hover:text-[#111]",
                    )}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {visible.length > 0 ? (
        <ul className="mt-12 grid gap-x-7 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((card) => (
            <li key={card.slug}>{card.node}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-12 rounded-[10px] bg-surface px-6 py-16 text-center">
          <p className="font-serif text-[28px] text-[#111]">{copy.empty}</p>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/attorneys" scroll={false} />}
            className="mt-6"
          >
            {copy.clear}
          </Button>
        </div>
      )}
    </>
  );
}
