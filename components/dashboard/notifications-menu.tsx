"use client";

import { Notification01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dashboardShell as copy } from "@/lib/content/dashboard";
import { useDemoStore } from "@/lib/data/store";
import { timeAgo } from "@/lib/format";
import { useDemoStatus } from "./demo-data-provider";
import { TipButton } from "./tip-button";

/** Latest firm activity; the trigger is styled by where it sits. */
export function NotificationsMenu({
  className,
  side = "bottom",
}: {
  className?: string;
  side?: "bottom" | "right";
}) {
  const ready = useDemoStatus() === "ready";
  const events = useDemoStore((s) => s.activityLog);
  const latest = ready ? events.slice(0, 6) : [];
  const n = copy.notifications;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <TipButton
            variant="ghost"
            size="icon"
            aria-label={n.label}
            className={className}
          />
        }
      >
        <HugeiconsIcon icon={Notification01Icon} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align={side === "right" ? "start" : "end"}
        className="w-80"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{n.heading}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {latest.length === 0 ? (
          <p className="px-1.5 py-4 text-center text-sm text-muted-foreground">
            {n.empty}
          </p>
        ) : (
          latest.map((event) => (
            <DropdownMenuItem
              key={event.id}
              className="items-start py-2"
              render={<Link href={event.href ?? "/dashboard"} />}
            >
              <span
                aria-hidden="true"
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground"
              />
              <span className="grid min-w-0 gap-0.5">
                <span className="text-sm leading-snug">{event.message}</span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(event.createdAt)}
                </span>
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
