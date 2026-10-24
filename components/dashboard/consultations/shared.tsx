"use client";

import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { consultationsPage as copy } from "@/lib/content/dashboard-practice";
import { consultationStatusLabels } from "@/lib/data/labels";
import { attorneyUsers } from "@/lib/data/seed/users";
import { leadName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { Consultation, Lead } from "@/lib/data/types";
import { initials } from "@/lib/format";
import type { Tone } from "../status-badge";

export type ConsultationRow = Consultation & {
  lead?: Lead;
  name: string;
  startDate: Date;
  end: Date;
};

/** Consultations joined with their lead, ready for the calendar and list. */
export function useConsultationRows() {
  const consultations = useDemoStore((s) => s.consultations);
  const leads = useDemoStore((s) => s.leads);
  return useMemo(
    () =>
      consultations.map((c) => {
        const lead = leads.find((l) => l.id === c.leadId);
        const startDate = new Date(c.start);
        return {
          ...c,
          lead,
          name: lead ? leadName(lead) : c.leadId,
          startDate,
          end: new Date(startDate.getTime() + c.duration * 60_000),
        } satisfies ConsultationRow;
      }),
    [consultations, leads],
  );
}

export const consultationTones: Record<Consultation["status"], Tone> = {
  scheduled: "blue",
  completed: "green",
  no_show: "red",
  cancelled: "neutral",
};

export const consultationStatusOptions = (
  Object.keys(consultationStatusLabels) as Consultation["status"][]
).map((value) => ({ value, label: consultationStatusLabels[value] }));

/** Multi-select of attorneys with avatars; empty selection means all. */
export function AttorneyFilter({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const chosen = new Set(selected);
  const label =
    chosen.size === 0
      ? copy.allAttorneys
      : chosen.size === 1
        ? (attorneyUsers.find((u) => chosen.has(u.id))?.name ?? "")
        : copy.attorneysCount(chosen.size);

  function toggle(id: string) {
    const next = new Set(chosen);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(attorneyUsers.map((u) => u.id).filter((uid) => next.has(uid)));
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-input font-normal"
            aria-label={`${copy.attorneys}: ${label}`}
          />
        }
      >
        <HugeiconsIcon icon={UserGroupIcon} />
        {label}
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {attorneyUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() => toggle(user.id)}
                  className="[&>svg:last-child]:hidden"
                >
                  <Checkbox
                    checked={chosen.has(user.id)}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="pointer-events-none"
                  />
                  <Avatar size="sm" aria-hidden="true">
                    <AvatarFallback className="text-[10px]">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
            {chosen.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center"
                  >
                    {copy.allAttorneys}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
