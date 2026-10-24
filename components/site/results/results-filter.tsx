"use client";

import { useSearchParams } from "next/navigation";
import { practiceAreas } from "@/lib/content/practice-areas";
import type { CaseResult } from "@/lib/content/results";
import { useResults } from "@/lib/site-content";
import { ResultsBrowser, type ResultsFilter } from "./results-browser";

/** Reads ?area= and filters the results (with Dashboard › Content edits). */
export function ResultsFilterView({
  results: fallback,
}: {
  results: CaseResult[];
}) {
  const param = useSearchParams().get("area");
  const results = useResults().items ?? fallback;
  const active: ResultsFilter =
    practiceAreas.find((a) => a.slug === param)?.slug ?? "all";
  return <ResultsBrowser results={results} active={active} />;
}
