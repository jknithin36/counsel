"use client";

import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { documentsPage, portalShell } from "@/lib/content/portal";
import { findDemoUser } from "@/lib/data/seed/users";
import type { DocumentStatus } from "@/lib/data/types";
import { initials } from "@/lib/format";
import { PageHeader } from "../dashboard/page-header";
import { PageSkeleton } from "../dashboard/page-skeleton";
import { StatusBadge, type Tone } from "../dashboard/status-badge";
import { usePortalStatus } from "./provider";

/** A portal page: the dashboard's header, with loading and error states. */
export function PortalPage({
  title,
  description,
  actions,
  back,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** A link back to the parent page, shown above the title. */
  back?: { href: string; label: string };
  children: React.ReactNode;
}) {
  const status = usePortalStatus();
  if (status === "loading") return <PageSkeleton label={portalShell.loading} />;
  if (status === "error")
    return (
      <p role="alert" className="text-sm text-muted-foreground">
        {portalShell.loadError}
      </p>
    );
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {back && (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 self-start px-2 text-muted-foreground"
            nativeButton={false}
            render={<Link href={back.href} />}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {back.label}
          </Button>
        )}
        <PageHeader title={title} description={description} actions={actions} />
      </div>
      {children}
    </div>
  );
}

/** A staff member's avatar, name and title. */
export function Person({
  userId,
  subtitle,
  size = "default",
}: {
  userId: string;
  subtitle?: string;
  size?: "default" | "sm";
}) {
  const user = findDemoUser(userId);
  const name = user?.name ?? "";
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size={size === "sm" ? "sm" : "default"}>
        <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {subtitle ?? user?.title}
        </p>
      </div>
    </div>
  );
}

const documentTone: Record<DocumentStatus, Tone> = {
  requested: "amber",
  uploaded: "neutral",
  reviewed: "neutral",
  sent_for_signature: "amber",
  signed: "green",
};

export function DocumentBadge({ status }: { status: DocumentStatus }) {
  return (
    <StatusBadge tone={documentTone[status]}>
      {documentsPage.statuses[status]}
    </StatusBadge>
  );
}
