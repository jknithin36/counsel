import { File01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { twoPaths } from "@/lib/content/home";
import { cn } from "@/lib/utils";
import { MockupFrame, Pill } from "./mockup-frame";

function Tabs({ tabs }: { tabs: readonly string[] }) {
  return (
    <div className="flex gap-5 border-b border-border px-5 text-[13px]">
      {tabs.map((tab, i) => (
        <span
          key={tab}
          className={cn(
            "-mb-px whitespace-nowrap border-b-2 pb-2.5",
            i === 0
              ? "border-[#111] font-medium text-[#111]"
              : "border-transparent text-muted-foreground",
          )}
        >
          {tab}
        </span>
      ))}
    </div>
  );
}

export function DocumentsMockup() {
  const d = twoPaths.documentsPreview;
  return (
    <MockupFrame label={d.label}>
      <p className="px-5 pt-5 pb-4 text-[15px] font-semibold">{d.title}</p>
      <Tabs tabs={d.tabs} />
      <ul className="pr-12 lg:pr-[72px]">
        {d.rows.map((row) => (
          <li
            key={row.name}
            className="flex items-center gap-3 border-b border-border py-3 pl-5 text-[13px]"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface">
              <HugeiconsIcon icon={File01Icon} className="size-4" />
            </span>
            <span className="flex-1 truncate">{row.name}</span>
            <Pill tone={row.tone}>{row.status}</Pill>
          </li>
        ))}
      </ul>
    </MockupFrame>
  );
}

export function MatterMockup() {
  const m = twoPaths.matterPreview;
  return (
    <MockupFrame label={m.label}>
      <div className="px-5 pt-5 pb-4 pr-12 lg:pr-[72px]">
        <p className="text-[12px] text-muted-foreground">{m.matter}</p>
        <p className="mt-1.5 font-serif text-[20px] leading-tight tracking-[-0.02em] lg:text-[22px]">
          {m.title}
        </p>
      </div>
      <Tabs tabs={m.tabs} />
      <div className="flex flex-col gap-4 p-5 pr-12 lg:pr-[72px]">
        <div className="grid grid-cols-2 gap-3">
          {m.stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-surface px-4 py-3">
              <p className="font-serif text-[24px] leading-none tracking-[-0.02em]">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <ul className="rounded-lg border border-border">
          {m.tasks.map((task) => (
            <li
              key={task.title}
              className="flex items-center gap-3 border-b border-border px-4 py-3 text-[13px] last:border-b-0"
            >
              <span className="size-3.5 shrink-0 rounded-full border border-[#c4c4c4]" />
              <span className="flex-1 truncate">{task.title}</span>
              <span className="shrink-0 text-[12px] text-muted-foreground">
                {task.meta}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </MockupFrame>
  );
}
