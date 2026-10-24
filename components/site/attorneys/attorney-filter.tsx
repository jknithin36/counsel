"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { LiveAttorneyCard } from "@/components/site/live/attorney";
import { practiceAreas } from "@/lib/content/practice-areas";
import { useAttorneys, usePracticeAreas } from "@/lib/site-content";
import {
  type AttorneyCardItem,
  type AttorneyFilters,
  AttorneyGrid,
} from "./attorney-grid";

const practices = new Set(practiceAreas.map((area) => area.slug));

/** Reads ?practice= and ?language=, and lists the attorneys shown on the site. */
export function AttorneyFilter({ background }: { background: ReactNode }) {
  const params = useSearchParams();
  const live = useAttorneys();
  const areas = usePracticeAreas();
  const cards: AttorneyCardItem[] = live.map((attorney, index) => ({
    slug: attorney.slug,
    practiceAreas: attorney.practiceAreas,
    speaksSpanish: attorney.languages.includes("Spanish"),
    node: (
      <LiveAttorneyCard
        attorney={attorney}
        background={background}
        areas="all"
        priority={index < 3}
      />
    ),
  }));
  const requestedPractice = params.get("practice");
  const filters: AttorneyFilters = {
    practice:
      requestedPractice && practices.has(requestedPractice as never)
        ? (requestedPractice as AttorneyFilters["practice"])
        : "all",
    language: params.get("language") === "spanish" ? "spanish" : "all",
  };
  const practiceTabs = [
    { key: "all" as const, label: "All" },
    ...areas.map((area) => ({ key: area.slug, label: area.title })),
  ];

  return (
    <AttorneyGrid cards={cards} filters={filters} practiceTabs={practiceTabs} />
  );
}
