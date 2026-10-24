import type { Metadata } from "next";
import { Suspense } from "react";
import { MessagesPage } from "@/components/dashboard/messages/messages-page";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";

export const metadata: Metadata = { title: "Messages" };

/** The open thread lives in the URL (?thread=M-…). */
export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MessagesPage />
    </Suspense>
  );
}
