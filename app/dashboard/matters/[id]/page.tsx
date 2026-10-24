import type { Metadata } from "next";
import { Suspense } from "react";
import { MatterDetail } from "@/components/dashboard/matters/detail/matter-detail";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";

export const metadata: Metadata = { title: "Matter" };

/** Matters live in the browser store, so the page resolves the id client-side. */
export default async function Page({
  params,
}: PageProps<"/dashboard/matters/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MatterDetail id={decodeURIComponent(id)} />
    </Suspense>
  );
}
