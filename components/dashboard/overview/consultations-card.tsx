"use client";

import {
  Building03Icon,
  Call02Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { addDays, format, isSameDay } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { overview } from "@/lib/content/dashboard";
import { meetingTypeLabels, practiceAreaLabel } from "@/lib/data/labels";
import { leadName, userName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { MeetingType } from "@/lib/data/types";
import { initials } from "@/lib/format";
import { CardEmpty, SectionCard } from "../section-card";
import { StatusBadge } from "../status-badge";

const c = overview.consultations;

const typeIcons: Record<MeetingType, typeof Video01Icon> = {
  video: Video01Icon,
  phone: Call02Icon,
  in_person: Building03Icon,
};

export function ConsultationsCard({ now }: { now: Date }) {
  const consultations = useDemoStore((s) => s.consultations);
  const leads = useDemoStore((s) => s.leads);

  const days = useMemo(() => {
    const tomorrow = addDays(now, 1);
    const rows = consultations
      .filter(
        (con) =>
          con.status === "scheduled" &&
          (isSameDay(new Date(con.start), now) ||
            isSameDay(new Date(con.start), tomorrow)),
      )
      .sort((a, b) => a.start.localeCompare(b.start))
      .map((con) => ({
        ...con,
        lead: leads.find((l) => l.id === con.leadId),
        today: isSameDay(new Date(con.start), now),
      }));
    return [
      { label: c.today, rows: rows.filter((r) => r.today) },
      { label: c.tomorrow, rows: rows.filter((r) => !r.today) },
    ].filter((d) => d.rows.length > 0);
  }, [consultations, leads, now]);

  return (
    <SectionCard title={c.title} description={c.description}>
      {days.length === 0 ? (
        <CardEmpty>{c.empty}</CardEmpty>
      ) : (
        <div className="flex flex-col gap-5">
          {days.map((day) => (
            <section key={day.label} aria-label={day.label}>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {day.label}
              </p>
              <ul className="divide-y">
                {day.rows.map((row) => {
                  const attorney = userName(row.attorneyId);
                  const joinable = row.type === "video" && row.today;
                  return (
                    <li key={row.id} className="flex items-center gap-3 py-3">
                      <span className="w-16 shrink-0 text-sm tabular-nums">
                        {format(new Date(row.start), "h:mm a")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {row.lead ? leadName(row.lead) : row.leadId}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {row.lead && (
                            <StatusBadge className="hidden sm:inline-flex">
                              {practiceAreaLabel(row.lead.practiceArea)}
                            </StatusBadge>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <HugeiconsIcon
                              icon={typeIcons[row.type]}
                              className="size-3.5"
                            />
                            {meetingTypeLabels[row.type]} · {row.duration} min
                          </span>
                        </div>
                      </div>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Avatar size="sm" aria-label={c.with(attorney)} />
                          }
                        >
                          <AvatarFallback>{initials(attorney)}</AvatarFallback>
                        </TooltipTrigger>
                        <TooltipContent>{c.with(attorney)}</TooltipContent>
                      </Tooltip>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        nativeButton={false}
                        render={<Link href="/dashboard/consultations" />}
                      >
                        {joinable ? c.join : c.view}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
