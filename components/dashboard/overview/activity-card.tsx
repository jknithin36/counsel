"use client";

import Link from "next/link";
import { overview } from "@/lib/content/dashboard";
import { findDemoUser } from "@/lib/data/seed/users";
import { useDemoStore } from "@/lib/data/store";
import { timeAgo } from "@/lib/format";
import { CardEmpty, SectionCard } from "../section-card";

const c = overview.activity;

const outsideActors: Record<string, string> = {
  website: "Website",
  client: "Client",
};

export function ActivityCard({ now }: { now: Date }) {
  const events = useDemoStore((s) => s.activityLog);
  const latest = events.slice(0, 10);

  return (
    <SectionCard title={c.title} description={c.description}>
      {latest.length === 0 ? (
        <CardEmpty>{c.empty}</CardEmpty>
      ) : (
        <ol className="relative flex flex-col">
          {latest.map((event, i) => (
            <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < latest.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-3 left-[3px] h-full w-px bg-border"
                />
              )}
              <span
                aria-hidden="true"
                className="relative mt-1.5 size-[7px] shrink-0 rounded-full bg-foreground"
              />
              <div className="min-w-0">
                {event.href ? (
                  <Link
                    href={event.href}
                    className="text-sm leading-snug underline-offset-4 hover:underline"
                  >
                    {event.message}
                  </Link>
                ) : (
                  <p className="text-sm leading-snug">{event.message}</p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                  {findDemoUser(event.actorId)?.name ??
                    outsideActors[event.actorId] ??
                    event.actorId}{" "}
                  · {timeAgo(event.createdAt, now)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}
