import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Faq } from "@/lib/content/faq";

/** Single, collapsible FAQ list with a plus that turns into an X. */
export function FaqAccordion({
  faqs,
  className,
}: {
  faqs: Faq[];
  className?: string;
}) {
  return (
    <Accordion className={className}>
      {faqs.map((faq) => (
        <AccordionItem
          key={faq.question}
          value={faq.question}
          className="border-t border-border not-last:border-b-0 last:border-b"
        >
          <AccordionTrigger className="items-center gap-6 rounded-none py-6 font-serif text-[22px] font-normal leading-snug tracking-[-0.02em] text-[#111] hover:no-underline lg:text-[24px] **:data-[slot=accordion-trigger-icon]:hidden">
            {faq.question}
            <HugeiconsIcon
              icon={PlusSignIcon}
              strokeWidth={1.5}
              className="ml-auto size-6 shrink-0 transition-transform duration-300 group-aria-expanded/accordion-trigger:rotate-45 motion-reduce:transition-none"
            />
          </AccordionTrigger>
          <AccordionContent className="max-w-[640px] pb-6 text-[17px] leading-[1.6] text-[#3a3a3a]">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
