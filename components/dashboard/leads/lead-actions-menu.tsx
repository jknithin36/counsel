"use client";

import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { leadStatus, leadStatuses } from "@/lib/config/lead-status";
import { leadsPage } from "@/lib/content/dashboard-leads";
import { attorneysByArea } from "@/lib/data/attorneys";
import { assignLead, setLeadStatus } from "@/lib/data/leads";
import { leadName, userName } from "@/lib/data/selectors";
import type { Lead, LeadStatus } from "@/lib/data/types";
import { TipButton } from "../tip-button";

const a = leadsPage.actions;
const NONE = "none";

export function changeStatus(lead: Lead, status: LeadStatus) {
  setLeadStatus(lead.id, status);
  toast.add({
    title: leadsPage.statusChanged(leadName(lead), leadStatus(status).label),
  });
}

export function changeAssignee(lead: Lead, attorneyId: string | undefined) {
  assignLead(lead.id, attorneyId);
  toast.add({
    title: leadsPage.assigned(
      leadName(lead),
      attorneyId ? userName(attorneyId) : "",
    ),
  });
}

/** Attorneys for the lead's practice area first, as radio items. */
export function AttorneyRadioItems({ area }: { area: string }) {
  const { inArea, others } = attorneysByArea(area);
  return (
    <>
      <DropdownMenuRadioItem value={NONE} closeOnClick>
        {a.unassign}
      </DropdownMenuRadioItem>
      <DropdownMenuSeparator />
      {[...inArea, ...others].map((u) => (
        <DropdownMenuRadioItem key={u.id} value={u.id} closeOnClick>
          {u.name}
        </DropdownMenuRadioItem>
      ))}
    </>
  );
}

export function StatusRadioItems() {
  return leadStatuses.map((s) => (
    <DropdownMenuRadioItem key={s.value} value={s.value} closeOnClick>
      {s.label}
    </DropdownMenuRadioItem>
  ));
}

/** The "…" menu on a lead row. */
export function LeadActionsMenu({
  lead,
  onSchedule,
  onDelete,
}: {
  lead: Lead;
  onSchedule: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <TipButton
            variant="ghost"
            size="icon"
            aria-label={leadsPage.rowActions(leadName(lead))}
          />
        }
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          render={<Link href={`/dashboard/leads/${lead.id}`} />}
        >
          {a.view}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{a.assign}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52">
            <DropdownMenuRadioGroup
              value={lead.assignedAttorney ?? NONE}
              onValueChange={(v) =>
                changeAssignee(lead, v === NONE ? undefined : (v as string))
              }
            >
              <AttorneyRadioItems area={lead.practiceArea} />
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{a.status}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            <DropdownMenuRadioGroup
              value={lead.status}
              onValueChange={(v) => changeStatus(lead, v as LeadStatus)}
            >
              <StatusRadioItems />
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={onSchedule}>{a.schedule}</DropdownMenuItem>
        <DropdownMenuItem
          disabled={lead.status === "not_a_fit"}
          onClick={() => changeStatus(lead, "not_a_fit")}
        >
          {a.notFit}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          {a.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
