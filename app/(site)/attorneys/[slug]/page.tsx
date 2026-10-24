import type { Metadata } from "next";
import { AttorneyCard } from "@/components/site/attorney-card";
import { AttorneyProfile } from "@/components/site/attorneys/attorney-profile";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { SectionHeading } from "@/components/site/section-heading";
import { TexturePanel } from "@/components/ui/texture-panel";
import { firm } from "@/lib/config/firm";
import { attorneys, getAttorney } from "@/lib/content/attorneys";
import { attorneysPage, attorneyProfile as copy } from "@/lib/content/pages";
import { publicFileExists } from "@/lib/public-file";
import { absoluteUrl } from "@/lib/site-url";

/** Attorneys added in the dashboard have no static page; the client resolves them. */
export const dynamicParams = true;

export function generateStaticParams() {
  return attorneys.map((attorney) => ({ slug: attorney.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/attorneys/[slug]">): Promise<Metadata> {
  const attorney = getAttorney((await params).slug);
  if (!attorney) return { title: attorneysPage.title };
  return { title: attorney.name, description: attorney.bio };
}

export default async function AttorneyProfilePage({
  params,
}: PageProps<"/attorneys/[slug]">) {
  const { slug } = await params;
  const attorney = getAttorney(slug);
  const otherAttorneys = attorneys
    .filter((candidate) => candidate.slug !== slug)
    .sort((a, b) => {
      if (!attorney) return 0;
      const aShared = a.practiceAreas.some((area) =>
        attorney.practiceAreas.includes(area),
      );
      const bShared = b.practiceAreas.some((area) =>
        attorney.practiceAreas.includes(area),
      );
      return Number(bShared) - Number(aShared);
    })
    .slice(0, 3);

  return (
    <>
      {attorney && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: attorney.name,
            jobTitle: attorney.title,
            description: attorney.bio,
            url: absoluteUrl(`/attorneys/${attorney.slug}`),
            email: `mailto:${attorney.email}`,
            telephone: firm.phone,
            knowsLanguage: attorney.languages,
            worksFor: { "@type": "Organization", name: firm.name },
          }}
        />
      )}

      <AttorneyProfile
        slug={slug}
        fallback={attorney}
        background={
          <TexturePanel
            tone="sage"
            sizes="(min-width: 1024px) 500px, 100vw"
            priority
          />
        }
        hasPublicImage={Boolean(
          attorney?.image && publicFileExists(attorney.image),
        )}
      >
        <section className="bg-surface py-[88px] lg:py-[120px]">
          <div className="container-page">
            <div className="mx-auto max-w-[1200px]">
              <SectionHeading>{copy.otherAttorneys}</SectionHeading>
              <ul className="mt-10 grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                {otherAttorneys.map((other) => (
                  <li key={other.slug}>
                    <AttorneyCard attorney={other} areas="all" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <CtaBand href={`/consultation?attorney=${slug}`} />
      </AttorneyProfile>
    </>
  );
}
