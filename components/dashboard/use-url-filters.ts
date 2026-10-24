"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/*
 * Table filters that live in the URL (?q=&status=a,b&view=…), so a
 * filtered view can be bookmarked or shared and survives reloads.
 * `scalars` maps single-value params to their defaults; `facets` are
 * comma-separated lists. Defaults are left out of the URL. Pass a
 * module-level config object so it stays stable between renders.
 */

type Filters<F extends string, S extends string> = { q: string } & Record<
  S,
  string
> &
  Record<F, string[]>;

export function useUrlFilters<F extends string, S extends string>(config: {
  facets: readonly F[];
  scalars: Record<S, string>;
}) {
  const { facets, scalars } = config;
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => {
    const result: Record<string, string | string[]> = {
      q: params.get("q") ?? "",
    };
    for (const [key, fallback] of Object.entries<string>(scalars))
      result[key] = params.get(key) ?? fallback;
    for (const key of facets)
      result[key] = params.get(key)?.split(",").filter(Boolean) ?? [];
    return result as Filters<F, S>;
  }, [params, facets, scalars]);

  const setParams = useCallback(
    (changes: Partial<Record<"q" | F | S, string | string[] | null>>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes) as [
        string,
        string | string[] | null,
      ][]) {
        const text = Array.isArray(value) ? value.join(",") : value;
        if (!text || (scalars as Record<string, string>)[key] === text)
          next.delete(key);
        else next.set(key, text);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, router, pathname, scalars],
  );

  /** Filters other than the view tab (the first scalar named "view"). */
  const active =
    filters.q !== "" ||
    facets.some((key) => filters[key].length > 0) ||
    (Object.keys(scalars) as S[]).some(
      (key) => key !== "view" && filters[key] !== scalars[key],
    );

  /** Clears search and filters; `everything` also resets the view tab. */
  const reset = useCallback(
    (everything = false) => {
      const cleared: Record<string, null> = { q: null };
      for (const key of facets) cleared[key] = null;
      for (const key of Object.keys(scalars))
        if (everything || key !== "view") cleared[key] = null;
      setParams(cleared as Partial<Record<"q" | F | S, null>>);
    },
    [facets, scalars, setParams],
  );

  return { filters, setParams, active, reset };
}
