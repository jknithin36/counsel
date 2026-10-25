"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { caseResultsSection as s } from "@/lib/content/home";
import { usePracticeAreas, useResults } from "@/lib/site-content";

export function CaseResults() {
  const { items, disclaimer } = useResults();
  const areas = usePracticeAreas();
  const featured = items.filter((r) => r.featured);
  return (
    <section
      data-nav-theme="dark"
      className="bg-ink py-[88px] text-white lg:py-[140px]"
    >
      <div className="container-page">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div>
              <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-white/50">
                {s.eyebrow}
              </p>
              <h2 className="mt-4 max-w-[620px] text-[clamp(2.25rem,4vw,3.75rem)]">
                {s.heading}
              </h2>
            </div>
            <div className="flex max-w-[380px] flex-col items-start gap-6">
              <p className="text-[17px] leading-[1.6] text-white/65">
                {s.subtext}
              </p>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href={s.cta.href} />}
                className="border-white text-white hover:bg-white/10"
              >
                {s.cta.label}
              </Button>
            </div>
          </div>

          {/* Each cell draws its top and left line; the list closes the grid. */}
          <ul className="mt-[72px] grid border-r border-b border-white/12 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((result) => (
              <li
                key={result.id}
                className="group flex flex-col border-t border-l border-white/12 p-9 transition-colors duration-200 hover:bg-white/[0.03]"
              >
                <p className="text-[13px] text-white/50">
                  {areas.find((a) => a.slug === result.area)?.title}
                </p>
                <p className="mt-4 font-serif text-[52px] leading-none tracking-[-0.02em]">
                  {result.amount}
                </p>
                <span className="mt-5 self-start rounded-full border border-white/20 px-2.5 py-1 text-[12px] leading-none text-white/70">
                  {result.type}
                </span>
                <p className="mt-4 text-[15px] leading-[1.6] text-white/70">
                  {result.summary}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-[12px] text-white/60">{disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
