"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { portalStatusLabels } from "@/lib/data/labels";
import { outstandingFor } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { Client, Matter, PortalStatus } from "@/lib/data/types";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatusBadge, type Tone } from "../status-badge";

export type ClientRow = Client & {
  matterList: Matter[];
  leadAttorneyId?: string;
  balance: number;
  overdue: boolean;
  active: boolean;
};

/** Clients with their matters, lead attorney and balance due. */
export function useClientRows(): ClientRow[] {
  const clients = useDemoStore((s) => s.clients);
  const matters = useDemoStore((s) => s.matters);
  const invoices = useDemoStore((s) => s.invoices);
  const payments = useDemoStore((s) => s.payments);
  return useMemo(
    () =>
      clients.map((client) => {
        const matterList = matters.filter((m) => m.clientId === client.id);
        const current =
          matterList.find((m) => m.status !== "closed") ?? matterList[0];
        const owed = outstandingFor(
          invoices.filter((i) => i.clientId === client.id),
          payments,
        );
        return {
          ...client,
          matterList,
          leadAttorneyId: current?.leadAttorneyId,
          balance: owed.amount,
          overdue: owed.overdue.length > 0,
          active:
            !client.archived && matterList.some((m) => m.status !== "closed"),
        };
      }),
    [clients, matters, invoices, payments],
  );
}

const portalTones: Record<PortalStatus, Tone> = {
  active: "green",
  invited: "blue",
  not_invited: "neutral",
};

export function PortalBadge({
  status = "not_invited",
}: {
  status?: PortalStatus;
}) {
  return (
    <StatusBadge tone={portalTones[status]}>
      {portalStatusLabels[status]}
    </StatusBadge>
  );
}

export function ClientAvatar({
  name,
  size = "default",
  className,
}: {
  name: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} aria-hidden="true" className={className}>
      <AvatarFallback
        className={cn(size === "lg" ? "text-base" : "text-[11px]")}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
