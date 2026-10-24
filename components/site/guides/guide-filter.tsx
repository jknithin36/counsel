"use client";

import { useSearchParams } from "next/navigation";
import { practiceAreas } from "@/lib/content/practice-areas";
import { type GuideItem, GuideList } from "./guide-list";

/** Reads ?area= and filters the server-rendered guide cards. */
export function GuideFilter({ items }: { items: GuideItem[] }) {
  const param = useSearchParams().get("area");
  const active = practiceAreas.find((a) => a.slug === param)?.slug ?? "all";
  return <GuideList items={items} active={active} />;
}
