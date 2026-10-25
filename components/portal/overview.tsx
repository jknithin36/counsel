"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appointmentsPage, portalOverview as copy } from "@/lib/content/portal";
import { matterStages, stageLabel } from "@/lib/data/stages";
import { useDemoStore } from "@/lib/data/store";
import { formatDate, formatMoney } from "@/lib/format";
import { Stat } from "../dashboard/overview/stat-cards";
import { CardEmpty, SectionCard } from "../dashboard/section-card";
import { Person, PortalPage } from "./shared";
import { StageSteps } from "./stage-steps";
import { UploadDialog } from "./upload-dialog";
import { usePortal, usePortalTasks } from "./use-portal";

/** A row in a card that links somewhere, with a trailing arrow. */
function LinkRow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
    >
      <span className="min-w-0">{children}</span>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        strokeWidth={2}
        className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
      />
    </Link>
  );
}

export function PortalOverview() {
  const { user, matter, firstName } = usePortal();
  const tasks = usePortalTasks();
  const appointment = useDemoStore(
    (s) =>
      s.appointments
        .filter((a) => a.matterId === matter?.id && a.status === "upcoming")
        .sort((a, b) => a.start.localeCompare(b.start))[0],
  );
  const thread = useDemoStore((s) =>
    s.threads.find((t) => t.matterId === matter?.id),
  );

  if (!matter || !user)
    return (
      <PortalPage title={copy.title(firstName)}>
        <CardEmpty>{copy.updates.empty}</CardEmpty>
      </PortalPage>
    );

  const steps = matterStages[matter.practiceArea];
  const step = steps.findIndex((s) => s.key === matter.stage) + 1;
  const latest = thread?.messages
    .filter((m) => !m.internal && m.authorId !== user.id)
    .at(-1);
  const updates = matter.updates
    .filter((u) => u.shared)
    .slice(-3)
    .reverse();
  const todo = [
    tasks.toSign.length > 0 && {
      href: "/portal/documents",
      label: copy.todo.sign(tasks.toSign.length),
    },
    tasks.toUpload.length > 0 && {
      href: "/portal/documents",
      label: copy.todo.upload(tasks.toUpload.length),
    },
    tasks.toFill.length > 0 && {
      href: "/portal/forms",
      label: copy.todo.form(tasks.toFill.length),
    },
    tasks.balance > 0 && {
      href: "/portal/billing",
      label: copy.todo.pay(formatMoney(tasks.balance, true)),
    },
  ].filter(Boolean) as { href: string; label: string }[];
  const team = [
    matter.leadAttorneyId,
    ...matter.team.filter((id) => id !== matter.leadAttorneyId),
  ];

  return (
    <PortalPage
      title={copy.title(firstName)}
      description={copy.subtitle(matter.title)}
      actions={
        <>
          <UploadDialog
            trigger={<Button variant="outline" size="sm" className="h-8" />}
          />
          <Button
            size="sm"
            className="h-8"
            nativeButton={false}
            render={<Link href="/portal/messages" />}
          >
            {copy.message}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label={copy.stats.stage}
          value={stageLabel(matter.practiceArea, matter.stage)}
          detail={copy.stats.stageDetail(step, steps.length)}
        />
        <Stat
          label={copy.stats.appointment}
          value={
            appointment
              ? formatDate(appointment.start)
              : copy.stats.noAppointment
          }
          detail={
            appointment
              ? `${formatDate(appointment.start, true).split(", ").at(-1)} · ${appointmentsPage.types[appointment.type]}`
              : ""
          }
        />
        <Stat
          label={copy.stats.balance}
          value={formatMoney(tasks.balance, true)}
          detail={
            tasks.nextDue
              ? copy.stats.balanceDetail(formatDate(tasks.nextDue.dueAt))
              : copy.stats.balanceClear
          }
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <SectionCard
            title={copy.todo.title}
            description={copy.todo.description}
          >
            {todo.length === 0 ? (
              <p className="text-sm text-muted-foreground">{copy.todo.empty}</p>
            ) : (
              <div className="flex flex-col divide-y">
                {todo.map((t) => (
                  <LinkRow key={t.label} href={t.href}>
                    {t.label}
                  </LinkRow>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title={copy.updates.title}
            description={copy.updates.description}
            action={
              updates.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground"
                  nativeButton={false}
                  render={<Link href="/portal/case" />}
                >
                  {copy.updates.all}
                </Button>
              )
            }
          >
            {updates.length === 0 ? (
              <CardEmpty>{copy.updates.empty}</CardEmpty>
            ) : (
              <div className="flex flex-col divide-y">
                {updates.map((u) => (
                  <article key={u.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="font-sans text-sm font-medium tracking-normal">
                        {u.title}
                      </h3>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatDate(u.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {u.body}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <SectionCard
            title={copy.progress.title}
            action={
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground"
                nativeButton={false}
                render={<Link href="/portal/case" />}
              >
                {copy.progress.viewCase}
              </Button>
            }
          >
            <StageSteps matter={matter} />
          </SectionCard>

          <SectionCard
            title={copy.latestMessage.title}
            description={latest ? formatDate(latest.sentAt, true) : undefined}
          >
            {latest ? (
              <div className="flex flex-col gap-3">
                <Person userId={latest.authorId} size="sm" />
                <p className="line-clamp-4 text-sm leading-relaxed">
                  {latest.body}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 self-start"
                  nativeButton={false}
                  render={<Link href="/portal/messages" />}
                >
                  {copy.latestMessage.open}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {copy.latestMessage.empty}
              </p>
            )}
          </SectionCard>

          <SectionCard title={copy.team.title}>
            <ul className="flex flex-col gap-4">
              {team.map((id) => (
                <li key={id}>
                  <Person userId={id} />
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </PortalPage>
  );
}
