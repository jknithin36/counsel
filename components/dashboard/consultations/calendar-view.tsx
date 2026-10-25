"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { consultationsPage as copy } from "@/lib/content/dashboard-practice";
import { meetingTypeLabels, practiceAreaLabel } from "@/lib/data/labels";
import { userName } from "@/lib/data/selectors";
import { cn } from "@/lib/utils";
import { TipButton } from "../tip-button";
import { AttorneyFilter, type ConsultationRow } from "./shared";

const START_HOUR = 8;
const END_HOUR = 18;
const HOUR_PX = 64;
const hours = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i,
);

/** Minutes past the start of the grid, clamped to the visible hours. */
function offset(date: Date) {
  const minutes = date.getHours() * 60 + date.getMinutes() - START_HOUR * 60;
  return Math.min(Math.max(minutes, 0), (END_HOUR - START_HOUR) * 60);
}

/** Splits overlapping events into side-by-side lanes. */
function layout(events: ConsultationRow[]) {
  const sorted = [...events].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );
  const placed: { row: ConsultationRow; lane: number; lanes: number }[] = [];
  let cluster: typeof placed = [];
  let clusterEnd = 0;
  const laneEnds: number[] = [];
  const flush = () => {
    const lanes = Math.max(...cluster.map((p) => p.lane)) + 1;
    for (const p of cluster) p.lanes = lanes;
    cluster = [];
    laneEnds.length = 0;
  };
  for (const row of sorted) {
    const start = row.startDate.getTime();
    if (cluster.length && start >= clusterEnd) flush();
    let lane = laneEnds.findIndex((end) => end <= start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = row.end.getTime();
    const item = { row, lane, lanes: 1 };
    cluster.push(item);
    placed.push(item);
    clusterEnd = Math.max(clusterEnd, row.end.getTime());
  }
  if (cluster.length) flush();
  return placed;
}

