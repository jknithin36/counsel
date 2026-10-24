"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findDemoUser } from "@/lib/data/seed/users";
import { matterStages, stageLabel } from "@/lib/data/stages";
import { useDemoStore } from "@/lib/data/store";
import { formatDate } from "@/lib/format";
import { MATTER_ID, Person, PortalPage } from "./shared";

const explanation: Record<string, string> = {
  intake:
    "We opened your file, confirmed the basic facts, and collected the first documents.",
  investigation:
    "We gathered records, photos, bills, and other evidence to understand what happened.",
  demand:
    "We sent the insurer a clear summary of your injuries, losses, and requested resolution.",
  negotiation:
    "We're discussing a settlement with the insurance company. We'll share any offer with you before deciding anything.",
  litigation:
    "If a fair agreement is not possible, the case may move to court and formal evidence exchange.",
  resolution:
    "We finalize the agreement, payments, and closing paperwork with you.",
};

export function CasePage() {
  const matter = useDemoStore((s) =>
    s.matters.find((item) => item.id === MATTER_ID),
  );
  if (!matter)
    return (
      <PortalPage title="My Case">
        <p>Case details are not available.</p>
      </PortalPage>
    );
  const steps = matterStages[matter.practiceArea];
  const current = steps.findIndex((step) => step.key === matter.stage);
  const next = steps[current + 1];
  const updates = matter.updates.filter((update) => update.shared).toReversed();
  return (
    <PortalPage
      title={matter.title}
      description={`${matter.id} · Personal injury · Opened ${formatDate(matter.openedAt)}`}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your case progress</CardTitle>
          <CardDescription>
            Each step can take a different amount of time. We will keep you
            updated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 md:grid-cols-6">
            {steps.map((step, index) => (
              <li
                key={step.key}
                className={`rounded-lg border p-4 md:min-h-36 ${index === current ? "border-foreground bg-foreground text-background" : index < current ? "bg-muted" : "text-muted-foreground"}`}
              >
                <span className="text-xs">Step {index + 1}</span>
                <p className="mt-2 font-medium">{step.label}</p>
                <p
                  className={`mt-2 text-xs leading-relaxed ${index === current ? "text-background/75" : "text-muted-foreground"}`}
                >
                  {explanation[step.key]}
                </p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Case timeline</CardTitle>
            <CardDescription>
              Only updates shared with you appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {updates.length ? (
                updates.map((update) => (
                  <article
                    key={update.id}
                    className="relative border-l pl-6 before:absolute before:-left-1.5 before:top-1 before:size-3 before:rounded-full before:bg-foreground"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-sans text-base font-medium tracking-normal">
                        {update.title}
                      </h3>
                      <time className="text-xs text-muted-foreground">
                        {formatDate(update.createdAt)}
                      </time>
                    </div>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      {update.body}
                    </p>
                    <div className="mt-3">
                      <Person userId={update.authorId} />
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No case updates have been shared yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>What happens next</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {next?.label ?? "Finishing your matter"}
              </p>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {next
                  ? explanation[next.key]
                  : "We will confirm that every final document and payment is complete."}
              </p>
              {matter.nextAppointment && (
                <p className="mt-4 rounded-lg bg-muted p-3">
                  <span className="block text-xs text-muted-foreground">
                    Next appointment
                  </span>
                  {formatDate(matter.nextAppointment.start, true)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Key details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Case type</dt>
                  <dd>Personal injury</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Lead attorney
                  </dt>
                  <dd>{findDemoUser(matter.leadAttorneyId)?.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Fee arrangement
                  </dt>
                  <dd>
                    Contingency: you pay no attorney fee unless we recover money
                    for you.
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Current stage
                  </dt>
                  <dd>
                    <Badge variant="secondary">
                      {stageLabel(matter.practiceArea, matter.stage)}
                    </Badge>
                  </dd>
                </div>
                {matter.nextDeadline && (
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Important date
                    </dt>
                    <dd>
                      {formatDate(matter.nextDeadline.date)} —{" "}
                      {matter.nextDeadline.label}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalPage>
  );
}
