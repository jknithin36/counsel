import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/site/cta-band";
import { FaqGroups } from "@/components/site/faq/live-faqs";
import { faqJsonLd } from "@/components/site/faq-accordion";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/site/section-heading";
import { faqs } from "@/lib/content/faq";
import { faqPage as copy } from "@/lib/content/pages";

export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.intro,
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        breadcrumbs={[{ label: copy.breadcrumb, href: "/faq" }]}
        title={copy.title}
        intro={copy.intro}
      />
      <section className="bg-white pb-[88px] lg:pb-[140px]">
        <div className="container-page">
          <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-12 lg:gap-16">
            <FaqGroups>
              <div className="rounded-[10px] bg-surface p-7">
                <SectionHeading>{copy.stillHaveQuestions}</SectionHeading>
                <Link
                  href="/contact"
                  className="mt-4 inline-block text-[15px] font-medium underline underline-offset-4"
                >
                  {copy.contact}
                </Link>
              </div>
            </FaqGroups>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
