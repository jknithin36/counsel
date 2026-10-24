import type { Metadata } from "next";
import { Suspense } from "react";
import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { PracticeAreaCard } from "@/components/site/practice-areas/practice-area-card";
import { PracticeAreaFilter } from "@/components/site/practice-areas/practice-area-filter";
import {
  type AreaCard,
  PracticeAreaGrid,
} from "@/components/site/practice-areas/practice-area-grid";
import type { TextureTone } from "@/components/ui/texture-panel";
import { practiceAreasPage as copy } from "@/lib/content/pages";
import { practiceAreas } from "@/lib/content/practice-areas";

export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.intro,
};

const tones: TextureTone[] = ["charcoal", "sage", "olive"];

export default function PracticeAreasPage() {
  const cards: AreaCard[] = practiceAreas.map((area, i) => ({
    slug: area.slug,
    audience: area.audience,
    node: (
      <PracticeAreaCard
        area={area}
        tone={tones[i % tones.length]}
        priority={i < 2}
      />
    ),
  }));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: copy.title, href: "/practice-areas" }]}
        title={copy.title}
        intro={copy.intro}
      />
      <section className="bg-white pb-[88px] lg:pb-[140px]">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            {/* Static HTML shows every area; the client applies ?for= */}
            <Suspense
              fallback={<PracticeAreaGrid cards={cards} active="all" />}
            >
              <PracticeAreaFilter cards={cards} />
            </Suspense>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
