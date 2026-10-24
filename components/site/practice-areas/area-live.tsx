"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { LivePortrait } from "@/components/site/live/attorney";
import { ResultCard } from "@/components/site/result-card";
import { SectionHeading } from "@/components/site/section-heading";
import type { PracticeArea } from "@/lib/content/practice-areas";
import {
  useAllAttorneys,
  usePracticeArea,
  useResults,
} from "@/lib/site-content";

/*
 * Practice area page pieces that follow Dashboard › Content edits. The
 * server page passes the static area as `fallback`.
 */

function useArea(fallback: PracticeArea) {
  return usePracticeArea(fallback.slug) ?? fallback;
}

export function AreaText({
  fallback,
  field,
}: {
  fallback: PracticeArea;
  field: "title" | "intro" | "summary" | "whatToExpect";
}) {
  return <>{useArea(fallback)[field]}</>;
}

export function AreaCases({ fallback }: { fallback: PracticeArea }) {
  const area = useArea(fallback);
  return (
    <ul className="mt-8 grid gap-x-10 md:grid-cols-2">
      {area.commonCases.map((item) => (
        <li key={item.title} className="border-t border-border py-6">
          <h3 className="text-[22px] text-[#111]">{item.title}</h3>
          <p className="mt-2 text-[16px] leading-[1.6] text-[#3a3a3a]">
            {item.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function AreaSteps({ fallback }: { fallback: PracticeArea }) {
  const area = useArea(fallback);
  return (
    <ol className="mt-8 grid gap-x-10 gap-y-10 md:grid-cols-2">
      {area.howWeHelp.map((step, i) => (
        <li key={step.title} className="border-t border-[#dadada] pt-7">
          <p className="text-[13px] font-semibold text-muted-foreground">
            {String(i + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-4 text-[26px] text-[#111]">{step.title}</h3>
          <p className="mt-3 text-[16px] leading-[1.6] text-[#3a3a3a]">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function AreaFaqs({ fallback }: { fallback: PracticeArea }) {
  return <FaqAccordion faqs={useArea(fallback).faqs} className="mt-8" />;
}

export function AreaResults({
  fallback,
  heading,
}: {
  fallback: PracticeArea;
  heading: string;
}) {
  const area = useArea(fallback);
  const { items, disclaimer } = useResults();
  const results = items.filter((r) => area.relatedResults.includes(r.id));
  if (results.length === 0) return null;
  return (
    <div>
      <SectionHeading>{heading}</SectionHeading>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {results.map((result) => (
          <li key={result.id}>
            <ResultCard result={result} />
          </li>
        ))}
      </ul>
      <p className="mt-5 text-[12px] text-muted-foreground">{disclaimer}</p>
    </div>
  );
}

/** The sidebar list of attorneys assigned to the area. */
export function AreaTeam({
  fallback,
  heading,
  background,
}: {
  fallback: PracticeArea;
  heading: string;
  background: ReactNode;
}) {
  const area = useArea(fallback);
  const all = useAllAttorneys();
  const team = area.attorneys.flatMap((slug) => {
    const attorney = all.find((a) => a.slug === slug);
    return attorney?.visible ? [attorney] : [];
  });
  if (team.length === 0) return null;
  return (
    <div>
      <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {heading}
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {team.map((attorney) => (
          <li key={attorney.slug}>
            <Link
              href={`/attorneys/${attorney.slug}`}
              className="group flex items-center gap-3"
            >
              <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full">
                <LivePortrait
                  attorney={attorney}
                  background={background}
                  sizes="44px"
                  initialsClassName="text-[15px] text-white"
                />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[15px] font-medium text-[#111] underline-offset-4 group-hover:underline">
                  {attorney.name}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {attorney.title}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
