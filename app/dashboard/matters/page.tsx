import type { Metadata } from "next";
import { Suspense } from "react";
import { MattersPage } from "@/components/dashboard/matters/matters-page";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";

export const metadata: Metadata = { title: "Matters" };

/** Filters live in the URL, so the client table reads search params. */
export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MattersPage />
    </Suspense>
  );
}
