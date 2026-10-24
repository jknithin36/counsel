import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientsPage } from "@/components/dashboard/clients/clients-page";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";

export const metadata: Metadata = { title: "Clients" };

/** Filters live in the URL, so the client table reads search params. */
export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ClientsPage />
    </Suspense>
  );
}
