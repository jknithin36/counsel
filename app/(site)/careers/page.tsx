import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { careersPage as copy } from "@/lib/content/pages";

export const metadata: Metadata = {
  title: copy.title,
  description: copy.intro,
};

export default function CareersPage() {
  return (
    <div className="pb-[88px] lg:pb-[140px]">
      <PageHeader
        breadcrumbs={[{ label: copy.title, href: "/careers" }]}
        title={copy.title}
        intro={copy.intro}
      />
    </div>
  );
}
