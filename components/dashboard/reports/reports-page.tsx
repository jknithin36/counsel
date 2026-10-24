"use client";

import { ArrowDown01Icon, Download04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { can, restrictedMessage } from "@/lib/auth/permissions";
import { reportsPage as copy } from "@/lib/content/dashboard-admin";
import { practiceAreas } from "@/lib/content/practice-areas";
import { downloadCsv } from "@/lib/csv";
import {
  financialReport,
  intakeReport,
  mattersReport,
  type ReportFilters,
  type ReportRange,
} from "@/lib/data/reports";
import { attorneyUsers } from "@/lib/data/seed/users";
import { useDemoStore } from "@/lib/data/store";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ChoiceSelect } from "../content/shared";
import { useDemoStatus } from "../demo-data-provider";
import { Stat } from "../overview/stat-cards";
import { PageHeader } from "../page-header";
import { PageSkeleton } from "../page-skeleton";
import { SectionCard } from "../section-card";

const chartLoading = () => <Skeleton className="h-[220px] w-full" />;
const HBarChart = dynamic(
  () => import("./report-charts").then((m) => m.HBarChart),
  { ssr: false, loading: chartLoading },
) as typeof import("./report-charts").HBarChart;
const PairedBarChart = dynamic(
  () => import("./report-charts").then((m) => m.PairedBarChart),
  { ssr: false, loading: chartLoading },
) as typeof import("./report-charts").PairedBarChart;

type Tab = (typeof copy.tabs)[number]["value"];
type Column<T> = {
  label: string;
  value: (row: T) => string | number;
  /** Right-aligned, tabular figures. */
  numeric?: boolean;
};

const money = (n: number) => formatMoney(Math.round(n));

