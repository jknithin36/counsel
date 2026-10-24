"use client";

import { differenceInCalendarDays, format } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { overview } from "@/lib/content/dashboard";
import { useDemoStore } from "@/lib/data/store";
import { CardEmpty, SectionCard } from "../section-card";
import { StatusBadge } from "../status-badge";

const c = overview.deadlines;

export function DeadlinesCard({ now }: { now: Date }) {
  const matters = useDemoStore((s) => s.matters);

  const rows = useMemo(
    () =>
      matters
        .flatMap((matter) =>
          matter.status !== "closed" && matter.nextDeadline
            ? [
                {
                  matter,
                  deadline: matter.nextDeadline,
                  days: differenceInCalendarDays(
                    new Date(matter.nextDeadline.date),
                    now,
                  ),
                },
              ]
            : [],
        )
        .filter((r) => r.days <= 14)
        .sort((a, b) => a.days - b.days),
    [matters, now],
  );

  return (
    <SectionCard title={c.title} description={c.description}>
      {rows.length === 0 ? (
        <CardEmpty>{c.empty}</CardEmpty>
      ) : (
        <ul className="divide-y">
          {rows.map(({ matter, deadline, days }) => (
            <li
              key={matter.id}
              className="relative flex items-center gap-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground tabular-nums">
                  {matter.id}
                </p>
                <Link
                  href={`/dashboard/matters/${matter.id}`}
                  className="block truncate font-medium outline-none after:absolute after:inset-0 focus-visible:after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-ring"
                >
                  {matter.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {deadline.label}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm tabular-nums">
                  {format(new Date(deadline.date), "MMM d")}
                </span>
                <StatusBadge
                  tone={days < 0 ? "red" : days <= 3 ? "amber" : "neutral"}
                >
                  {days < 0
                    ? c.overdue(-days)
                    : days === 0
                      ? c.today
                      : c.daysLeft(days)}
                </StatusBadge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
