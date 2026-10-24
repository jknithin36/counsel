"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { billingPage as copy } from "@/lib/content/dashboard-office";
import { formatMoney } from "@/lib/format";

const chartConfig = {
  paid: { label: copy.chart.paid, color: "#111111" },
  invoiced: { label: copy.chart.invoiced, color: "#BDBDBD" },
} satisfies ChartConfig;

/** Payments received (bars) against invoiced totals (line), by month. */
export function CollectionsChart({
  data: chart,
}: {
  data: { month: string; paid: number; invoiced: number }[];
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[220px] w-full"
    >
      <ComposedChart data={chart} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v: number) =>
            v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`
          }
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name) =>
                `${chartConfig[name as "paid"]?.label ?? name}: ${formatMoney(Number(value))}`
              }
            />
          }
        />
        <Bar
          dataKey="paid"
          fill="var(--color-paid)"
          radius={2}
          maxBarSize={36}
          isAnimationActive={false}
        />
        <Line
          dataKey="invoiced"
          type="monotone"
          stroke="var(--color-invoiced)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-invoiced)" }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
