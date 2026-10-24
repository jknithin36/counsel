"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { urgency } from "@/lib/config/lead-status";
import { overview } from "@/lib/content/dashboard";
import { practiceAreaLabel, sourceLabels } from "@/lib/data/labels";
import { leadName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import { timeAgo } from "@/lib/format";
import { CardEmpty, SectionCard } from "../section-card";
import { StatusBadge } from "../status-badge";

const c = overview.newLeads;

export function NewLeadsCard({ now }: { now: Date }) {
  const leads = useDemoStore((s) => s.leads);
  // Leads are stored newest first.
  const latest = leads.slice(0, 6);

  return (
    <SectionCard
      title={c.title}
      description={c.description}
      contentClassName="px-0"
      action={
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          nativeButton={false}
          render={<Link href="/dashboard/leads" />}
        >
          {c.viewAll}
        </Button>
      }
    >
      {latest.length === 0 ? (
        <div className="px-4">
          <CardEmpty>{c.empty}</CardEmpty>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">{c.columns.name}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {c.columns.area}
              </TableHead>
              <TableHead>{c.columns.urgency}</TableHead>
              <TableHead className="hidden md:table-cell">
                {c.columns.source}
              </TableHead>
              <TableHead className="pr-4 text-right">
                {c.columns.received}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {latest.map((lead) => (
              <TableRow key={lead.id} className="relative">
                <TableCell className="max-w-40 pl-4">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="block truncate font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
                  >
                    {leadName(lead)}
                  </Link>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {practiceAreaLabel(lead.practiceArea)}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={urgency(lead.urgency).tone}>
                    {urgency(lead.urgency).label}
                  </StatusBadge>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {sourceLabels[lead.source]}
                </TableCell>
                <TableCell className="pr-4 text-right text-muted-foreground tabular-nums">
                  {timeAgo(lead.createdAt, now)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );
}
