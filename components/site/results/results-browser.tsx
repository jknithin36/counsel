import { FilterTabs } from "@/components/site/filter-tabs";
import { resultsPage as copy } from "@/lib/content/pages";
import {
  getPracticeArea,
  type PracticeAreaSlug,
  practiceAreas,
} from "@/lib/content/practice-areas";
import { type CaseResult, resultValue } from "@/lib/content/results";
import { cn } from "@/lib/utils";

export type ResultsFilter = "all" | PracticeAreaSlug;

const tabs = [
  { key: "all", label: copy.all, href: "/results" },
  ...practiceAreas.map((a) => ({
    key: a.slug,
    label: a.title,
    href: `/results?area=${a.slug}`,
  })),
];

function Cell({ result, dark }: { result: CaseResult; dark?: boolean }) {
  return (
    <li
      className={cn(
        "flex flex-col border-t border-l p-9",
        dark ? "border-white/12" : "border-border",
      )}
    >
      <p
        className={cn(
          "text-[13px]",
          dark ? "text-white/50" : "text-muted-foreground",
        )}
      >
        {getPracticeArea(result.area)?.title} · {result.year}
      </p>
      <p
        className={cn(
          "mt-4 font-serif leading-none tracking-[-0.02em]",
          dark ? "text-[52px] text-white" : "text-[40px] text-[#111]",
        )}
      >
        {result.amount}
      </p>
      <span
        className={cn(
          "mt-5 self-start rounded-full border px-2.5 py-1 text-[12px] leading-none",
          dark
            ? "border-white/20 text-white/70"
            : "border-border text-muted-foreground",
        )}
      >
        {result.type}
      </span>
      <p
        className={cn(
          "mt-4 text-[15px] leading-[1.6]",
          dark ? "text-white/70" : "text-[#3a3a3a]",
        )}
      >
        {result.summary}
      </p>
    </li>
  );
}

/** Tabs, the 3 largest results on dark, then the rest on white. */
export function ResultsBrowser({
  results,
  active,
}: {
  results: CaseResult[];
  active: ResultsFilter;
}) {
  const filtered =
    active === "all" ? results : results.filter((r) => r.area === active);
  const byValue = [...filtered].sort((a, b) => resultValue(b) - resultValue(a));
  const featured = byValue.slice(0, 3);
  const rest = filtered.filter((r) => !featured.includes(r));

  return (
    <>
      <FilterTabs label={copy.filterLabel} tabs={tabs} active={active} />

      {filtered.length === 0 ? (
        <p className="mt-12 text-[17px] text-muted-foreground">{copy.empty}</p>
      ) : (
        <>
          <h2 className="sr-only">{copy.featured}</h2>
          <div className="mt-12 overflow-hidden rounded-[10px] bg-ink">
            <ul className="-mt-px -ml-px grid md:grid-cols-2 lg:grid-cols-3">
              {featured.map((r) => (
                <Cell key={r.id} result={r} dark />
              ))}
            </ul>
          </div>

          {rest.length > 0 && (
            <>
              <h2 className="mt-16 text-[28px] text-[#111]">{copy.more}</h2>
              <ul className="mt-8 grid border-r border-b border-border md:grid-cols-2 lg:grid-cols-3">
                {rest.map((r) => (
                  <Cell key={r.id} result={r} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </>
  );
}
