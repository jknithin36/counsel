"use client";

import { subDays } from "date-fns";
import { useMemo, useState } from "react";
import { Cell, Label, Pie, PieChart } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { overview } from "@/lib/content/dashboard";
import { practiceAreaLabel } from "@/lib/data/labels";
import { useDemoStore } from "@/lib/data/store";
import { CardEmpty, SectionCard } from "../section-card";

const c = overview.byArea;

/** Grayscale, darkest for the largest slice. */
const shades = [
  "#111111",
  "#3a3a3a",
  "#6b6b6b",
  "#8f8f8f",
  "#bdbdbd",
  "#e0e0e0",
];

export function LeadsByArea({ now, days }: { now: Date; days: number }) {
  const leads = useDemoStore((s) => s.leads);
  const [active, setActive] = useState<number | null>(null);

  const rows = useMemo(() => {
    const start = subDays(now, days).getTime();
    const counts = new Map<string, number>();
    for (const lead of leads) {
      if (new Date(lead.createdAt).getTime() < start) continue;
      const label = practiceAreaLabel(lead.practiceArea);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .map((row, i) => ({
        ...row,
        // Chart config keys become CSS variable names, so no spaces.
        key: `area${i}`,
        fill: shades[i % shades.length],
      }));
  }, [leads, now, days]);

  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const config = useMemo(
    () =>
      Object.fromEntries(
        rows.map((row) => [row.key, { label: row.label, color: row.fill }]),
      ) satisfies ChartConfig,
    [rows],
  );

  const hovered = active === null ? undefined : rows[active];
  const percent = (count: number) => Math.round((count / total) * 100);

  return (
    <SectionCard title={c.title} description={c.description}>
      {rows.length === 0 ? (
        <CardEmpty>{c.empty}</CardEmpty>
      ) : (
        <>
          <ChartContainer
            config={config}
            aria-hidden="true"
            className="mx-auto aspect-square h-[236px] max-w-full"
          >
            <PieChart>
              <Pie
                data={rows}
                dataKey="count"
                nameKey="key"
                innerRadius={72}
                outerRadius={108}
                paddingAngle={1.5}
                stroke="var(--card)"
                strokeWidth={2}
                isAnimationActive={false}
                onMouseEnter={(_, index) => setActive(index)}
                onMouseLeave={() => setActive(null)}
              >
                {rows.map((row, i) => (
                  <Cell
                    key={row.key}
                    fill={row.fill}
                    opacity={active === null || active === i ? 1 : 0.3}
                    className="transition-opacity duration-150"
                  />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox)) return null;
                    const cx = viewBox.cx ?? 0;
                    const cy = viewBox.cy ?? 0;
                    return (
                      <text x={cx} y={cy} textAnchor="middle">
                        <tspan
                          x={cx}
                          y={cy + 2}
                          className="fill-foreground font-serif text-[32px] tabular-nums"
                        >
                          {hovered ? hovered.count : total}
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          {hovered
                            ? `${hovered.label} · ${percent(hovered.count)}%`
                            : c.centerLabel}
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {c.hint}
          </p>

          {/* The chart is visual only; this carries the numbers. */}
          <ul className="sr-only">
            {rows.map((row) => (
              <li key={row.key}>
                {row.label}: {row.count} ({percent(row.count)}%)
              </li>
            ))}
          </ul>
        </>
      )}
    </SectionCard>
  );
}
