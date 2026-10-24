import { Call02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/site/cta-band";
import { faqJsonLd } from "@/components/site/faq-accordion";
import { JsonLd } from "@/components/site/json-ld";
import { FirmPhoneLink } from "@/components/site/live/firm";
import { PageHeader } from "@/components/site/page-header";
import {
  AreaCases,
  AreaFaqs,
  AreaResults,
  AreaSteps,
  AreaTeam,
  AreaText,
} from "@/components/site/practice-areas/area-live";
import { SectionHeading } from "@/components/site/section-heading";
import { Button, buttonVariants } from "@/components/ui/button";
import { TexturePanel } from "@/components/ui/texture-panel";
import { firm } from "@/lib/config/firm";
import { getAttorney } from "@/lib/content/attorneys";
import {
  common,
  practiceAreaDetail as copy,
  practiceAreasPage,
} from "@/lib/content/pages";
import { getPracticeArea, practiceAreas } from "@/lib/content/practice-areas";
import { resultsByIds } from "@/lib/content/results";
import { absoluteUrl } from "@/lib/site-url";

export const dynamicParams = false;

export function generateStaticParams() {
  return practiceAreas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/practice-areas/[slug]">): Promise<Metadata> {
  const area = getPracticeArea((await params).slug);
  if (!area) return {};
  return { title: copy.metaTitle(area.title), description: area.intro };
}

export default async function PracticeAreaPage({
  params,
}: PageProps<"/practice-areas/[slug]">) {
  const area = getPracticeArea((await params).slug);
  if (!area) notFound();

  const consultHref = `/consultation?area=${area.slug}`;
  const _results = resultsByIds(area.relatedResults);
  const _team = area.attorneys.map(getAttorney).filter((a) => a !== undefined);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LegalService",
          name: `${firm.name}: ${area.title}`,
          serviceType: area.title,
          description: area.intro,
          url: absoluteUrl(area.href),
          telephone: firm.phone,
          provider: { "@type": "Organization", name: firm.name },
        }}
      />
      <JsonLd data={faqJsonLd(area.faqs)} />

      <PageHeader
        breadcrumbs={[
          { label: practiceAreasPage.title, href: "/practice-areas" },
          { label: area.title, href: area.href },
        ]}
        eyebrow={copy.eyebrow}
        title={<AreaText fallback={area} field="title" />}
        intro={<AreaText fallback={area} field="intro" />}
        actions={
          <>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href={consultHref} />}
            >
              {common.bookConsultation}
            </Button>
            <FirmPhoneLink
              className="inline-flex items-center gap-2 text-[15px] font-medium underline-offset-4 hover:underline"
              prefix={`${common.orCall} `}
            >
              <HugeiconsIcon icon={Call02Icon} className="size-4" />
            </FirmPhoneLink>
          </>
        }
      />

      <section className="bg-white pb-[88px] lg:pb-[140px]">
        <div className="container-page">
          <div className="mx-auto grid max-w-[1200px] gap-16 lg:grid-cols-12">
            {/* Sidebar: first on mobile (under the header), sticky on desktop. */}
            <aside className="lg:order-last lg:col-span-4">
              <div className="flex flex-col gap-10 lg:sticky lg:top-[120px]">
                <div className="rounded-[10px] border border-border p-7">
                  <p className="font-serif text-[26px] leading-tight text-[#111]">
                    {copy.sidebar.title}
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.6] text-[#3a3a3a]">
                    {copy.sidebar.body(area.title)}
                  </p>
                  <Button
                    nativeButton={false}
                    render={<Link href={consultHref} />}
                    className="mt-6 w-full"
                  >
                    {common.bookConsultation}
                  </Button>
                  <FirmPhoneLink className="mt-4 flex items-center justify-center gap-2 text-[15px] font-medium underline-offset-4 hover:underline">
                    <HugeiconsIcon icon={Call02Icon} className="size-4" />
                  </FirmPhoneLink>
                  <p className="mt-4 border-t border-border pt-4 text-center text-[13px] text-muted-foreground">
                    {copy.sidebar.languages}
                  </p>
                </div>

                <AreaTeam
                  fallback={area}
                  heading={copy.sidebar.attorneysHeading}
                  background={<TexturePanel tone="sage" sizes="44px" />}
                />
              </div>
            </aside>

            <div className="flex flex-col gap-24 lg:col-span-8">
              <div>
                <SectionHeading>{copy.sections.cases}</SectionHeading>
                <AreaCases fallback={area} />
              </div>

              <div>
                <SectionHeading>{copy.sections.howWeHelp}</SectionHeading>
                <AreaSteps fallback={area} />
              </div>

              <div>
                <SectionHeading>{copy.sections.fees}</SectionHeading>
                <div className="mt-8 flex gap-4 rounded-[10px] bg-surface p-6 lg:p-7">
                  <HugeiconsIcon
                    icon={InformationCircleIcon}
                    strokeWidth={1.5}
                    className="mt-0.5 size-6 shrink-0"
                  />
                  <p className="text-[17px] leading-[1.6] text-[#3a3a3a]">
                    <AreaText fallback={area} field="whatToExpect" />
                  </p>
                </div>
              </div>

              <AreaResults fallback={area} heading={copy.sections.results} />

              <div>
                <SectionHeading>{copy.sections.faqs}</SectionHeading>
                <AreaFaqs fallback={area} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand area={area.title} href={consultHref} />

      {/* Mobile: persistent consultation bar. */}
      <div
        data-mobile-cta
        className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-border bg-white/95 p-3 backdrop-blur-md lg:hidden"
      >
        <Button
          nativeButton={false}
          render={<Link href={consultHref} />}
          className="flex-1"
        >
          {common.freeConsultationShort}
        </Button>
        <FirmPhoneLink
          hideNumber
          aria-label={common.callUs}
          className={buttonVariants({
            variant: "outline",
            size: "icon-lg",
            className: "size-11",
          })}
        >
          <HugeiconsIcon icon={Call02Icon} className="size-5" />
          <span className="sr-only">{common.callUs}</span>
        </FirmPhoneLink>
      </div>
    </>
  );
}
