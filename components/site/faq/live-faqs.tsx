"use client";

import { FaqAccordion } from "@/components/site/faq-accordion";
import { faqCategories } from "@/lib/content/faq";
import { faqPage as copy } from "@/lib/content/pages";
import { useFaqs } from "@/lib/site-content";

/** The home page FAQ list (questions marked "home"). */
export function LiveFaqs({
  home,
  className,
}: {
  home?: boolean;
  className?: string;
}) {
  const faqs = useFaqs();
  return (
    <FaqAccordion
      faqs={home ? faqs.filter((f) => f.home) : faqs}
      className={className}
    />
  );
}

/** The FAQ page: category links and one accordion per category. */
export function FaqGroups({ children }: { children?: React.ReactNode }) {
  const faqs = useFaqs();
  const groups = faqCategories
    .map((category) => ({
      ...category,
      items: faqs.filter((f) => f.category === category.key),
    }))
    .filter((g) => g.items.length > 0);
  return (
    <>
      <nav aria-label={copy.categoriesLabel} className="lg:col-span-3">
        <ul className="flex flex-wrap gap-2 lg:sticky lg:top-[120px] lg:flex-col lg:gap-3">
          {groups.map((group) => (
            <li key={group.key}>
              <a
                href={`#${group.key}`}
                className="inline-flex rounded-full border border-border px-4 py-2 text-[14px] font-medium text-[#3a3a3a] hover:border-[#111] hover:text-[#111] lg:rounded-none lg:border-0 lg:p-0 lg:text-[15px] lg:underline-offset-4 lg:hover:underline"
              >
                {group.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex flex-col gap-20 lg:col-span-9">
        {groups.map((group) => (
          <section
            key={group.key}
            id={group.key}
            aria-labelledby={`${group.key}-heading`}
            className="scroll-mt-[120px]"
          >
            <h2
              id={`${group.key}-heading`}
              className="text-[clamp(1.75rem,3vw,2.25rem)] text-[#111]"
            >
              {group.label}
            </h2>
            <FaqAccordion faqs={group.items} className="mt-6" />
          </section>
        ))}
        {children}
      </div>
    </>
  );
}
