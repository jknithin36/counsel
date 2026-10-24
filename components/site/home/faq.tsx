import Link from "next/link";
import { ArrowIcon } from "@/components/site/arrow-icon";
import { LiveFaqs } from "@/components/site/faq/live-faqs";
import { FirmPhoneLink } from "@/components/site/live/firm";
import { faqSection } from "@/lib/content/home";

export function Faq() {
  return (
    <section className="bg-white py-[88px] lg:py-[140px]">
      <div className="container-page">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[120px]">
              <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] text-[#111]">
                {faqSection.heading}
              </h2>
              <p className="mt-5 text-[17px] leading-[1.6] text-muted-foreground">
                {faqSection.subtext}{" "}
                <FirmPhoneLink className="whitespace-nowrap text-[#111] underline underline-offset-4" />
                .
              </p>
              <Link
                href={faqSection.link.href}
                className="mt-6 group/arrow inline-flex items-center gap-1.5 text-[15px] font-medium underline-offset-4 hover:underline"
              >
                {faqSection.link.label} <ArrowIcon />
              </Link>
            </div>
          </div>

          <LiveFaqs home className="lg:col-span-8" />
        </div>
      </div>
    </section>
  );
}
