import { File01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { practiceAreasSection } from "@/lib/content/home";
import type { PracticeAreaSlug } from "@/lib/content/practice-areas";
import { cn } from "@/lib/utils";
import { MockupFrame, Pill } from "./mockup-frame";

const { previews } = practiceAreasSection;

/** Header shared by every preview: small label, serif title, optional pill. */
function Header({
  eyebrow,
  title,
  aside,
}: {
  eyebrow: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-6 pt-6 pb-5">
      <div className="min-w-0">
        <p className="text-[12px] text-muted-foreground">{eyebrow}</p>
        <p className="mt-1.5 truncate font-serif text-[22px] leading-tight tracking-[-0.02em]">
          {title}
        </p>
      </div>
      {aside}
    </div>
  );
}

// Content keeps 24px clear of the edge the card clips (it overhangs 48px).
const body = "px-6 py-5 pr-[72px] text-[13px]";

function CaseSummary() {
  const p = previews["personal-injury"];
  return (
    <MockupFrame label={p.label}>
      <Header
        eyebrow={p.eyebrow}
        title={p.title}
        aside={
          <span className="mr-12">
            <Pill tone="warning">{p.status}</Pill>
          </span>
        }
      />
      <div className={body}>
        <dl className="divide-y divide-border rounded-lg border border-border">
          {p.rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-3"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5">
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">{p.progress.label}</span>
            <span className="font-medium">{p.progress.value}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-[#111]"
              style={{ width: `${p.progress.value}%` }}
            />
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

function ParentingSchedule() {
  const p = previews["family-law"];
  const firstWeekday = new Date(Date.UTC(p.year, p.month, 1)).getUTCDay();
  const days = new Date(Date.UTC(p.year, p.month + 1, 0)).getUTCDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <MockupFrame label={p.label}>
      <Header eyebrow={p.eyebrow} title={p.title} />
      <div className={body}>
        <div className="grid grid-cols-7 gap-1 text-center text-[12px]">
          {p.weekdays.map((d, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: weekday letters repeat
            <span key={i} className="pb-1 text-muted-foreground">
              {d}
            </span>
          ))}
          {cells.map((day, i) =>
            day === null ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: leading blanks
              <span key={`blank-${i}`} />
            ) : (
              <span
                key={day}
                className={cn(
                  "flex h-8 items-center justify-center rounded-md tabular-nums",
                  day % 2 === 1
                    ? "bg-[#111] text-white"
                    : "border border-border bg-surface",
                )}
              >
                {day}
              </span>
            ),
          )}
        </div>
        <div className="mt-4 flex items-center gap-5 text-[12px]">
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[#111]" />
            {p.parents.a}
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-sm border border-border bg-surface" />
            {p.parents.b}
          </span>
        </div>
        <p className="mt-4 rounded-lg bg-surface px-3 py-2.5 text-[12px]">
          {p.note}
        </p>
      </div>
    </MockupFrame>
  );
}

function EstateChecklist() {
  const p = previews["estate-planning"];
  return (
    <MockupFrame label={p.label}>
      <Header
        eyebrow={p.eyebrow}
        title={p.title}
        aside={
          <span className="mr-12 mt-1 shrink-0 text-[12px] text-muted-foreground">
            {p.progress}
          </span>
        }
      />
      <ul className={cn(body, "flex flex-col gap-1")}>
        {p.items.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-3 rounded-lg px-1 py-2.5"
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full",
                item.state === "done"
                  ? "bg-[#111] text-white"
                  : "border border-[#c4c4c4]",
              )}
            >
              {item.state === "done" && (
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={2.5}
                  className="size-3"
                />
              )}
            </span>
            <span
              className={cn(
                "flex-1",
                item.state !== "done" && "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
            {"meta" in item && (
              <Pill tone={item.state === "pending" ? "warning" : "neutral"}>
                {item.meta}
              </Pill>
            )}
          </li>
        ))}
      </ul>
    </MockupFrame>
  );
}

const severityTone = {
  High: "danger",
  Medium: "warning",
  Low: "neutral",
} as const;

function ContractReview() {
  const p = previews["business-law"];
  return (
    <MockupFrame label={p.label}>
      <div className="flex items-center gap-3 border-b border-border px-6 pt-6 pb-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface">
          <HugeiconsIcon icon={File01Icon} className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] text-muted-foreground">{p.eyebrow}</p>
          <p className="mt-1 truncate font-serif text-[20px] leading-tight tracking-[-0.02em]">
            {p.title}
          </p>
        </div>
      </div>
      <div className={body}>
        <p className="font-medium">{p.summary}</p>
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
          {p.clauses.map((clause) => (
            <li key={clause.title} className="flex items-start gap-3 px-4 py-3">
              <Pill tone={severityTone[clause.severity]}>
                {clause.severity}
              </Pill>
              <span className="min-w-0">
                <span className="block font-medium">{clause.title}</span>
                <span className="block text-[12px] text-muted-foreground">
                  {clause.note}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[12px] text-muted-foreground">{p.footer}</p>
      </div>
    </MockupFrame>
  );
}

function CaseTimeline() {
  const p = previews["criminal-defense"];
  return (
    <MockupFrame label={p.label}>
      <Header eyebrow={p.eyebrow} title={p.title} />
      <ol className={body}>
        {p.steps.map((step, i) => (
          <li key={step.label} className="relative flex gap-4 pb-5">
            {i < p.steps.length - 1 && (
              <span
                className={cn(
                  "absolute top-4 left-[6px] h-full w-px",
                  step.state === "done" ? "bg-[#111]" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative mt-[3px] flex size-[13px] shrink-0 items-center justify-center rounded-full",
                step.state === "done" && "bg-[#111]",
                step.state === "current" &&
                  "border-2 border-[#111] bg-white after:size-1 after:rounded-full after:bg-[#111]",
                step.state === "upcoming" && "border border-[#c4c4c4] bg-white",
              )}
            />
            <span
              className={cn(
                "flex flex-1 items-baseline justify-between gap-3",
                step.state === "current" && "font-medium",
                step.state === "upcoming" && "text-muted-foreground",
              )}
            >
              {step.label}
              <span className="text-[12px] text-muted-foreground">
                {step.meta}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </MockupFrame>
  );
}

export const practiceAreaMockups: Record<PracticeAreaSlug, () => ReactNode> = {
  "personal-injury": CaseSummary,
  "family-law": ParentingSchedule,
  "estate-planning": EstateChecklist,
  "business-law": ContractReview,
  "criminal-defense": CaseTimeline,
};
