import {
  Briefcase01Icon,
  Calendar03Icon,
  DashboardSquare01Icon,
  File01Icon,
  FileEditIcon,
  Invoice01Icon,
  Message01Icon,
  Notification01Icon,
  Search01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowIcon } from "@/components/site/arrow-icon";
import { buttonVariants } from "@/components/ui/button";
import { portalPreview as p } from "@/lib/content/home";
import { cn } from "@/lib/utils";

const navIcons = {
  overview: DashboardSquare01Icon,
  case: Briefcase01Icon,
  documents: File01Icon,
  messages: Message01Icon,
  billing: Invoice01Icon,
  appointments: Calendar03Icon,
};

const card = "rounded-[10px] bg-surface";

function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
        className,
      )}
    >
      {initials}
    </span>
  );
}

function Sidebar() {
  return (
    <div className="hidden w-[220px] shrink-0 flex-col bg-[#111] px-4 py-5 text-white lg:flex xl:w-[260px] xl:px-5">
      <div className="flex items-center justify-between px-2">
        <span className="font-serif text-[22px] leading-none tracking-[-0.02em]">
          {p.brand}
        </span>
        <span className="flex items-center gap-3 text-white/60">
          <HugeiconsIcon icon={Notification01Icon} className="size-4" />
          <HugeiconsIcon icon={Search01Icon} className="size-4" />
        </span>
      </div>

      <ul className="mt-8 flex flex-col gap-0.5 text-[14px]">
        {p.nav.map((item) => (
          <li
            key={item.key}
            className={cn(
              "flex items-center gap-3 rounded-md px-2.5 py-2 text-white/65",
              "active" in item && "bg-white/10 text-white",
            )}
          >
            <HugeiconsIcon icon={navIcons[item.key]} className="size-4" />
            <span className="flex-1">{item.label}</span>
            {"badge" in item && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-semibold text-[#111]">
                {item.badge}
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center gap-3 border-t border-white/10 px-2 pt-4">
        <Avatar initials={p.user.initials} className="bg-white text-[#111]" />
        <span className="flex flex-col leading-tight">
          <span className="text-[13px] font-medium">{p.user.name}</span>
          <span className="text-[12px] text-white/55">{p.user.role}</span>
        </span>
      </div>
    </div>
  );
}

function Stats() {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3">
      {p.stats.map((stat) => (
        <div key={stat.label} className={cn(card, "p-4 xl:p-5")}>
          <p className="text-[11px] text-muted-foreground md:text-[12px]">
            {stat.label}
          </p>
          <p className="mt-1.5 truncate font-serif text-[26px] leading-none tracking-[-0.02em] md:text-[24px] lg:text-[22px] xl:text-[34px]">
            {stat.value}
          </p>
          <p className="mt-2 flex items-center gap-1.5 truncate text-[11px] text-muted-foreground md:text-[12px]">
            {"status" in stat && (
              <span className="size-1.5 shrink-0 rounded-full bg-[#2f9e5b]" />
            )}
            {stat.detail}
          </p>
        </div>
      ))}
    </div>
  );
}

function Timeline() {
  return (
    <div className="rounded-[10px] border border-border p-4 lg:p-5">
      <p className="text-[13px] font-semibold">{p.timeline.title}</p>
      <ol className="mt-4 flex flex-col">
        {p.timeline.steps.map((step, i) => {
          const last = i === p.timeline.steps.length - 1;
          return (
            <li key={step.label} className="relative flex gap-3 pb-3.5">
              {!last && (
                <span
                  className={cn(
                    "absolute top-3.5 left-[5px] h-full w-px",
                    step.state === "done" ? "bg-[#111]" : "bg-border",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative mt-1 flex size-[11px] shrink-0 items-center justify-center rounded-full",
                  step.state === "done" && "bg-[#111]",
                  step.state === "current" &&
                    "border-2 border-[#111] bg-white after:size-[3px] after:rounded-full after:bg-[#111]",
                  step.state === "upcoming" &&
                    "border border-[#c4c4c4] bg-white",
                )}
              />
              <span
                className={cn(
                  "flex flex-1 items-baseline justify-between gap-2 text-[13px] leading-snug",
                  step.state === "current" &&
                    "-my-1 rounded-md bg-surface px-2 py-1 font-medium",
                  step.state === "upcoming" && "text-muted-foreground",
                )}
              >
                {step.label}
                <span className="text-[12px] text-muted-foreground">
                  {step.meta}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function LatestMessage() {
  const m = p.message;
  return (
    <div className="hidden flex-col rounded-[10px] border border-border p-5 lg:flex">
      <p className="text-[13px] font-semibold">{m.title}</p>
      <div className="mt-4 flex items-center gap-2.5">
        <Avatar initials={m.initials} className="bg-[#111] text-white" />
        <p className="text-[12px] leading-tight text-muted-foreground">
          <span className="font-medium text-[#111]">{m.author}</span> · {m.role}{" "}
          · {m.time}
        </p>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-[#3a3a3a]">
        {m.body}
      </p>
      <div className="mt-auto flex h-9 items-center justify-between rounded-md border border-border px-3 text-[12px] text-muted-foreground">
        {m.replyPlaceholder}
        <HugeiconsIcon icon={SentIcon} className="size-3.5" />
      </div>
    </div>
  );
}

export function PortalMockup() {
  return (
    <div role="img" aria-label={p.label} className="h-full">
      <div
        aria-hidden="true"
        className="flex h-full overflow-hidden rounded-t-[10px] bg-white text-[#111] shadow-[0_24px_60px_rgba(0,0,0,0.25)] select-none"
      >
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="whitespace-nowrap font-serif text-[22px] leading-none tracking-[-0.02em] md:text-[26px] lg:text-[32px]">
              {p.title}
            </p>
            <div className="hidden items-center gap-2 md:flex">
              <span
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
              >
                {p.actions.message}
              </span>
              <span className={cn(buttonVariants({ size: "sm" }))}>
                {p.actions.upload}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2.5 text-[12px] md:text-[13px]">
            <HugeiconsIcon icon={FileEditIcon} className="size-4 shrink-0" />
            <span className="flex-1 truncate">{p.notice.text}</span>
            <span className="inline-flex shrink-0 items-center gap-1 font-medium underline underline-offset-2">
              {p.notice.link} <ArrowIcon />
            </span>
          </div>

          <Stats />

          <div className="grid gap-3 lg:grid-cols-2">
            <Timeline />
            <LatestMessage />
          </div>
        </div>
      </div>
    </div>
  );
}
