"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { dashboardErrorCopy as copy } from "@/lib/content/dashboard";

export default function DashboardError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={copy.title} description={copy.body} />
      <div>
        <Button size="sm" className="h-8" onClick={() => retry()}>
          {copy.retry}
        </Button>
      </div>
    </div>
  );
}
