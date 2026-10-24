import {
  Calendar03Icon,
  File01Icon,
  FileEditIcon,
  Invoice01Icon,
  Message01Icon,
  Route01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion, faqJsonLd } from "@/components/site/faq-accordion";
import { JsonLd } from "@/components/site/json-ld";
import { FirmPhoneLink } from "@/components/site/live/firm";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { faqs } from "@/lib/content/faq";
import { portalHelpPage as p } from "@/lib/content/pages";

export const metadata: Metadata = {
  title: p.metaTitle,
  description: p.intro,
};

const icons = {
  timeline: Route01Icon,
  documents: File01Icon,
  sign: FileEditIcon,
  messages: Message01Icon,
  billing: Invoice01Icon,
  appointments: Calendar03Icon,
};

export default function PortalHelpPage() {
  const portalFaqs = faqs.filter((f) => f.category === "portal");

  return (
    <>
      <JsonLd data={faqJsonLd(portalFaqs)} />
      <PageHeader
        breadcrumbs={[{ label: p.title, href: "/portal-help" }]}
        title={p.title}
        intro={p.intro}
        actions={
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            {p.login}
          </Button>
        }
      />

      <section className="bg-white pb-[88px] lg:pb-[120px]">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <SectionHeading>{p.featuresHeading}</SectionHeading>
            <ul className="mt-10 grid border-r border-b border-border md:grid-cols-2 lg:grid-cols-3">
              {p.features.map((feature) => (
                <li
                  key={feature.title}
                  className="border-t border-l border-border p-8"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-surface">
                    <HugeiconsIcon
                      icon={icons[feature.icon as keyof typeof icons]}
                      strokeWidth={1.5}
                      className="size-[22px]"
                    />
                  </span>
                  <h3 className="mt-6 text-[24px] text-[#111]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[16px] leading-[1.6] text-[#3a3a3a]">
                    {feature.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-surface py-[88px] lg:py-[120px]">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <SectionHeading>{p.stepsHeading}</SectionHeading>
            <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-0">
              {p.steps.map((step, i) => (
                <li
                  key={step.title}
                  className="border-t border-[#dadada] pt-7 md:pr-10"
                >
                  <p className="text-[13px] font-semibold text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-[26px] text-[#111]">{step.title}</h3>
                  <p className="mt-3 max-w-[320px] text-[16px] leading-[1.6] text-[#3a3a3a]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-white py-[88px] lg:py-[140px]">
        <div className="container-page">
          <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeading>{p.faqHeading}</SectionHeading>
              <p className="mt-4 text-[16px] text-muted-foreground">
                {p.helpPrompt}{" "}
                <FirmPhoneLink className="whitespace-nowrap text-[#111] underline underline-offset-4" />
              </p>
            </div>
            <FaqAccordion faqs={portalFaqs} className="lg:col-span-8" />
          </div>
        </div>
      </section>
    </>
  );
}
