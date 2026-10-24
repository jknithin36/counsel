"use client";

import { Call02Icon, Mail02Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type ReactNode, useSyncExternalStore } from "react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { LivePortrait } from "@/components/site/live/attorney";
import { FirmPhoneLink } from "@/components/site/live/firm";
import { ResultCard } from "@/components/site/result-card";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { type Attorney, firstName } from "@/lib/content/attorneys";
import { attorneysPage, attorneyProfile as copy } from "@/lib/content/pages";
import { useAttorney, usePracticeAreas, useResults } from "@/lib/site-content";

const subscribe = () => () => {};
/** False during server render and hydration, true after. */
function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function ProfileList({ heading, items }: { heading: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="border-b border-[#dddddd] py-6 first:pt-0 last:border-b-0 last:pb-0">
      <h2 className="font-sans text-[13px] font-medium uppercase leading-normal tracking-[0.08em] text-muted-foreground">
        {heading}
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="text-[15px] leading-[1.6] text-[#3a3a3a]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * An attorney profile with Dashboard › Content edits applied. Attorneys
 * added in the dashboard have no static page data, so they resolve here.
 */
export function AttorneyProfile({
  slug,
  fallback,
  background,
  hasPublicImage,
  children,
}: {
  slug: string;
  fallback?: Attorney;
  background: ReactNode;
  hasPublicImage?: boolean;
  /** Rendered after the profile (other attorneys, call to action). */
  children?: ReactNode;
}) {
  const hydrated = useHydrated();
  const live = useAttorney(slug);
  const attorney = live ?? fallback;
  const areas = usePracticeAreas();
  const { items: results, disclaimer } = useResults();

  if (!attorney || (live && !live.visible)) {
    if (!hydrated)
      return <div className="min-h-[60vh] bg-white" aria-busy="true" />;
    notFound();
  }

  const first = firstName(attorney.name);
  const consultHref = `/consultation?attorney=${attorney.slug}`;
  const notable = results.filter((r) => attorney.notableResults.includes(r.id));

  return (
    <>
      <section className="bg-white pt-14 pb-20 lg:pt-[100px] lg:pb-28">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <Breadcrumbs
              items={[
                { label: attorneysPage.title, href: "/attorneys" },
                { label: attorney.name, href: `/attorneys/${attorney.slug}` },
              ]}
            />

            <div className="mt-10 grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[10px] lg:col-span-5">
                <LivePortrait
                  attorney={fallback ?? attorney}
                  background={background}
                  hasPublicImage={hasPublicImage}
                  alt={`Portrait of ${attorney.name}`}
                  sizes="(min-width: 1024px) 500px, 100vw"
                  initialsClassName="text-[clamp(5rem,12vw,9rem)]"
                  priority
                />
              </div>

              <div className="lg:col-span-7 lg:pt-5">
                <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  {attorney.title}
                </p>
                <h1 className="mt-4 text-[clamp(2.75rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.025em] text-[#111]">
                  {attorney.name}
                </h1>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {attorney.practiceAreas.map((slugValue) => {
                    const area = areas.find((a) => a.slug === slugValue);
                    if (!area) return null;
                    return (
                      <li key={slugValue}>
                        <Link
                          href={area.href}
                          className="inline-flex rounded-full border border-border px-3 py-1.5 text-[13px] text-[#3a3a3a] transition-colors hover:border-[#111] hover:text-[#111]"
                        >
                          {area.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {attorney.quote && (
                  <blockquote className="mt-9 border-l-2 border-[#111] pl-6 font-serif text-[24px] italic leading-[1.4] text-[#3a3a3a]">
                    “{attorney.quote}”
                  </blockquote>
                )}

                <div className="mt-9 flex flex-col items-start gap-4 xl:flex-row xl:items-center">
                  <Button
                    size="lg"
                    nativeButton={false}
                    render={<Link href={consultHref} />}
                  >
                    {copy.book(first)}
                  </Button>
                  <div className="flex flex-wrap gap-x-5 gap-y-3 text-[14px] font-medium">
                    {attorney.email && (
                      <a
                        href={`mailto:${attorney.email}`}
                        className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
                      >
                        <HugeiconsIcon icon={Mail02Icon} className="size-4" />
                        {attorney.email}
                      </a>
                    )}
                    <FirmPhoneLink className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
                      <HugeiconsIcon icon={Call02Icon} className="size-4" />
                    </FirmPhoneLink>
                  </div>
                </div>

                <dl className="mt-10 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
                      {copy.experienceLabel}
                    </dt>
                    <dd className="mt-1 text-[15px] text-[#111]">
                      {copy.experience(attorney.yearsOfExperience)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
                      {copy.languages}
                    </dt>
                    <dd className="mt-1 text-[15px] text-[#111]">
                      {attorney.languages.join(" & ")}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-[88px] lg:pb-[140px]">
        <div className="container-page">
          <div className="mx-auto grid max-w-[1200px] gap-16 lg:grid-cols-12">
            <div className="flex flex-col gap-24 lg:col-span-8">
              <div>
                <SectionHeading>{copy.about(first)}</SectionHeading>
                <div className="mt-8 flex max-w-[720px] flex-col gap-5 text-[17px] leading-[1.75] text-[#3a3a3a]">
                  {(attorney.longBio.length
                    ? attorney.longBio
                    : [attorney.bio]
                  ).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {attorney.focusAreas.length > 0 && (
                <div>
                  <SectionHeading>{copy.focusAreas}</SectionHeading>
                  <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    {attorney.focusAreas.map((area) => (
                      <li
                        key={area}
                        className="flex items-start gap-3 border-t border-border pt-4 text-[16px] text-[#3a3a3a]"
                      >
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          strokeWidth={1.75}
                          className="mt-0.5 size-5 shrink-0 text-[#111]"
                        />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {notable.length > 0 && (
                <div>
                  <SectionHeading>{copy.notableResults}</SectionHeading>
                  <ul className="mt-8 grid gap-4 md:grid-cols-2">
                    {notable.map((result) => (
                      <li key={result.id}>
                        <ResultCard result={result} />
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-[12px] text-muted-foreground">
                    {disclaimer}
                  </p>
                </div>
              )}
            </div>

            <aside className="lg:col-span-4">
              <div className="rounded-[10px] bg-surface p-7 lg:sticky lg:top-[120px]">
                <ProfileList
                  heading={copy.education}
                  items={attorney.education.map(
                    (e) => `${e.degree}, ${e.school} · ${e.year}`,
                  )}
                />
                <ProfileList
                  heading={copy.admissions}
                  items={attorney.admissions}
                />
                <ProfileList
                  heading={copy.memberships}
                  items={attorney.memberships}
                />
                <ProfileList
                  heading={copy.languages}
                  items={attorney.languages}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {children}
    </>
  );
}
