"use client";

import Link from "next/link";
import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { ArrowIcon } from "@/components/site/arrow-icon";
import type {
  PracticeArea,
  PracticeAreaSlug,
} from "@/lib/content/practice-areas";
import { usePracticeAreas } from "@/lib/site-content";
import { cn } from "@/lib/utils";

type Props = {
  items: Pick<PracticeArea, "slug" | "title" | "summary" | "href">[];
  linkLabel: string;
  previews: Record<PracticeAreaSlug, ReactNode>;
  /** Rendered on the server (TexturePanel reads the filesystem). */
  background: ReactNode;
};

/**
 * Accordion list with a sticky preview panel. One item is always open; the
 * panel on the right (desktop) or inside the open item (mobile) shows its
 * mockup.
 */
export function PracticeAreasExplorer({
  items: fallback,
  linkLabel,
  previews,
  background,
}: Props) {
  const live = usePracticeAreas();
  const items = live.length ? live : fallback;
  const [active, setActive] = useState(0);
  const id = useId();
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const activeSlug = items[active].slug;

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = items.length - 1;
    const target = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    triggers.current[target]?.focus();
  }

  return (
    <div className="mt-20 grid gap-16 lg:grid-cols-12">
      <ul className="lg:col-span-5">
        {items.map((item, i) => {
          const open = i === active;
          const triggerId = `${id}-trigger-${i}`;
          const panelId = `${id}-panel-${i}`;

          return (
            <li
              key={item.slug}
              className="border-t border-border last:border-b"
            >
              <h3>
                <button
                  ref={(el) => {
                    triggers.current[i] = el;
                  }}
                  type="button"
                  id={triggerId}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setActive(i)}
                  onKeyDown={(event) => onKeyDown(event, i)}
                  className={cn(
                    "w-full py-7 text-left font-serif text-[26px] leading-tight tracking-[-0.02em] transition-colors duration-150 lg:text-[30px]",
                    open ? "text-[#111]" : "text-[#8f8f8f] hover:text-[#111]",
                  )}
                >
                  {item.title}
                </button>
              </h3>

              {/* -mt-3 sets the summary 16px under the title; the button
                  keeps its 28px padding for the closed state. */}
              <section
                id={panelId}
                aria-labelledby={triggerId}
                hidden={!open}
                className="-mt-3"
              >
                <div className="pb-7">
                  <p className="max-w-[440px] text-[17px] leading-[1.6] text-[#3a3a3a]">
                    {item.summary}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-5 group/arrow inline-flex items-center gap-1.5 text-[15px] font-medium underline-offset-4 hover:underline"
                  >
                    {linkLabel}
                    <span className="sr-only"> about {item.title}</span>{" "}
                    <ArrowIcon />
                  </Link>

                  {/* Mobile: the preview sits inside the open item. */}
                  <div className="relative mt-6 h-[360px] overflow-hidden rounded-[10px] lg:hidden">
                    {background}
                    <div className="absolute top-5 -right-12 left-5 h-full">
                      {previews[item.slug]}
                    </div>
                  </div>
                </div>
              </section>
            </li>
          );
        })}
      </ul>

      {/* Desktop: sticky panel showing the open item's preview. */}
      <div className="hidden lg:col-span-7 lg:block">
        <div className="sticky top-[120px]">
          <div className="relative h-[600px] overflow-hidden rounded-[10px]">
            {background}
            <div className="absolute top-12 -right-12 left-12 h-full">
              {previews[activeSlug]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
