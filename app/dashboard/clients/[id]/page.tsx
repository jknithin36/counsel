import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientDetail } from "@/components/dashboard/clients/client-detail";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";

export const metadata: Metadata = { title: "Client" };

/** Clients live in the browser store, so the page resolves the id client-side. */
export default async function Page({
  params,
}: PageProps<"/dashboard/clients/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ClientDetail id={decodeURIComponent(id)} />
    </Suspense>
  );
}
