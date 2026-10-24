"use client";

import { differenceInCalendarDays } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { overview } from "@/lib/content/dashboard";
import { matterDialog } from "@/lib/content/dashboard-practice";
import { staffUsers } from "@/lib/data/seed/users";
import type { MatterStatus } from "@/lib/data/types";
import { initials } from "@/lib/format";
import { StatusBadge, type Tone } from "../status-badge";

export const matterStatusTones: Record<MatterStatus, Tone> = {
  open: "green",
  pending: "amber",
  closed: "neutral",
};

/** "3d left" (amber at 3 or fewer), "Due today", or "2d overdue" (red). */
export function DeadlineBadge({
  date,
  now = new Date(),
}: {
  date: string;
  now?: Date;
}) {
  const c = overview.deadlines;
  const days = differenceInCalendarDays(new Date(date), now);
  return (
    <StatusBadge tone={days < 0 ? "red" : days <= 3 ? "amber" : "neutral"}>
      {days < 0 ? c.overdue(-days) : days === 0 ? c.today : c.daysLeft(days)}
    </StatusBadge>
  );
}

/** Multi-select of staff for a matter team. */
export function TeamPicker({
  value,
  onChange,
  lockedId,
  id,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  /** Always on (the lead attorney). */
  lockedId?: string;
  id?: string;
}) {
  const chosen = new Set([...value, ...(lockedId ? [lockedId] : [])]);
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            className="h-9 w-full justify-start border-input px-2.5 text-sm font-normal"
          />
        }
      >
        {chosen.size === 0 ? (
          <span className="text-muted-foreground">
            {matterDialog.teamPlaceholder}
          </span>
        ) : (
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex -space-x-1.5">
              {[...chosen].slice(0, 4).map((uid) => (
                <Avatar key={uid} size="sm" className="ring-2 ring-background">
                  <AvatarFallback className="text-[10px]">
                    {initials(staffUsers.find((u) => u.id === uid)?.name ?? "")}
                  </AvatarFallback>
                </Avatar>
              ))}
            </span>
            <span className="truncate">
              {matterDialog.teamCount(chosen.size)}
            </span>
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {staffUsers.map((user) => {
                const locked = user.id === lockedId;
                return (
                  <CommandItem
                    key={user.id}
                    value={user.name}
                    disabled={locked}
                    onSelect={() => {
                      const next = new Set(value);
                      if (next.has(user.id)) next.delete(user.id);
                      else next.add(user.id);
                      onChange(
                        staffUsers.map((u) => u.id).filter((x) => next.has(x)),
                      );
                    }}
                    className="[&>svg:last-child]:hidden"
                  >
                    <Checkbox
                      checked={chosen.has(user.id)}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="pointer-events-none"
                    />
                    <span className="truncate">{user.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {user.title}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
