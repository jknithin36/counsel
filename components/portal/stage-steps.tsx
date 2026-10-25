"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { casePage as copy, stageExplanations } from "@/lib/content/portal";
import { matterStages } from "@/lib/data/stages";
import type { Matter } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** The matter's stages as a vertical list; done, current and upcoming. */
export function StageSteps({
  matter,
  explain = false,
}: {
  matter: Matter;
  /** Show the plain-language description under each step. */
  explain?: boolean;
}) {
  const steps = matterStages[matter.practiceArea];
  const current = steps.findIndex((s) => s.key === matter.stage);
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
            {/* The line joining this step to the next. */}
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-6 bottom-0 left-[11px] w-px",
                  done ? "bg-foreground" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] tabular-nums",
                done && "border-foreground bg-foreground text-background",
                now && "border-foreground bg-background font-semibold",
                !done && !now && "bg-background text-muted-foreground",
              )}
            >
              {done ? (
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={2.5}
                  className="size-3.5"
                />
              ) : (
                i + 1
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "flex items-center gap-2 text-sm",
                  now ? "font-medium" : !done && "text-muted-foreground",
                )}
              >
                {step.label}
                {now && (
                  <span className="rounded-full border px-1.5 py-px text-[11px] font-normal text-muted-foreground">
                    {copy.progress.current}
                  </span>
                )}
                <span className="sr-only">
                  {done ? copy.progress.done : ""}
                </span>
              </p>
              {explain && stageExplanations[step.key] && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {stageExplanations[step.key]}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
