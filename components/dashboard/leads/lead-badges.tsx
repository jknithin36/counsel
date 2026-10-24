import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { leadStatus, urgency } from "@/lib/config/lead-status";
import { findDemoUser } from "@/lib/data/seed/users";
import type { LeadStatus, Urgency } from "@/lib/data/types";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../status-badge";

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = leadStatus(status);
  return <StatusBadge tone={config.tone}>{config.label}</StatusBadge>;
}

export function UrgencyBadge({ value }: { value: Urgency }) {
  const config = urgency(value);
  return <StatusBadge tone={config.tone}>{config.label}</StatusBadge>;
}

/** Avatar + name for a staff member, or a muted placeholder. */
export function UserChip({
  userId,
  fallback,
  className,
  hideName = false,
}: {
  userId?: string;
  fallback: string;
  className?: string;
  hideName?: boolean;
}) {
  const user = userId ? findDemoUser(userId) : undefined;
  if (!user) {
    return (
      <span className={cn("text-muted-foreground", className)}>{fallback}</span>
    );
  }
  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
      <Avatar size="sm" aria-hidden={hideName ? undefined : true}>
        <AvatarFallback className="text-[10px]">
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
      <span className={cn("truncate", hideName && "sr-only")}>{user.name}</span>
    </span>
  );
}
