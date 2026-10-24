import { Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/site/arrow-icon";
import { ContactForm } from "@/components/site/contact/contact-form";
import {
  FirmEmailLink,
  FirmPhoneLink,
  FirmText,
} from "@/components/site/live/firm";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/site/section-heading";
import { TexturePanel } from "@/components/ui/texture-panel";
import { contactPage as c } from "@/lib/content/pages";

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.intro,
};

export default function ContactPage() {
  const rows = [
    {
      label: c.labels.address,
      value: (
        <>
          <FirmText field="line1" />
          <br />
          <FirmText field="city" />, <FirmText field="region" />{" "}
          <FirmText field="postalCode" />
        </>
      ),
    },
    {
      label: c.labels.phone,
      value: <FirmPhoneLink className="underline-offset-4 hover:underline" />,
    },
    {
      label: c.labels.email,
      value: <FirmEmailLink className="underline-offset-4 hover:underline" />,
    },
    { label: c.labels.hours, value: <FirmText field="hours" /> },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: c.title, href: "/contact" }]}
        title={c.title}
        intro={c.intro}
      />
      <section className="bg-white pb-[88px] lg:pb-[140px]">
        <div className="container-page">
          <div className="mx-auto grid max-w-[1200px] gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionHeading>{c.formHeading}</SectionHeading>
              <p className="mt-3 text-[15px] text-muted-foreground">
                {c.consultationPrompt}{" "}
                <Link
                  href="/consultation"
                  className="group/arrow inline-flex items-center gap-1 font-medium text-[#111] underline underline-offset-4"
                >
                  {c.consultationLink} <ArrowIcon />
                </Link>
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            <aside className="lg:col-span-5">
              <SectionHeading>{c.officeHeading}</SectionHeading>
              <dl className="mt-8 flex flex-col">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[96px_1fr] gap-4 border-t border-border py-4 text-[15px]"
                  >
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="text-[#111]">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <div
                role="img"
                aria-label={c.mapLabel}
                className="relative mt-6 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[10px]"
              >
                <TexturePanel
                  tone="sage"
                  sizes="(min-width: 1024px) 480px, 100vw"
                />
                <span className="relative flex size-14 items-center justify-center rounded-full bg-[#111] text-white shadow-[0_12px_32px_rgba(0,0,0,0.25)]">
                  <HugeiconsIcon icon={Location01Icon} className="size-6" />
                </span>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
