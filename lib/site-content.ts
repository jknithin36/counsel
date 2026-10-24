"use client";

import {
  defaultAnnouncement,
  defaultAttorneys,
  defaultFaqs,
  defaultFirm,
  defaultPracticeAreas,
  defaultResults,
  defaultResultsDisclaimer,
  defaultSettings,
  defaultTestimonials,
  defaultTestimonialsDisclaimer,
} from "@/lib/config/defaults";
import { useDemoStore } from "@/lib/data/store";
import type { Settings } from "@/lib/data/types";

/*
 * The public site's view of editable content: static defaults merged with
 * what the dashboard saved in this browser.
 *
 * During server rendering and hydration the store reports its initial
 * (empty) state, so these return the defaults and the HTML matches; the
 * saved edits appear right after hydration.
 */

export function useAnnouncement() {
  return (
    useDemoStore((s) => s.contentOverrides.announcement) ?? defaultAnnouncement
  );
}

export function useFirm() {
  return useDemoStore((s) => s.contentOverrides.firm) ?? defaultFirm;
}

/** "(555) 555-0148" → "tel:5555550148". */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** Every attorney in display order, including hidden ones. */
export function useAllAttorneys() {
  return useDemoStore((s) => s.contentOverrides.attorneys) ?? defaultAttorneys;
}

/** Attorneys shown on the site, in display order. */
export function useAttorneys() {
  return useAllAttorneys().filter((a) => a.visible);
}

export function useAttorney(slug: string) {
  return useAllAttorneys().find((a) => a.slug === slug);
}

export function usePracticeAreas() {
  return (
    useDemoStore((s) => s.contentOverrides.practiceAreas) ??
    defaultPracticeAreas
  );
}

export function usePracticeArea(slug: string) {
  return usePracticeAreas().find((a) => a.slug === slug);
}

export function useResults() {
  const items =
    useDemoStore((s) => s.contentOverrides.results) ?? defaultResults;
  const disclaimer =
    useDemoStore((s) => s.contentOverrides.resultsDisclaimer) ??
    defaultResultsDisclaimer;
  return { items, disclaimer };
}

export function useTestimonials() {
  const items =
    useDemoStore((s) => s.contentOverrides.testimonials) ?? defaultTestimonials;
  const disclaimer =
    useDemoStore((s) => s.contentOverrides.testimonialsDisclaimer) ??
    defaultTestimonialsDisclaimer;
  return { items: items.filter((t) => t.visible), disclaimer };
}

export function useFaqs() {
  return useDemoStore((s) => s.contentOverrides.faqs) ?? defaultFaqs;
}

/** A settings section with defaults filled in. */
export function useSettings<K extends keyof Omit<Settings, "published">>(
  section: K,
): Settings[K] {
  return useDemoStore((s) => s.settings[section]) ?? defaultSettings[section];
}
