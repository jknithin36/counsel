import { Suspense } from "react";
import { ConsultationForm } from "@/components/site/consultation/consultation-form";
import { NextStepsPanel } from "@/components/site/consultation/next-steps-panel";
import { PageHeader } from "@/components/site/page-header";
import { consultation as c } from "@/lib/content/consultation";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: c.metaTitle,
  description: c.intro,
  path: "/consultation",
});

export default function ConsultationPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: c.breadcrumb, href: "/consultation" }]}
        title={c.title}
        intro={c.intro}
      />
      <section className="bg-white pb-[88px] lg:pb-[140px]">
        <div className="container-page">
          <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Mobile: a compact panel above the form; desktop: sticky right. */}
            <aside className="lg:order-last lg:col-span-5">
              <div className="lg:sticky lg:top-[120px]">
                <NextStepsPanel />
              </div>
            </aside>
            <div className="lg:col-span-7">
              <Suspense fallback={<div className="min-h-[640px]" />}>
                <ConsultationForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
