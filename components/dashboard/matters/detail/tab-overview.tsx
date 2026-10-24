"use client";

import { addDays } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { matterDetail as copy } from "@/lib/content/dashboard-practice";
import { feeTypeLabels } from "@/lib/data/labels";
import { addTask, toggleTask } from "@/lib/data/matters";
import { findDemoUser } from "@/lib/data/seed/users";
import { invoiceTotal, outstandingFor, userName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { Matter, MatterUpdate } from "@/lib/data/types";
import { formatDate, formatMoney, initials } from "@/lib/format";
import { SectionCard } from "../../section-card";
import { StatusBadge } from "../../status-badge";
import { DeadlineBadge } from "../matter-bits";

/** Updates newest first, with author, date and visibility. */
export function UpdatesList({ updates }: { updates: MatterUpdate[] }) {
  return (
    <ol className="flex flex-col">
      {updates.map((u, i) => (
        <li key={u.id} className="relative flex gap-3 pb-5 last:pb-0">
          {i < updates.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-3 left-[3px] h-full w-px bg-border"
            />
          )}
          <span
            aria-hidden="true"
            className="relative mt-1.5 size-[7px] shrink-0 rounded-full bg-foreground"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm font-medium">{u.title}</p>
              <StatusBadge tone={u.shared ? "blue" : "neutral"}>
                {u.shared ? copy.visibility.shared : copy.visibility.internal}
              </StatusBadge>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {u.body}
            </p>
            <p className="mt-1 text-xs text-muted-foreground tabular-nums">
              {userName(u.authorId)} · {formatDate(u.createdAt, true)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export const newestFirst = (updates: MatterUpdate[]) =>
  [...updates].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

function Item({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

export function OverviewTab({
  matter,
  onShowTimeline,
  onManageTeam,
}: {
  matter: Matter;
  onShowTimeline: () => void;
  onManageTeam: () => void;
}) {
  const o = copy.overview;
  const client = useDemoStore((s) =>
    s.clients.find((c) => c.id === matter.clientId),
  );
  const invoices = useDemoStore((s) => s.invoices);
  const payments = useDemoStore((s) => s.payments);
  const [draft, setDraft] = useState("");

  const open = matter.tasks.filter((t) => !t.done);
  const mine = invoices.filter((i) => i.matterId === matter.id);
  const billed = mine
    .filter((i) => i.status !== "draft" && i.status !== "void")
    .reduce((s, i) => s + invoiceTotal(i), 0);
  const outstanding = outstandingFor(mine, payments).amount;

  function quickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    addTask(matter.id, {
      title: draft,
      assigneeId: matter.leadAttorneyId,
      dueAt: addDays(new Date(), 7).toISOString(),
      priority: "medium",
    });
    setDraft("");
    toast.add({ title: copy.tasks.dialog.added });
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
        <SectionCard
          title={o.updates}
          action={
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={onShowTimeline}
            >
              {o.allUpdates}
            </Button>
          }
        >
          {matter.updates.length === 0 ? (
            <p className="text-sm text-muted-foreground">{o.noUpdates}</p>
          ) : (
            <UpdatesList updates={newestFirst(matter.updates).slice(0, 5)} />
          )}
        </SectionCard>

        <SectionCard title={o.tasks}>
          <form onSubmit={quickAdd}>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={o.quickAdd}
              aria-label={o.quickAdd}
              className="h-9"
            />
          </form>
          {open.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{o.noTasks}</p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y">
              {open.map((task) => (
                <li key={task.id} className="flex items-center gap-3 py-2.5">
                  <Checkbox
                    aria-label={copy.tasks.complete(task.title)}
                    checked={false}
                    onCheckedChange={() => {
                      toggleTask(matter.id, task.id, true);
                      toast.add({ title: copy.tasks.done });
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {task.title}
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {userName(task.assigneeId)}
                  </span>
                  <DeadlineBadge date={task.dueAt} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <SectionCard title={o.client}>
          {client && (
            <div className="flex flex-col gap-1 text-sm">
              <Link
                href={`/dashboard/clients/${client.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {client.name}
              </Link>
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="truncate text-muted-foreground underline-offset-4 hover:underline"
                >
                  {client.email}
                </a>
              )}
              {client.phone && (
                <a
                  href={`tel:${client.phone.replace(/\D/g, "")}`}
                  className="text-muted-foreground tabular-nums underline-offset-4 hover:underline"
                >
                  {client.phone}
                </a>
              )}
              <span className="text-muted-foreground">{client.language}</span>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title={o.team}
          action={
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={onManageTeam}
            >
              {o.manage}
            </Button>
          }
        >
          <ul className="flex flex-col gap-3">
            {matter.team.map((id) => {
              const user = findDemoUser(id);
              return (
                <li key={id} className="flex items-center gap-3">
                  <Avatar size="sm" aria-hidden="true">
                    <AvatarFallback className="text-[10px]">
                      {initials(user?.name ?? "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {id === matter.leadAttorneyId ? o.lead : user?.title}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard title={o.keyDates}>
          <dl className="flex flex-col divide-y">
            <Item label={o.opened}>
              <span className="tabular-nums">
                {formatDate(matter.openedAt)}
              </span>
            </Item>
            <Item label={o.deadline}>
              {matter.nextDeadline && matter.status !== "closed" ? (
                <span className="flex flex-col items-end gap-1">
                  <span className="tabular-nums">
                    {formatDate(matter.nextDeadline.date)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {matter.nextDeadline.label}
                  </span>
                  <DeadlineBadge date={matter.nextDeadline.date} />
                </span>
              ) : (
                <span className="text-muted-foreground">{o.notSet}</span>
              )}
            </Item>
            {matter.nextAppointment && (
              <Item label={o.appointment}>
                <span className="tabular-nums">
                  {formatDate(matter.nextAppointment.start, true)}
                </span>
              </Item>
            )}
            <Item label={o.limitations}>
              {matter.limitationsDate ? (
                <span className="tabular-nums">
                  {formatDate(matter.limitationsDate)}
                </span>
              ) : (
                <span className="text-muted-foreground">{o.notSet}</span>
              )}
            </Item>
          </dl>
        </SectionCard>

        <SectionCard title={o.opposing}>
          {matter.opposingParties.length === 0 ? (
            <p className="text-sm text-muted-foreground">{o.noOpposing}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {matter.opposingParties.map((party) => {
                const [, name, role] = party.match(
                  /^(.*?)(?:\s*\((.*)\))?$/,
                ) ?? [party, party];
                return (
                  <li key={party}>
                    {name}
                    {role && (
                      <span className="block text-xs text-muted-foreground capitalize">
                        {role}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={o.financials}>
          <dl className="flex flex-col divide-y">
            <Item label={o.fee}>{feeTypeLabels[matter.feeType]}</Item>
            {matter.feeType === "contingency" ? (
              <Item label={o.estimated}>
                <span className="tabular-nums">
                  {matter.estimatedValue
                    ? formatMoney(matter.estimatedValue)
                    : o.notSet}
                </span>
              </Item>
            ) : (
              <Item label={o.budget}>
                <span className="tabular-nums">
                  {matter.budget ? formatMoney(matter.budget) : o.notSet}
                </span>
              </Item>
            )}
            <Item label={o.billed}>
              <span className="tabular-nums">{formatMoney(billed)}</span>
            </Item>
            <Item label={o.outstanding}>
              <span className="tabular-nums">{formatMoney(outstanding)}</span>
            </Item>
            <Item label={o.trust}>
              <span className="tabular-nums">
                {formatMoney(client?.trustBalance ?? 0)}
              </span>
            </Item>
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}
