import { AttorneyCard } from "@/components/site/attorney-card";
import { CtaBand } from "@/components/site/cta-band";
import { TrustStrip } from "@/components/site/home/trust-strip";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/site/section-heading";
import { TexturePanel } from "@/components/ui/texture-panel";
import { about } from "@/lib/content/about";
import { attorneys } from "@/lib/content/attorneys";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: about.metaTitle,
  description: about.intro,
  path: "/about",
});

const founders = attorneys.filter((a) => a.title === "Founding Partner");

export default function AboutPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: about.metaTitle, href: "/about" }]}
        title={about.title}
        intro={about.intro}
      />

      <section className="bg-white pb-[88px] lg:pb-[120px]">
        <div className="container-page">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <SectionHeading>{about.story.heading}</SectionHeading>
              <div className="mt-6 flex flex-col gap-5 text-[17px] leading-[1.75] text-[#3a3a3a]">
                {about.story.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] lg:col-span-6">
              <TexturePanel
                tone="olive"
                sizes="(min-width: 1024px) 600px, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-[88px] lg:pb-[120px]">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <SectionHeading>{about.values.heading}</SectionHeading>
            <ul className="mt-10 grid border-r border-b border-border md:grid-cols-2">
              {about.values.items.map((value) => (
                <li
                  key={value.title}
                  className="border-t border-l border-border p-9"
                >
                  <h3 className="text-[28px] text-[#111]">{value.title}</h3>
                  <p className="mt-3 max-w-[440px] text-[17px] leading-[1.6] text-[#3a3a3a]">
                    {value.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="border-y border-border">
        <TrustStrip />
      </div>

      <section className="bg-white py-[88px] lg:py-[120px]">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <SectionHeading>{about.leadership.heading}</SectionHeading>
            <p className="mt-4 max-w-[560px] text-[17px] leading-[1.6] text-[#3a3a3a]">
              {about.leadership.intro}
            </p>
            <ul className="mt-10 grid gap-10 md:grid-cols-2">
              {founders.map((attorney) => (
                <li key={attorney.slug}>
                  <AttorneyCard attorney={attorney} areas="all" />
                  <p className="mt-4 max-w-[520px] text-[16px] leading-[1.6] text-[#3a3a3a]">
                    {attorney.bio}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-surface py-[88px] lg:py-[120px]">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px] lg:grid lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading>{about.community.heading}</SectionHeading>
            </div>
            <p className="mt-6 text-[19px] leading-[1.7] text-[#3a3a3a] lg:col-span-7 lg:mt-0">
              {about.community.body}
            </p>
          </div>
        </div>
      </section>

      <div className="pt-[88px] lg:pt-[140px]">
        <CtaBand />
      </div>
    </>
  );
}