export function CalendarView({
  rows,
  onOpen,
}: {
  rows: ConsultationRow[];
  onOpen: (id: string) => void;
}) {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<"week" | "day">("week");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [attorneys, setAttorneys] = useState<string[]>([]);
  const [showCancelled, setShowCancelled] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // Keep the current-time line moving.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const view = isMobile ? "day" : mode;
  const days = useMemo(() => {
    if (view === "day") return [anchor];
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [view, anchor]);

  const visible = rows.filter(
    (r) =>
      (showCancelled || r.status !== "cancelled") &&
      (attorneys.length === 0 || attorneys.includes(r.attorneyId)),
  );

  const first = days[0];
  const last = days[days.length - 1];
  const label =
    view === "day"
      ? format(first, "EEEE, MMM d")
      : isSameMonth(first, last)
        ? `${format(first, "MMM d")} – ${format(last, "d")}`
        : `${format(first, "MMM d")} – ${format(last, "MMM d")}`;

  const step = view === "day" ? 1 : 7;
  const inRange = visible.filter((r) =>
    days.some((d) => isSameDay(d, r.startDate)),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-input"
          onClick={() => setAnchor(startOfDay(new Date()))}
        >
          {copy.today}
        </Button>
        <div className="flex">
          <TipButton
            variant="ghost"
            size="icon"
            aria-label={copy.previous}
            onClick={() => setAnchor((d) => addDays(d, -step))}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </TipButton>
          <TipButton
            variant="ghost"
            size="icon"
            aria-label={copy.next}
            onClick={() => setAnchor((d) => addDays(d, step))}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </TipButton>
        </div>
        <h2
          className="mr-auto font-sans text-sm font-semibold tracking-normal tabular-nums"
          aria-live="polite"
        >
          {label}
        </h2>
        {!isMobile && (
          <ToggleGroup
            variant="outline"
            size="sm"
            spacing={0}
            value={[mode]}
            onValueChange={(value) =>
              value[0] && setMode(value[0] as "week" | "day")
            }
          >
            <ToggleGroupItem value="week" className="h-8 px-3">
              {copy.week}
            </ToggleGroupItem>
            <ToggleGroupItem value="day" className="h-8 px-3">
              {copy.day}
            </ToggleGroupItem>
          </ToggleGroup>
        )}
        <AttorneyFilter selected={attorneys} onChange={setAttorneys} />
        {/* biome-ignore lint/a11y/noLabelWithoutControl: the checkbox renders inside the label */}
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={showCancelled}
            onCheckedChange={(v) => setShowCancelled(Boolean(v))}
          />
          {copy.showCancelled}
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <div
          className="grid min-w-full"
          style={{
            gridTemplateColumns: `56px repeat(${days.length}, minmax(${view === "day" ? 0 : 120}px, 1fr))`,
          }}
        >
          {/* Header row */}
          <div className="sticky left-0 z-10 border-b bg-background" />
          {days.map((day) => {
            const today = isSameDay(day, now);
            return (
              <div
                key={day.toISOString()}
                className="border-b border-l px-2 py-2 text-center"
              >
                <span className="block text-xs text-muted-foreground">
                  {format(day, "EEE")}
                </span>
                <span
                  className={cn(
                    "mx-auto mt-0.5 flex size-7 items-center justify-center rounded-full text-sm tabular-nums",
                    today && "bg-foreground text-background",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
            );
          })}

          {/* Hour labels */}
          <div className="sticky left-0 z-10 bg-background">
            {hours.map((h) => (
              <div
                key={h}
                className="relative pr-2 text-right text-[11px] text-muted-foreground tabular-nums"
                style={{ height: HOUR_PX }}
              >
                <span className="relative -top-2">
                  {format(new Date(2026, 0, 1, h), "h a")}
                </span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const events = layout(
              inRange.filter((r) => isSameDay(r.startDate, day)),
            );
            const today = isSameDay(day, now);
            const nowTop = (offset(now) / 60) * HOUR_PX;
            const showNow =
              today &&
              now.getHours() >= START_HOUR &&
              now.getHours() < END_HOUR;
            return (
              <div
                key={day.toISOString()}
                className="relative border-l"
                style={{ height: hours.length * HOUR_PX }}
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    style={{ height: HOUR_PX }}
                    className="border-b border-border/70"
                  >
                    <div className="h-1/2 border-b border-dashed border-border/50" />
                  </div>
                ))}

                {showNow && (
                  <div
                    aria-hidden="true"
                    data-now-line
                    className="pointer-events-none absolute inset-x-0 z-20 h-px bg-[#111]"
                    style={{ top: nowTop }}
                  >
                    <span className="absolute -top-[3px] -left-[4px] size-[7px] rounded-full bg-[#111]" />
                  </div>
                )}

                {events.map(({ row, lane, lanes }) => {
                  const top = (offset(row.startDate) / 60) * HOUR_PX;
                  const height = Math.max(
                    (row.duration / 60) * HOUR_PX - 2,
                    22,
                  );
                  // Fit the content to the block: short slots (30 min) get
                  // one line, and the practice area only shows when there's
                  // room for a third line.
                  const compact = height < 40;
                  const roomy = height >= 56;
                  const muted =
                    row.status === "completed" || row.status === "cancelled";
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => onOpen(row.id)}
                      className={cn(
                        "absolute overflow-hidden rounded-r-sm border-l-2 border-[#111] bg-[#F2F2F2] px-1.5 text-left text-[12px] leading-tight outline-none hover:bg-[#E8E8E8] focus-visible:ring-2 focus-visible:ring-ring",
                        compact ? "flex items-center gap-1.5 py-0" : "py-1",
                        muted && "border-[#BDBDBD] text-muted-foreground",
                      )}
                      style={{
                        top: top + 1,
                        height,
                        left: `calc(${(lane / lanes) * 100}% + 2px)`,
                        width: `calc(${100 / lanes}% - 4px)`,
                      }}
                      aria-label={`${row.name}, ${format(row.startDate, "EEEE h:mm a")}, ${row.status.replace("_", " ")}`}
                    >
                      <span
                        className={cn(
                          "tabular-nums",
                          compact ? "shrink-0" : "block",
                        )}
                      >
                        {format(row.startDate, "h:mm")}
                        {view === "day" && ` – ${format(row.end, "h:mm a")}`}
                      </span>
                      <span
                        className={cn(
                          "flex min-w-0 items-center gap-1 truncate font-medium",
                          (row.status === "no_show" ||
                            row.status === "cancelled") &&
                            "line-through",
                        )}
                      >
                        {row.status === "no_show" && (
                          <span
                            aria-hidden="true"
                            className="size-1.5 shrink-0 rounded-full bg-[#A23B3B]"
                          />
                        )}
                        <span className="truncate">{row.name}</span>
                      </span>
                      {row.lead && roomy && (
                        <span className="block truncate text-muted-foreground">
                          {practiceAreaLabel(row.lead.practiceArea)}
                          {view === "day" &&
                            ` · ${userName(row.attorneyId)} · ${meetingTypeLabels[row.type]}`}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {inRange.length === 0 && (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      )}
    </div>
  );
}
