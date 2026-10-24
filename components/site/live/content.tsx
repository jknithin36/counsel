"use client";

import { useDemoStore } from "@/lib/data/store";

/** The case results disclaimer once edited in Dashboard › Content. */
export function ResultsDisclaimer({ fallback }: { fallback: string }) {
  return (
    <>{useDemoStore((s) => s.contentOverrides.resultsDisclaimer) ?? fallback}</>
  );
}
