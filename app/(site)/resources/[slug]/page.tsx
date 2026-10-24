import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AttorneyAvatar } from "@/components/site/attorney-card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { GuideCard } from "@/components/site/guides/guide-card";
import { JsonLd } from "@/components/site/json-ld";
import { SectionHeading } from "@/components/site/section-heading";
import { firm } from "@/lib/config/firm";
import { getAttorney } from "@/lib/content/attorneys";
import { getGuide, guideDisclaimer, guides } from "@/lib/content/guides";
import { formatDate, guidePage, resourcesPage } from "@/lib/content/pages";
import { getPracticeArea } from "@/lib/content/practice-areas";
import { absoluteUrl } from "@/lib/site-url";

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/resources/[slug]">): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.excerpt,
    openGraph: { type: "article", publishedTime: guide.publishedAt },
  };
}

export default async function GuidePage({
  params,
}: PageProps<"/resources/[slug]">) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();

  const author = getAttorney(guide.author);
  const area = getPracticeArea(guide.practiceArea);
  const href = `/resources/${guide.slug}`;
  const related = [
    ...guides.filter(
      (g) => g.slug !== guide.slug && g.practiceArea === guide.practiceArea,
    ),
    ...guides.filter(
      (g) => g.slug !== guide.slug && g.practiceArea !== guide.practiceArea,
    ),
  ].slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.excerpt,
          datePublished: guide.publishedAt,
          url: absoluteUrl(href),
          author: author
            ? {
                "@type": "Person",
                name: author.name,
                url: absoluteUrl(`/attorneys/${author.slug}`),
              }
            : undefined,
          publisher: { "@type": "Organization", name: firm.name },
        }}
      />

      <article className="bg-white pt-14 pb-[88px] lg:pt-[100px] lg:pb-[120px]">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <Breadcrumbs
              items={[
                { label: resourcesPage.breadcrumb, href: "/resources" },
                { label: guide.title, href },
              ]}
            />
            <p className="mt-10 text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {area?.title}
            </p>
            <h1 className="mt-4 max-w-[900px] text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.05] tracking-[-0.025em] text-[#111]">
              {guide.title}
            </h1>

            {author && (
              <div className="mt-8 flex items-center gap-3">
                <AttorneyAvatar attorney={author} />
                <p className="text-[14px] leading-snug text-muted-foreground">
                  {guidePage.by}{" "}
                  <Link
                    href={`/attorneys/${author.slug}`}
                    className="font-medium text-[#111] underline-offset-4 hover:underline"
                  >
                    {author.name}
                  </Link>
                  <br />
                  <time dateTime={guide.publishedAt}>
                    {formatDate(guide.publishedAt)}
                  </time>
                  {" · "}
                  {guide.readTime}
                </p>
              </div>
            )}

            <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
              <nav aria-labelledby="toc-heading" className="lg:col-span-3">
                <div className="rounded-[10px] border border-border p-6 lg:sticky lg:top-[120px] lg:border-0 lg:p-0">
                  <h2
                    id="toc-heading"
                    className="font-sans text-[13px] font-medium uppercase leading-normal tracking-[0.08em] text-muted-foreground"
                  >
                    {guidePage.onThisPage}
                  </h2>
                  <ol className="mt-4 flex flex-col gap-3 text-[15px]">
                    {guide.sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="text-[#3a3a3a] underline-offset-4 hover:text-[#111] hover:underline"
                        >
                          {section.heading}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              </nav>

              <div className="max-w-[680px] lg:col-span-9">
                {guide.sections.map((section) => (
                  <section key={section.id} className="mt-12 first:mt-0">
                    <h2
                      id={section.id}
                      className="scroll-mt-[120px] text-[clamp(1.75rem,3vw,2.25rem)] text-[#111]"
                    >
                      {section.heading}
                    </h2>
                    {section.paragraphs.map((p) => (
                      <p
                        key={p}
                        className="mt-5 text-[18px] leading-[1.75] text-[#3a3a3a]"
                      >
                        {p}
                      </p>
                    ))}
                    {section.bullets && (
                      <ul className="mt-5 flex list-disc flex-col gap-3 pl-6 text-[18px] leading-[1.7] text-[#3a3a3a] marker:text-[#111]">
                        {section.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}

                <aside className="mt-14 flex gap-4 rounded-[10px] bg-surface p-6">
                  <HugeiconsIcon
                    icon={InformationCircleIcon}
                    strokeWidth={1.5}
                    className="mt-0.5 size-6 shrink-0"
                  />
                  <div>
                    <p className="text-[15px] font-semibold text-[#111]">
                      {guidePage.disclaimerTitle}
                    </p>
                    <p className="mt-1.5 text-[15px] leading-[1.7] text-[#3a3a3a]">
                      {guideDisclaimer}
                    </p>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </article>

      <section className="bg-surface py-[88px] lg:py-[120px]">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <SectionHeading>{guidePage.related}</SectionHeading>
            <ul className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {related.map((g) => (
                <li key={g.slug}>
                  <GuideCard guide={g} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="pt-[88px] lg:pt-[140px]">
        <CtaBand
          area={area?.title}
          href={`/consultation?area=${guide.practiceArea}`}
        />
      </div>
    </>
  );
}
