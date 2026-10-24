import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { dashboardNotFound as copy } from "@/lib/content/dashboard";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={copy.title} description={copy.body} />
      <div>
        <Button
          variant="secondary"
          size="sm"
          className="h-8"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          {copy.back}
        </Button>
      </div>
    </div>
  );
}
