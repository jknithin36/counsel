"use client";

import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { leadStatuses } from "@/lib/config/lead-status";
import { leadDetail as copy } from "@/lib/content/dashboard-leads";
import { runConflictCheck } from "@/lib/data/conflicts";
import { practiceAreaLabel, sourceLabels } from "@/lib/data/labels";
import { leadName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { LeadStatus } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { useDemoStatus } from "../demo-data-provider";
import { PageSkeleton } from "../page-skeleton";
import { TipButton } from "../tip-button";
import { ConvertDialog } from "./convert-dialog";
import { DeleteLeadsDialog } from "./delete-dialog";
import {
  AttorneyRadioItems,
  changeAssignee,
  changeStatus,
} from "./lead-actions-menu";
import { LeadStatusBadge, UrgencyBadge } from "./lead-badges";
import {
  AssignmentCard,
  ConflictCard,
  ConsultationCard,
  ContactCard,
  IntakeCard,
  LeadActivityCard,
  NotesCard,
  SourceCard,
} from "./lead-detail-cards";
import { ScheduleDialog } from "./schedule-dialog";

const NONE = "none";

export function LeadDetail({ id }: { id: string }) {
  const status = useDemoStatus();
  const router = useRouter();
  const lead = useDemoStore((s) => s.leads.find((l) => l.id === id));
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Deleting removes the lead; don't flash a 404 on the way out.
  const [deleted, setDeleted] = useState(false);

  if (status !== "ready" || deleted) return <PageSkeleton />;
  if (!lead) notFound();

  const name = leadName(lead);
  const canConvert =
    !lead.matterId &&
    (lead.status === "consultation_scheduled" || lead.status === "retained");

  function checkConflicts() {
    document
      .getElementById("conflict-check")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (!lead) return;
    const result = runConflictCheck(lead.id);
    if (result) toast.add({ title: copy.conflict.done(result.matches.length) });
  }

  const convertButton = (
    <Button
      variant="outline"
      size="sm"
      className="h-9 border-input"
      disabled={!canConvert}
      title={canConvert ? undefined : copy.convertHint}
      onClick={() => setConvertOpen(true)}
    >
      {copy.convert}
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-[32px] leading-tight">{name}</h1>
            <div className="flex gap-1.5">
              <LeadStatusBadge status={lead.status} />
              <UrgencyBadge value={lead.urgency} />
            </div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy.subtitle(
              practiceAreaLabel(lead.practiceArea),
              formatDate(lead.createdAt),
              sourceLabels[lead.source].toLowerCase(),
              lead.id,
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            items={leadStatuses}
            value={lead.status}
            onValueChange={(v) => v && changeStatus(lead, v as LeadStatus)}
          >
            <SelectTrigger aria-label={copy.statusLabel} className="h-9 w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {leadStatuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-input"
            onClick={() => setScheduleOpen(true)}
          >
            {copy.schedule}
          </Button>
          {convertButton}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <TipButton
                  variant="outline"
                  size="icon"
                  className="size-9 border-input"
                  aria-label={copy.more}
                />
              }
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {copy.menu.assign}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-52">
                  <DropdownMenuRadioGroup
                    value={lead.assignedAttorney ?? NONE}
                    onValueChange={(v) =>
                      changeAssignee(
                        lead,
                        v === NONE ? undefined : (v as string),
                      )
                    }
                  >
                    <AttorneyRadioItems area={lead.practiceArea} />
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={checkConflicts}>
                {copy.menu.conflict}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={lead.status === "not_a_fit"}
                onClick={() => changeStatus(lead, "not_a_fit")}
              >
                {copy.menu.notFit}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                {copy.menu.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {lead.matterId && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm">
          <span>{copy.converted(lead.matterId)}</span>
          <Link
            href={`/dashboard/matters/${lead.matterId}`}
            className="font-medium underline-offset-4 hover:underline"
          >
            {copy.openMatter}
          </Link>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <IntakeCard lead={lead} />
          <ConflictCard lead={lead} />
          <NotesCard lead={lead} />
          <LeadActivityCard lead={lead} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <ContactCard lead={lead} />
          <AssignmentCard lead={lead} />
          <ConsultationCard
            lead={lead}
            onSchedule={() => setScheduleOpen(true)}
          />
          <SourceCard lead={lead} />
        </div>
      </div>

      <ScheduleDialog
        lead={lead}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
      />
      <ConvertDialog
        lead={lead}
        open={convertOpen}
        onOpenChange={setConvertOpen}
      />
      <DeleteLeadsDialog
        ids={[lead.id]}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          setDeleted(true);
          router.push("/dashboard/leads");
        }}
      />
    </div>
  );
}
