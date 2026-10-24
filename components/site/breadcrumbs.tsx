import Link from "next/link";
import { JsonLd } from "@/components/site/json-ld";
import { common } from "@/lib/content/pages";
import { absoluteUrl } from "@/lib/site-url";

export type Crumb = { label: string; href: string };

/** Breadcrumb trail (Home is added first) with BreadcrumbList JSON-LD. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail = [{ label: common.home, href: "/" }, ...items];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((crumb, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: crumb.label,
            item: absoluteUrl(crumb.href),
          })),
        }}
      />
      <nav aria-label={common.breadcrumbLabel}>
        <ol className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
          {trail.map((crumb, i) => {
            const current = i === trail.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {current ? (
                  <span aria-current="page" className="text-[#111]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="underline-offset-4 hover:text-[#111] hover:underline"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
