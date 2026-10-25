"use client";

import { casePage as copy, stageExplanations } from "@/lib/content/portal";
import { practiceAreaLabel } from "@/lib/data/labels";
import { findDemoUser } from "@/lib/data/seed/users";
import { matterStages, stageLabel } from "@/lib/data/stages";
import { formatDate } from "@/lib/format";
import { CardEmpty, SectionCard } from "../dashboard/section-card";
import { Person, PortalPage } from "./shared";
import { StageSteps } from "./stage-steps";
import { usePortal } from "./use-portal";

export function CasePage() {
  const { matter } = usePortal();
  if (!matter)
    return (
      <PortalPage title={copy.title}>
        <CardEmpty>{copy.notFound}</CardEmpty>
      </PortalPage>
    );

  const steps = matterStages[matter.practiceArea];
  const next = steps[steps.findIndex((s) => s.key === matter.stage) + 1];
  const updates = matter.updates.filter((u) => u.shared).toReversed();
  const d = copy.details;

  return (
    <PortalPage
      title={matter.title}
      description={copy.meta(
        matter.id,
        practiceAreaLabel(matter.practiceArea),
        formatDate(matter.openedAt),
      )}
    >
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <SectionCard
            title={copy.timeline.title}
            description={copy.timeline.description}
          >
            {updates.length === 0 ? (
              <CardEmpty>{copy.timeline.empty}</CardEmpty>
            ) : (
              <ol className="flex flex-col divide-y">
                {updates.map((u) => (
                  <li key={u.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="font-sans text-sm font-medium tracking-normal">
                        {u.title}
                      </h3>
                      <time
                        dateTime={u.createdAt}
                        className="text-xs text-muted-foreground tabular-nums"
                      >
                        {formatDate(u.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {u.body}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {copy.timeline.by(findDemoUser(u.authorId)?.name ?? "")}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <SectionCard title={copy.next.title}>
            <p className="text-sm font-medium">
              {next?.label ?? copy.next.finishing}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {next ? stageExplanations[next.key] : copy.next.finishingBody}
            </p>
          </SectionCard>

          <SectionCard
            title={copy.progress.title}
            description={copy.progress.description}
          >
            <StageSteps matter={matter} explain />
          </SectionCard>

          <SectionCard title={d.title}>
            <dl className="flex flex-col gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">{d.attorney}</dt>
                <dd className="mt-1.5">
                  <Person userId={matter.leadAttorneyId} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{d.type}</dt>
                <dd className="mt-1">
                  {practiceAreaLabel(matter.practiceArea)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{d.stage}</dt>
                <dd className="mt-1">
                  {stageLabel(matter.practiceArea, matter.stage)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{d.fee}</dt>
                <dd className="mt-1 leading-relaxed">
                  {copy.feeTypes[matter.feeType]}
                </dd>
              </div>
              {matter.nextDeadline && (
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {d.deadline}
                  </dt>
                  <dd className="mt-1">
                    <span className="tabular-nums">
                      {formatDate(matter.nextDeadline.date)}
                    </span>
                    <span className="block text-muted-foreground">
                      {matter.nextDeadline.label}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </SectionCard>
        </div>
      </div>
    </PortalPage>
  );
}
