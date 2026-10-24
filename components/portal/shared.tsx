"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { findDemoUser } from "@/lib/data/seed/users";
import type { DocumentStatus } from "@/lib/data/types";
import { formatDate, initials } from "@/lib/format";
import { usePortalStatus } from "./provider";

export const MATTER_ID = "M-2026-0142";
export const CLIENT_ID = "cl-delgado";

export function PortalPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const status = usePortalStatus();
  if (status === "loading") return <PortalLoading />;
  if (status === "error")
    return <p role="alert">The portal could not load. Please refresh.</p>;
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}

export function PortalLoading() {
  return (
    <output className="block space-y-6" aria-label="Loading portal">
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-36 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </output>
  );
}

export function Person({
  userId,
  subtitle,
}: {
  userId: string;
  subtitle?: string;
}) {
  const user = findDemoUser(userId);
  const name = user?.name ?? "Your legal team";
  return (
    <div className="flex items-center gap-3">
      <Avatar size="lg">
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {subtitle ?? user?.title}
        </p>
      </div>
    </div>
  );
}

const statusLabel: Record<DocumentStatus, string> = {
  requested: "Needed",
  uploaded: "Uploaded",
  reviewed: "Reviewed",
  sent_for_signature: "Needs signature",
  signed: "Signed",
};
export function DocumentBadge({ status }: { status: DocumentStatus }) {
  return <Badge variant="secondary">{statusLabel[status]}</Badge>;
}
export function DateText({
  value,
  time = false,
}: {
  value: string;
  time?: boolean;
}) {
  return <time dateTime={value}>{formatDate(value, time)}</time>;
}
