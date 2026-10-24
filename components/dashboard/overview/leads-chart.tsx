"use client";

import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { overview } from "@/lib/content/dashboard";
import { useDemoStore } from "@/lib/data/store";
import { CardEmpty, SectionCard } from "../section-card";

const c = overview.leadsChart;
type Filter = (typeof c.tabs)[number]["value"];

const config = {
  leads: { label: c.series, color: "var(--chart-1)" },
} satisfies ChartConfig;

export function LeadsChart({ now, days }: { now: Date; days: number }) {
  const leads = useDemoStore((s) => s.leads);
  const [filter, setFilter] = useState<Filter>("all");

  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const lead of leads) {
      if (filter !== "all" && lead.source !== filter) continue;
      const key = format(new Date(lead.createdAt), "yyyy-MM-dd");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return eachDayOfInterval({
      start: startOfDay(subDays(now, days - 1)),
      end: startOfDay(now),
    }).map((day) => ({
      date: format(day, "MMM d"),
      leads: counts.get(format(day, "yyyy-MM-dd")) ?? 0,
    }));
  }, [leads, filter, now, days]);

  const total = data.reduce((sum, d) => sum + d.leads, 0);

  return (
    <SectionCard
      title={c.title}
      description={c.description(days)}
      action={
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {c.tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-2.5 text-xs"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      {total === 0 ? (
        <CardEmpty>{c.empty}</CardEmpty>
      ) : (
        <ChartContainer
          config={config}
          className="aspect-auto h-[260px] w-full"
        >
          <BarChart data={data} margin={{ left: -24, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideIndicator />}
            />
            <Bar
              dataKey="leads"
              fill="var(--color-leads)"
              radius={2}
              maxBarSize={18}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      )}
    </SectionCard>
  );
}
