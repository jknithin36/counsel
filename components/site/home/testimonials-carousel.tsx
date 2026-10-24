"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import { ArrowIcon } from "@/components/site/arrow-icon";
import { testimonials as t } from "@/lib/content/home";
import { useAllAttorneys, useTestimonials } from "@/lib/site-content";

const initials = (name: string) =>
  name
    .replace(".", "")
    .split(" ")
    .map((part) => part[0])
    .join("");

/** One testimonial at a time; the bars below switch between them. */
export function TestimonialsCarousel({
  background,
}: {
  background: ReactNode;
}) {
  const { items, disclaimer } = useTestimonials();
  const people = useAllAttorneys();
  const [index, setIndex] = useState(0);
  const item = items[Math.min(index, items.length - 1)];
  if (!item) return null;
  const attorney = people.find((a) => a.slug === item.attorney && a.visible);

  return (
    <section
      id="testimonials"
      aria-roledescription="carousel"
      aria-label={t.label}
      className="bg-surface py-[88px] lg:py-[140px]"
    >
      <h2 className="sr-only">{t.label}</h2>
      <div className="container-page">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Visual: texture, a large quote mark and the client's initials. */}
            <div
              aria-hidden="true"
              className="relative flex aspect-square w-full max-w-[360px] items-center justify-center overflow-hidden rounded-[10px] lg:col-span-5 lg:max-w-none"
            >
              {background}
              <span className="absolute top-[12%] left-[14%] font-serif text-[160px] leading-none text-white/15">
                “
              </span>
              <span className="relative font-serif text-[56px] leading-none tracking-[-0.02em] text-white/85">
                {initials(item.name)}
              </span>
            </div>

            {/* biome-ignore lint/a11y/useSemanticElements: role="group" is the WAI-ARIA carousel slide pattern */}
            <div
              aria-live="polite"
              role="group"
              aria-roledescription="slide"
              aria-label={t.slideLabel(index + 1, items.length)}
              className="lg:col-span-7"
            >
              <blockquote className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.2] tracking-[-0.02em] text-[#111]">
                <p className="relative">
                  <span aria-hidden="true" className="absolute right-full">
                    “
                  </span>
                  {item.quote}”
                </p>
              </blockquote>
              <p className="mt-10 text-[17px] font-semibold text-[#111]">
                {item.name}
              </p>
              <p className="text-[15px] text-muted-foreground">
                {item.context}
              </p>
              {attorney && (
                <Link
                  href={`/attorneys/${attorney.slug}`}
                  className="group/arrow mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium underline-offset-4 hover:underline"
                >
                  {t.representedBy} {attorney.name} <ArrowIcon />
                </Link>
              )}
            </div>
          </div>

          <div className="mt-16 flex items-center gap-3">
            {items.map((testimonial, i) => (
              <button
                key={testimonial.id}
                type="button"
                aria-label={t.barLabel(i + 1)}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                className="group flex-1 py-3"
              >
                <span
                  className={
                    i === index
                      ? "block h-0.5 bg-[#111]"
                      : "block h-0.5 bg-[#dadada] group-hover:bg-[#9a9a9a]"
                  }
                />
              </button>
            ))}
          </div>

          <p className="mt-6 text-[12px] text-[#8a8a8a]">{disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
