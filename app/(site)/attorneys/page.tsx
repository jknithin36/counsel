import { Suspense } from "react";
import { AttorneyCard, AttorneyTexture } from "@/components/site/attorney-card";
import { AttorneyFilter } from "@/components/site/attorneys/attorney-filter";
import {
  type AttorneyCardItem,
  AttorneyGrid,
} from "@/components/site/attorneys/attorney-grid";
import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { attorneys } from "@/lib/content/attorneys";
import { attorneysPage as copy } from "@/lib/content/pages";
import { practiceAreas } from "@/lib/content/practice-areas";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: copy.metaTitle,
  description: copy.intro,
  path: "/attorneys",
});

export default function AttorneysPage() {
  const cards: AttorneyCardItem[] = attorneys.map((attorney, index) => ({
    slug: attorney.slug,
    practiceAreas: attorney.practiceAreas,
    speaksSpanish: attorney.languages.includes("Spanish"),
    node: <AttorneyCard attorney={attorney} areas="all" priority={index < 3} />,
  }));
  const practiceTabs = [
    { key: "all" as const, label: copy.all },
    ...practiceAreas.map((area) => ({ key: area.slug, label: area.title })),
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: copy.title, href: "/attorneys" }]}
        title={copy.title}
        intro={copy.intro}
      />
      <section className="bg-white pb-[88px] lg:pb-[140px]">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <Suspense
              fallback={
                <AttorneyGrid
                  cards={cards}
                  filters={{ practice: "all", language: "all" }}
                  practiceTabs={practiceTabs}
                />
              }
            >
              <AttorneyFilter background={<AttorneyTexture />} />
            </Suspense>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
