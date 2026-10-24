"use client";

import { useSearchParams } from "next/navigation";
import { usePracticeAreas } from "@/lib/site-content";
import {
  type AreaCard,
  type FilterKey,
  PracticeAreaGrid,
} from "./practice-area-grid";

const keys: FilterKey[] = ["all", "individuals", "business"];

/** Reads ?for= and filters the server-rendered cards. */
export function PracticeAreaFilter({ cards }: { cards: AreaCard[] }) {
  const param = useSearchParams().get("for");
  const active = keys.find((k) => k === param) ?? "all";
  // Follow the order set in Dashboard › Content.
  const order: string[] = usePracticeAreas().map((a) => a.slug);
  const sorted = [...cards].sort(
    (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug),
  );
  return <PracticeAreaGrid cards={sorted} active={active} />;
}
