"use client";

import { format } from "date-fns";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/session";
import { dashboardErrorCopy, overview } from "@/lib/content/dashboard";
import { CardBoundary } from "../card-boundary";
import { useDemoStatus } from "../demo-data-provider";
import { PageHeader } from "../page-header";
import { PageSkeleton } from "../page-skeleton";
import { ActivityCard } from "./activity-card";
import { ConsultationsCard } from "./consultations-card";
import { DeadlinesCard } from "./deadlines-card";
import { NewLeadsCard } from "./new-leads-card";
import { StatCards } from "./stat-cards";

// Charts load after the rest of the overview (Recharts is large).
const chartSkeleton = () => (
  <Skeleton className="h-[352px] w-full rounded-xl" />
);
const LeadsChart = dynamic(
  () => import("./leads-chart").then((m) => m.LeadsChart),
  { ssr: false, loading: chartSkeleton },
);
const LeadsByArea = dynamic(
  () => import("./leads-by-area").then((m) => m.LeadsByArea),
  { ssr: false, loading: chartSkeleton },
);

const ranges = overview.range.options;

export function Overview() {
  const status = useDemoStatus();
  const { user } = useSession();
  // One clock for the whole page so every card agrees on "today".
  const [now] = useState(() => new Date());
  const [range, setRange] = useState("30");
  const days = Number(range);

  if (status === "loading" || !user) return <PageSkeleton />;
  if (status === "error") {
    return (
      <PageHeader
        title={dashboardErrorCopy.title}
        description={dashboardErrorCopy.body}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={overview.greeting(now.getHours(), user.name.split(" ")[0])}
        description={
          <>
            <span className="tabular-nums">
              {format(now, "EEEE, MMMM d, yyyy")}
            </span>
            {". "}
            {overview.subtitle}
          </>
        }
        actions={
          <Select
            items={ranges}
            value={range}
            onValueChange={(value) => value && setRange(value)}
          >
            <SelectTrigger
              aria-label={overview.range.label}
              className="h-8 w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {ranges.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <CardBoundary>
        <StatCards now={now} days={days} />
      </CardBoundary>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <CardBoundary>
            <LeadsChart now={now} days={days} />
          </CardBoundary>
        </div>
        <CardBoundary>
          <LeadsByArea now={now} days={days} />
        </CardBoundary>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CardBoundary>
          <ConsultationsCard now={now} />
        </CardBoundary>
        <CardBoundary>
          <NewLeadsCard now={now} />
        </CardBoundary>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CardBoundary>
          <DeadlinesCard now={now} />
        </CardBoundary>
        <CardBoundary>
          <ActivityCard now={now} />
        </CardBoundary>
      </div>
    </div>
  );
}
