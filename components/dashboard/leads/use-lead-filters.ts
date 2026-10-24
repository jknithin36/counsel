"use client";

import { subDays } from "date-fns";
import { leadName } from "@/lib/data/selectors";
import type { Lead } from "@/lib/data/types";
import { useUrlFilters } from "../use-url-filters";

/*
 * Leads table filters live in the URL (?q=&status=new,contacted&view=…),
 * so a filtered view can be bookmarked or shared and survives reloads.
 */

export const facetKeys = [
  "status",
  "area",
  "source",
  "attorney",
  "urgency",
] as const;
export type FacetKey = (typeof facetKeys)[number];

export type LeadFilters = ReturnType<typeof useLeadFilters>["filters"];

/** Value used in the attorney facet for leads with nobody assigned. */
export const UNASSIGNED = "unassigned";

const config = {
  facets: facetKeys,
  scalars: { view: "all", range: "all" },
};

export function useLeadFilters() {
  return useUrlFilters(config);
}

const digits = (s: string) => s.replace(/\D/g, "");

/** Quick view, date range and search: everything except the facets. */
export function baseFilter(
  leads: Lead[],
  filters: LeadFilters,
  userId: string | undefined,
  now: Date,
) {
  const q = filters.q.trim().toLowerCase();
  const qDigits = digits(q);
  const since =
    filters.range === "all"
      ? null
      : subDays(now, Number(filters.range)).getTime();

  return leads.filter((lead) => {
    if (filters.view === "new" && lead.status !== "new") return false;
    if (filters.view === "unassigned" && lead.assignedAttorney) return false;
    if (filters.view === "urgent" && lead.urgency !== "urgent") return false;
    if (filters.view === "mine" && lead.assignedAttorney !== userId)
      return false;
    if (since !== null && new Date(lead.createdAt).getTime() < since)
      return false;
    if (q) {
      const haystack =
        `${leadName(lead)} ${lead.email} ${lead.description} ${lead.id}`.toLowerCase();
      const phoneHit =
        qDigits.length >= 3 && digits(lead.phone).includes(qDigits);
      if (!haystack.includes(q) && !phoneHit) return false;
    }
    return true;
  });
}

/** The value a lead has for a facet. */
export function facetValue(lead: Lead, key: FacetKey) {
  switch (key) {
    case "status":
      return lead.status;
    case "area":
      return lead.practiceArea;
    case "source":
      return lead.source;
    case "urgency":
      return lead.urgency;
    case "attorney":
      return lead.assignedAttorney ?? UNASSIGNED;
  }
}

export function facetFilter(leads: Lead[], filters: LeadFilters) {
  return leads.filter((lead) =>
    facetKeys.every(
      (key) =>
        filters[key].length === 0 ||
        filters[key].includes(facetValue(lead, key)),
    ),
  );
}