/** A plain table for report rows, with an optional totals row. */
function DataTable<T>({
  rows,
  columns,
  total,
}: {
  rows: T[];
  columns: Column<T>[];
  total?: (string | number)[];
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead
                key={c.label}
                className={cn(c.numeric && "text-right")}
              >
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-16 text-center text-muted-foreground"
              >
                {copy.noData}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={String(columns[0].value(row))}>
                {columns.map((c) => (
                  <TableCell
                    key={c.label}
                    className={cn(c.numeric && "text-right tabular-nums")}
                  >
                    {c.value(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
        {total && rows.length > 0 && (
          <TableFooter>
            <TableRow>
              {total.map((cell, i) => (
                <TableCell
                  key={columns[i].label}
                  className={cn(
                    "font-medium",
                    columns[i].numeric && "text-right tabular-nums",
                  )}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}

/** A chart with its numbers available as a table below. */
function ChartCard<T>({
  title,
  description,
  chart,
  rows,
  columns,
}: {
  title: string;
  description?: string;
  chart: React.ReactNode;
  rows: T[];
  columns: Column<T>[];
}) {
  const [open, setOpen] = useState(false);
  // Figures may be formatted ("$1,200", "40%"); any non-zero one counts.
  const empty = rows.every((row) =>
    columns
      .slice(1)
      .every((c) => !Number(String(c.value(row)).replace(/[^\d.-]/g, ""))),
  );
  return (
    <SectionCard title={title} description={description}>
      {empty ? (
        <p className="flex h-[120px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          {copy.noData}
        </p>
      ) : (
        <Collapsible open={open} onOpenChange={setOpen}>
          {chart}
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-8 px-2 text-muted-foreground"
              />
            }
          >
            {open ? copy.hideData : copy.viewData}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              data-icon="inline-end"
              className={cn(open && "rotate-180")}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <DataTable rows={rows} columns={columns} />
          </CollapsibleContent>
        </Collapsible>
      )}
    </SectionCard>
  );
}

export function ReportsPage() {
  const status = useDemoStatus();
  const role = useDemoStore((s) => s.session?.role);
  const leads = useDemoStore((s) => s.leads);
  const consultations = useDemoStore((s) => s.consultations);
  const matters = useDemoStore((s) => s.matters);
  const invoices = useDemoStore((s) => s.invoices);
  const payments = useDemoStore((s) => s.payments);
  const [now] = useState(() => new Date());
  const [tab, setTab] = useState<Tab>("intake");
  const [filters, setFilters] = useState<ReportFilters>({
    range: "90d",
    attorney: "all",
    area: "all",
  });

  const data = useMemo(
    () => ({ leads, consultations, matters, invoices, payments }),
    [leads, consultations, matters, invoices, payments],
  );
  const intake = useMemo(
    () => intakeReport(data, filters, now),
    [data, filters, now],
  );
  const caseload = useMemo(
    () => mattersReport(data, filters, now),
    [data, filters, now],
  );
  const finance = useMemo(
    () => financialReport(data, filters, now),
    [data, filters, now],
  );

  if (status !== "ready") return <PageSkeleton />;

  const i = copy.intake;
  const m = copy.matters;
  const f = copy.financial;

  const sourceCols: Column<(typeof intake.sources)[number]>[] = [
    { label: i.columns.source, value: (r) => r.source },
    { label: i.columns.leads, value: (r) => r.leads, numeric: true },
  ];
  const funnelCols: Column<(typeof intake.funnel)[number]>[] = [
    { label: i.columns.stage, value: (r) => r.stage },
    { label: i.columns.count, value: (r) => r.count, numeric: true },
    { label: i.columns.rate, value: (r) => `${r.rate}%`, numeric: true },
  ];
  const areaCols: Column<(typeof intake.areas)[number]>[] = [
    { label: i.columns.area, value: (r) => r.area },
    { label: i.columns.leads, value: (r) => r.leads, numeric: true },
    {
      label: i.columns.consultations,
      value: (r) => r.consultations,
      numeric: true,
    },
    { label: i.columns.retained, value: (r) => r.retained, numeric: true },
    {
      label: i.columns.conversion,
      value: (r) => `${r.conversion}%`,
      numeric: true,
    },
  ];
  const stageCols: Column<(typeof caseload.stages)[number]>[] = [
    { label: m.columns.stage, value: (r) => r.stage },
    { label: m.columns.matters, value: (r) => r.matters, numeric: true },
  ];
  const workloadCols: Column<(typeof caseload.workload)[number]>[] = [
    { label: m.columns.attorney, value: (r) => r.attorney },
    { label: m.columns.open, value: (r) => r.open, numeric: true },
    { label: m.columns.pending, value: (r) => r.pending, numeric: true },
    { label: m.columns.tasks, value: (r) => r.tasks, numeric: true },
    { label: m.columns.deadlines, value: (r) => r.deadlines, numeric: true },
    {
      label: m.columns.consultations,
      value: (r) => r.consultations,
      numeric: true,
    },
  ];
  const trendCols: Column<(typeof finance.trend)[number]>[] = [
    { label: f.columns.period, value: (r) => r.period },
    { label: f.columns.billed, value: (r) => money(r.billed), numeric: true },
    {
      label: f.columns.collected,
      value: (r) => money(r.collected),
      numeric: true,
    },
  ];
  const agingCols: Column<(typeof finance.aging)[number]>[] = [
    { label: f.columns.bucket, value: (r) => r.bucket },
    { label: f.columns.invoices, value: (r) => r.invoices, numeric: true },
    { label: f.columns.amount, value: (r) => money(r.amount), numeric: true },
  ];
  const byAreaCols: Column<(typeof finance.byArea)[number]>[] = [
    { label: f.columns.area, value: (r) => r.area },
    { label: f.columns.billed, value: (r) => money(r.billed), numeric: true },
    {
      label: f.columns.collected,
      value: (r) => money(r.collected),
      numeric: true,
    },
  ];

  /** Every table on the current tab, one after another. */
  function exportCsv() {
    const section = <T,>(title: string, rows: T[], cols: Column<T>[]) => [
      [title],
      cols.map((c) => c.label),
      ...rows.map((r) => cols.map((c) => c.value(r))),
      [],
    ];
    const range = copy.ranges.find((r) => r.value === filters.range)?.label;
    const header = [
      [`${copy.title} — ${copy.tabs.find((t) => t.value === tab)?.label}`],
      [copy.filters.range, range ?? ""],
      [
        copy.filters.attorney,
        attorneyUsers.find((u) => u.id === filters.attorney)?.name ??
          copy.filters.allAttorneys,
      ],
      [
        copy.filters.area,
        practiceAreas.find((a) => a.slug === filters.area)?.title ??
          copy.filters.allAreas,
      ],
      [],
    ];
    const body =
      tab === "intake"
        ? [
            ...section(i.sources, intake.sources, sourceCols),
            ...section(i.funnel, intake.funnel, funnelCols),
            ...section(i.byArea, intake.areas, areaCols),
          ]
        : tab === "matters"
          ? [
              ...section(m.stages, caseload.stages, stageCols),
              ...section(m.workload, caseload.workload, workloadCols),
            ]
          : [
              ...section(f.trend, finance.trend, trendCols),
              ...section(f.aging, finance.aging, agingCols),
              ...section(f.byArea, finance.byArea, byAreaCols),
            ];
    downloadCsv(
      `report-${tab}-${filters.range}-${format(now, "yyyy-MM-dd")}.csv`,
      [...header, ...body],
    );
    toast.add({ title: copy.exported });
  }

  const allowed = can(role, "exportReports");
  const exportButton = (
    <Button
      variant="outline"
      size="sm"
      className="h-8"
      disabled={!allowed}
      onClick={exportCsv}
    >
      <HugeiconsIcon
        icon={Download04Icon}
        strokeWidth={2}
        data-icon="inline-start"
      />
      {copy.export}
    </Button>
  );

  const set = (patch: Partial<ReportFilters>) =>
    setFilters((x) => ({ ...x, ...patch }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={copy.title}
        description={copy.subtitle}
        actions={
          allowed ? (
            exportButton
          ) : (
            <Tooltip>
              <TooltipTrigger render={<span className="inline-flex" />}>
                {exportButton}
              </TooltipTrigger>
              <TooltipContent>{restrictedMessage}</TooltipContent>
            </Tooltip>
          )
        }
      />

      <div className="grid gap-2 sm:grid-cols-3 lg:flex">
        <ChoiceSelect
          aria-label={copy.filters.range}
          className="h-8 w-full lg:w-44"
          value={filters.range}
          onChange={(range) => set({ range: range as ReportRange })}
          options={copy.ranges.map((r) => ({ ...r }))}
        />
        <ChoiceSelect
          aria-label={copy.filters.attorney}
          className="h-8 w-full lg:w-48"
          value={filters.attorney}
          onChange={(attorney) => set({ attorney })}
          options={[
            { value: "all", label: copy.filters.allAttorneys },
            ...attorneyUsers.map((u) => ({ value: u.id, label: u.name })),
          ]}
        />
        <ChoiceSelect
          aria-label={copy.filters.area}
          className="h-8 w-full lg:w-52"
          value={filters.area}
          onChange={(area) => set({ area })}
          options={[
            { value: "all", label: copy.filters.allAreas },
            ...practiceAreas.map((a) => ({ value: a.slug, label: a.title })),
          ]}
        />
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as Tab)}
        className="gap-4"
      >
        <TabsList>
          {copy.tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="px-3">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="intake" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <Stat
              label={i.leads}
              value={intake.kpis.leads}
              detail={i.leadsDetail(intake.kpis.notAFit)}
            />
            <Stat
              label={i.consultations}
              value={intake.kpis.consultations}
              detail={i.consultationsDetail}
            />
            <Stat
              label={i.retained}
              value={intake.kpis.retained}
              detail={i.retainedDetail}
            />
            <Stat
              label={i.conversion}
              value={`${intake.kpis.conversion}%`}
              detail={i.conversionDetail}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title={i.sources}
              description={i.sourcesDescription}
              rows={intake.sources}
              columns={sourceCols}
              chart={
                <HBarChart
                  data={intake.sources}
                  labelKey="source"
                  valueKey="leads"
                  label={i.columns.leads}
                />
              }
            />
            <ChartCard
              title={i.funnel}
              description={i.funnelDescription}
              rows={intake.funnel}
              columns={funnelCols}
              chart={
                <HBarChart
                  data={intake.funnel}
                  labelKey="stage"
                  valueKey="count"
                  label={i.columns.count}
                />
              }
            />
          </div>
          <SectionCard title={i.byArea}>
            <DataTable
              rows={intake.areas}
              columns={areaCols}
              total={[
                copy.financial.total,
                intake.kpis.leads,
                intake.areas.reduce((s, r) => s + r.consultations, 0),
                intake.kpis.retained,
                `${intake.kpis.conversion}%`,
              ]}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="matters" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <Stat
              label={m.open}
              value={caseload.cards.open}
              detail={m.openDetail(caseload.cards.pending)}
            />
            <Stat
              label={m.opened}
              value={caseload.cards.opened}
              detail={m.openedDetail}
            />
            <Stat
              label={m.closed}
              value={caseload.cards.closed}
              detail={m.closedDetail}
            />
            <Stat
              label={m.avgAge}
              value={m.days(caseload.cards.avgAge)}
              detail={m.avgAgeDetail}
            />
          </div>
          <ChartCard
            title={m.stages}
            description={m.stagesDescription}
            rows={caseload.stages}
            columns={stageCols}
            chart={
              <HBarChart
                data={caseload.stages}
                labelKey="stage"
                valueKey="matters"
                label={m.columns.matters}
              />
            }
          />
          <SectionCard title={m.workload} description={m.workloadDescription}>
            <DataTable rows={caseload.workload} columns={workloadCols} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="financial" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <Stat
              label={f.billed}
              value={money(finance.cards.billed)}
              detail={f.billedDetail}
            />
            <Stat
              label={f.collected}
              value={money(finance.cards.collected)}
              detail={f.collectedDetail(finance.cards.collectionRate)}
            />
            <Stat
              label={f.outstanding}
              value={money(finance.cards.outstanding)}
              detail={f.outstandingDetail(finance.cards.openCount)}
            />
            <Stat
              label={f.overdue}
              value={money(finance.cards.overdue)}
              detail={f.overdueDetail}
              detailClassName={
                finance.cards.overdue > 0 ? "text-[#A23B3B]" : undefined
              }
            />
          </div>
          <ChartCard
            title={f.trend}
            description={f.trendDescription}
            rows={finance.trend}
            columns={trendCols}
            chart={
              <PairedBarChart
                data={finance.trend}
                labelKey="period"
                series={[
                  { key: "billed", label: f.columns.billed },
                  { key: "collected", label: f.columns.collected },
                ]}
              />
            }
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title={f.aging} description={f.agingDescription}>
              <DataTable
                rows={finance.aging}
                columns={agingCols}
                total={[
                  f.total,
                  finance.cards.openCount,
                  money(finance.cards.outstanding),
                ]}
              />
            </SectionCard>
            <ChartCard
              title={f.byArea}
              description={f.byAreaDescription}
              rows={finance.byArea}
              columns={byAreaCols}
              chart={
                <HBarChart
                  data={finance.byArea}
                  labelKey="area"
                  valueKey="collected"
                  label={f.columns.collected}
                  money
                />
              }
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
