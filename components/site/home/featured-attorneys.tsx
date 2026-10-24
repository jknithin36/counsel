"use client";

import type { ReactNode } from "react";
import { LiveAttorneyCard } from "@/components/site/live/attorney";
import { useAttorneys } from "@/lib/site-content";

/** Featured attorneys (set in Dashboard › Content), in display order. */
export function FeaturedAttorneys({ background }: { background: ReactNode }) {
  const featured = useAttorneys().filter((a) => a.featured);
  return (
    /* Mobile: a snap-scrolling row that bleeds to the screen edges. */
    <ul className="-mx-5 mt-16 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-4">
      {featured.map((attorney) => (
        <li
          key={attorney.slug}
          className="w-[80%] shrink-0 snap-start md:w-auto"
        >
          <LiveAttorneyCard attorney={attorney} background={background} />
        </li>
      ))}
    </ul>
  );
}
