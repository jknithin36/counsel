import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Suspense } from "react";
import { CtaBand } from "@/components/site/cta-band";
import { ResultsDisclaimer } from "@/components/site/live/content";
import { PageHeader } from "@/components/site/page-header";
import { ResultsBrowser } from "@/components/site/results/results-browser";
import { ResultsFilterView } from "@/components/site/results/results-filter";
import { resultsPage as copy } from "@/lib/content/pages";
import { caseResults } from "@/lib/content/results";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: copy.metaTitle,
  description: copy.intro,
  path: "/results",
});

export default function ResultsPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: copy.title, href: "/results" }]}
        title={copy.title}
        intro={`${copy.intro} ${copy.introNote}`}
      />
      <section className="bg-white pb-16">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <Suspense
              fallback={<ResultsBrowser results={caseResults} active="all" />}
            >
              <ResultsFilterView results={caseResults} />
            </Suspense>

            <div className="mt-16 flex gap-4 rounded-[10px] bg-surface p-6 lg:p-8">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                strokeWidth={1.5}
                className="mt-0.5 size-6 shrink-0"
              />
              <div>
                <h2 className="font-sans text-[15px] font-semibold leading-normal tracking-normal text-[#111]">
                  {copy.disclaimerTitle}
                </h2>
                <p className="mt-2 max-w-[820px] text-[15px] leading-[1.7] text-[#3a3a3a]">
                  <ResultsDisclaimer fallback={copy.disclaimer} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
