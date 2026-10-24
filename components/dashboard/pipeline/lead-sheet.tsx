"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { leadStatuses } from "@/lib/config/lead-status";
import { pipelinePage } from "@/lib/content/dashboard-leads";
import { practiceAreaLabel } from "@/lib/data/labels";
import { leadName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { LeadStatus } from "@/lib/data/types";
import { formatDate, timeAgo } from "@/lib/format";
import { AttorneySelect } from "../leads/attorney-select";
import { changeAssignee, changeStatus } from "../leads/lead-actions-menu";
import { LeadStatusBadge, UrgencyBadge } from "../leads/lead-badges";
import { ScheduleDialog } from "../leads/schedule-dialog";

const s = pipelinePage.sheet;

/** Quick look at a lead from the pipeline board. */
export function LeadSheet({
  leadId,
  onOpenChange,
}: {
  leadId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const lead = useDemoStore((st) => st.leads.find((l) => l.id === leadId));
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <Sheet open={Boolean(leadId && lead)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {lead && (
          <>
            <SheetHeader className="border-b p-5 pr-12">
              <SheetTitle className="font-serif text-[26px] leading-tight font-normal">
                {leadName(lead)}
              </SheetTitle>
              <SheetDescription>
                {practiceAreaLabel(lead.practiceArea)} · {lead.id}
              </SheetDescription>
              <div className="flex gap-1.5 pt-1">
                <LeadStatusBadge status={lead.status} />
                <UrgencyBadge value={lead.urgency} />
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {s.received}
                  </dt>
                  <dd className="mt-1 tabular-nums">
                    {formatDate(lead.createdAt)}
                    <span className="block text-xs text-muted-foreground">
                      {timeAgo(lead.createdAt)}
                    </span>
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{s.contact}</dt>
                  <dd className="mt-1 min-w-0">
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone.replace(/\D/g, "")}`}
                        className="block tabular-nums underline-offset-4 hover:underline"
                      >
                        {lead.phone}
                      </a>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="block truncate text-xs text-muted-foreground underline-offset-4 hover:underline"
                      >
                        {lead.email}
                      </a>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <span
                    className="text-xs text-muted-foreground"
                    id="sheet-status"
                  >
                    {s.status}
                  </span>
                  <Select
                    items={leadStatuses}
                    value={lead.status}
                    onValueChange={(v) =>
                      v && changeStatus(lead, v as LeadStatus)
                    }
                  >
                    <SelectTrigger
                      aria-labelledby="sheet-status"
                      className="h-9 w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {leadStatuses.map((st) => (
                        <SelectItem key={st.value} value={st.value}>
                          {st.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <span
                    className="text-xs text-muted-foreground"
                    id="sheet-assigned"
                  >
                    {s.assigned}
                  </span>
                  <AttorneySelect
                    aria-label={s.assigned}
                    area={lead.practiceArea}
                    value={lead.assignedAttorney}
                    onChange={(id) => changeAssignee(lead, id)}
                    allowUnassigned
                  />
                </div>
              </div>

              <div>
                <h3 className="font-sans text-xs font-normal tracking-normal text-muted-foreground">
                  {s.description}
                </h3>
                <p className="mt-1 line-clamp-6 text-sm leading-relaxed">
                  {lead.description}
                </p>
              </div>

              <div>
                <h3 className="font-sans text-xs font-normal tracking-normal text-muted-foreground">
                  {s.notes}
                </h3>
                {lead.notes.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.noNotes}
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-3">
                    {lead.notes.slice(0, 2).map((note) => (
                      <li
                        key={note.id}
                        className="rounded-lg bg-muted/60 p-3 text-sm"
                      >
                        <p className="line-clamp-3">{note.body}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {note.author} · {timeAgo(note.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <SheetFooter className="flex-row border-t p-4">
              <Button
                variant="outline"
                size="sm"
                className="h-9 flex-1 border-input"
                onClick={() => setScheduleOpen(true)}
              >
                {s.schedule}
              </Button>
              <Button
                size="sm"
                className="h-9 flex-1"
                nativeButton={false}
                render={<Link href={`/dashboard/leads/${lead.id}`} />}
              >
                {s.open}
              </Button>
            </SheetFooter>
          </>
        )}
        {/* Nested in the sheet so Escape closes only the dialog. */}
        {lead && (
          <ScheduleDialog
            lead={lead}
            open={scheduleOpen}
            onOpenChange={setScheduleOpen}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
