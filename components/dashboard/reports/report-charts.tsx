"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

/*
 * Report charts. Loaded on demand (next/dynamic) so Recharts stays out of
 * the first page load. Grayscale only; values are labelled on the bars.
 */

type Row = Record<string, string | number>;

const short = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(1)}M`
    : v >= 1000
      ? `$${Math.round(v / 1000)}k`
      : `$${v}`;

/** Horizontal bars for a ranked or ordered list. */
export function HBarChart({
  data,
  labelKey,
  valueKey,
  label,
  money,
}: {
  data: Row[];
  labelKey: string;
  valueKey: string;
  label: string;
  money?: boolean;
}) {
  const config = {
    [valueKey]: { label, color: "var(--chart-1)" },
  } satisfies ChartConfig;
  const fmt = (v: number) => (money ? short(v) : String(v));
  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full"
      style={{ height: Math.max(120, data.length * 40 + 16) }}
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 0, right: 48, top: 0, bottom: 0 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey={labelKey}
          tickLine={false}
          axisLine={false}
          width={128}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideIndicator
              formatter={(value) => `${label}: ${fmt(Number(value))}`}
            />
          }
        />
        <Bar
          dataKey={valueKey}
          fill={`var(--color-${valueKey})`}
          radius={2}
          barSize={16}
          isAnimationActive={false}
        >
          <LabelList
            dataKey={valueKey}
            position="right"
            className="fill-foreground tabular-nums"
            fontSize={12}
            formatter={(v: unknown) => fmt(Number(v))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

/** Grouped bars comparing two money series per period. */
export function PairedBarChart({
  data,
  labelKey,
  series,
}: {
  data: Row[];
  labelKey: string;
  /** [light, dark] series. */
  series: [{ key: string; label: string }, { key: string; label: string }];
}) {
  const config = {
    [series[0].key]: { label: series[0].label, color: "var(--chart-3)" },
    [series[1].key]: { label: series[1].label, color: "var(--chart-1)" },
  } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={labelKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={short}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name) =>
                `${config[name as string]?.label ?? name}: ${short(Number(value))}`
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            fill={`var(--color-${s.key})`}
            radius={2}
            maxBarSize={28}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
