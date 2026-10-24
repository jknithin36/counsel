import type { Metadata } from "next";
import { Suspense } from "react";
import { CtaBand } from "@/components/site/cta-band";
import { GuideCard } from "@/components/site/guides/guide-card";
import { GuideFilter } from "@/components/site/guides/guide-filter";
import { type GuideItem, GuideList } from "@/components/site/guides/guide-list";
import { PageHeader } from "@/components/site/page-header";
import { guides } from "@/lib/content/guides";
import { resourcesPage as copy } from "@/lib/content/pages";

export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.intro,
};

export default function ResourcesPage() {
  const items: GuideItem[] = [...guides]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((guide) => ({
      slug: guide.slug,
      area: guide.practiceArea,
      featured: <GuideCard guide={guide} featured />,
      card: <GuideCard guide={guide} />,
    }));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: copy.breadcrumb, href: "/resources" }]}
        title={copy.title}
        intro={copy.intro}
      />
      <section className="bg-white pb-[88px] lg:pb-[140px]">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <Suspense fallback={<GuideList items={items} active="all" />}>
              <GuideFilter items={items} />
            </Suspense>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
