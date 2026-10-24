import type { Metadata } from "next";
import { Suspense } from "react";
import { LeadsPage } from "@/components/dashboard/leads/leads-page";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";

export const metadata: Metadata = { title: "Leads" };

/** Filters live in the URL, so the client table reads search params. */
export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LeadsPage />
    </Suspense>
  );
}
