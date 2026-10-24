import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/site/breadcrumbs";

/** Inner-page hero: breadcrumb, optional eyebrow, H1, intro and actions. */
export function PageHeader({
  breadcrumbs,
  eyebrow,
  title,
  intro,
  actions,
}: {
  /** Trail after Home; the last item is the current page. */
  breadcrumbs?: Crumb[];
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="bg-white pt-14 pb-16 lg:pt-[100px]">
      <div className="container-page">
        <div className="mx-auto max-w-[1200px]">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          {eyebrow && (
            <p className="mt-10 text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1
            className={`${eyebrow ? "mt-4" : "mt-10"} max-w-[900px] text-[clamp(2.75rem,6vw,5rem)] leading-[1.02] tracking-[-0.025em] text-[#111]`}
          >
            {title}
          </h1>
          {intro && (
            <p className="mt-6 max-w-[640px] text-[19px] leading-[1.6] text-[#3a3a3a]">
              {intro}
            </p>
          )}
          {actions && (
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
