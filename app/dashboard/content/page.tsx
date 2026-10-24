import type { Metadata } from "next";
import { Suspense } from "react";
import { ContentPage } from "@/components/dashboard/content/content-page";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";

export const metadata: Metadata = { title: "Website content" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ContentPage />
    </Suspense>
  );
}
