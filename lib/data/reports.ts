import {
  addDays,
  differenceInCalendarDays,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { leadStatuses } from "@/lib/config/lead-status";
import {
  type PracticeAreaSlug,
  practiceAreas,
} from "@/lib/content/practice-areas";
import { sourceLabels } from "./labels";
import { attorneyUsers } from "./seed/users";
import {
  invoiceBalance,
  invoiceTotal,
  OPEN_STATUSES,
  outstandingFor,
} from "./selectors";
import { matterStages } from "./stages";
import type {
  Consultation,
  DemoData,
  Invoice,
  LeadSource,
  Matter,
} from "./types";

/*
 * Report figures, computed from the same collections and selectors as the
 * rest of the dashboard so totals agree (e.g. Outstanding = Billing page).
 */

export type ReportRange = "30d" | "90d" | "12m" | "ytd";
export type ReportFilters = {
  range: ReportRange;
  /** Attorney user id, or "all". */
  attorney: string;
  /** Practice area slug, or "all". */
  area: string;
};

type Data = Pick<
  DemoData,
  "leads" | "consultations" | "matters" | "invoices" | "payments"
>;

export function rangeStart(range: ReportRange, now: Date) {
  switch (range) {
    case "30d":
      return startOfDay(subDays(now, 29));
    case "90d":
      return startOfDay(subDays(now, 89));
    case "12m":
      return startOfMonth(subMonths(now, 11));
    case "ytd":
      return startOfYear(now);
  }
}

/** Chart buckets: weeks for 30 days, months otherwise. */
export function rangeBuckets(range: ReportRange, now: Date) {
  const start = rangeStart(range, now);
  if (range === "30d")
    return eachWeekOfInterval({ start, end: now }, { weekStartsOn: 1 }).map(
      (week) => ({
        label: format(week < start ? start : week, "MMM d"),
        start: week < start ? start : week,
        end: endOfWeek(week, { weekStartsOn: 1 }),
      }),
    );
  return eachMonthOfInterval({ start, end: now }).map((month) => ({
    label: format(month, range === "90d" ? "MMM" : "MMM yy"),
    start: month,
    end: endOfMonth(month),
  }));
}

const within = (iso: string, start: Date, end: Date) => {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t <= end.getTime();
};

const rate = (part: number, whole: number) =>
  whole ? Math.round((part / whole) * 100) : 0;

/** Applies the attorney and area filters to matters. */
function filterMatters(matters: Matter[], f: ReportFilters) {
  return matters.filter(
    (m) =>
      (f.area === "all" || m.practiceArea === f.area) &&
      (f.attorney === "all" ||
        m.leadAttorneyId === f.attorney ||
        m.team.includes(f.attorney)),
  );
}

/* ---------------------------------------------------------------- */
/* Intake                                                            */
/* ---------------------------------------------------------------- */

export function intakeReport(data: Data, f: ReportFilters, now: Date) {
  const start = rangeStart(f.range, now);
  const leads = data.leads.filter(
    (l) =>
      within(l.createdAt, start, now) &&
      (f.area === "all" || l.practiceArea === f.area) &&
      (f.attorney === "all" || l.assignedAttorney === f.attorney),
  );
  const ids = new Set(leads.map((l) => l.id));
  const booked = (c: Consultation) =>
    ids.has(c.leadId) && c.status !== "cancelled";
  const consultations = data.consultations.filter(booked);
  const consulted = new Set(consultations.map((c) => c.leadId));

  const order = leadStatuses.map((s) => s.value);
  const reached = (status: string, step: number) =>
    status !== "not_a_fit" && order.indexOf(status as never) >= step;

  const funnel = [
    { stage: "Leads", count: leads.length },
    {
      stage: "Contacted",
      count: leads.filter((l) => l.status !== "new").length,
    },
    {
      stage: "Consultation",
      count: leads.filter((l) => consulted.has(l.id) || reached(l.status, 2))
        .length,
    },
    {
      stage: "Retained",
      count: leads.filter((l) => l.status === "retained").length,
    },
  ].map((row) => ({ ...row, rate: rate(row.count, leads.length) }));

  const sources = (Object.keys(sourceLabels) as LeadSource[])
    .map((source) => ({
      source: sourceLabels[source],
      leads: leads.filter((l) => l.source === source).length,
    }))
    .sort((a, b) => b.leads - a.leads);

  const areas = [
    ...practiceAreas.map((a) => ({ key: a.slug as string, label: a.title })),
    { key: "other", label: "Not sure / general" },
  ]
    .map(({ key, label }) => {
      const inArea = leads.filter((l) =>
        key === "other"
          ? !practiceAreas.some((a) => a.slug === l.practiceArea)
          : l.practiceArea === key,
      );
      const retained = inArea.filter((l) => l.status === "retained").length;
      return {
        area: label,
        leads: inArea.length,
        consultations: inArea.filter((l) => consulted.has(l.id)).length,
        retained,
        conversion: rate(retained, inArea.length),
      };
    })
    .filter((row) => row.leads > 0 || f.area === "all");

  const retained = funnel[3].count;
  return {
    kpis: {
      leads: leads.length,
      consultations: consultations.length,
      retained,
      conversion: rate(retained, leads.length),
      notAFit: leads.filter((l) => l.status === "not_a_fit").length,
    },
    sources,
    funnel,
    areas,
  };
}

/* ---------------------------------------------------------------- */
/* Matters                                                           */
/* ---------------------------------------------------------------- */

export function mattersReport(data: Data, f: ReportFilters, now: Date) {
  const start = rangeStart(f.range, now);
  const matters = filterMatters(data.matters, f);
  const active = matters.filter((m) => m.status !== "closed");

  // Stage labels in pipeline order; areas share labels like "Intake".
  const stageOrder: string[] = [];
  const areaList = (
    f.area === "all" ? Object.keys(matterStages) : [f.area]
  ) as PracticeAreaSlug[];
  for (const area of areaList)
    for (const stage of matterStages[area] ?? [])
      if (!stageOrder.includes(stage.label)) stageOrder.push(stage.label);
  const labelFor = (m: Matter) =>
    matterStages[m.practiceArea]?.find((s) => s.key === m.stage)?.label ??
    m.stage;
  const stages = stageOrder
    .map((stage) => ({
      stage,
      matters: active.filter((m) => labelFor(m) === stage).length,
    }))
    .filter((row) => row.matters > 0 || f.area !== "all");

  const in30 = addDays(now, 30);
  const people =
    f.attorney === "all"
      ? attorneyUsers
      : attorneyUsers.filter((u) => u.id === f.attorney);
  const workload = people.map((u) => {
    const mine = matters.filter((m) => m.leadAttorneyId === u.id);
    const open = mine.filter((m) => m.status !== "closed");
    return {
      id: u.id,
      attorney: u.name,
      open: open.filter((m) => m.status === "open").length,
      pending: open.filter((m) => m.status === "pending").length,
      tasks: matters
        .flatMap((m) => m.tasks)
        .filter((t) => !t.done && t.assigneeId === u.id).length,
      deadlines: open.filter(
        (m) => m.nextDeadline && within(m.nextDeadline.date, now, in30),
      ).length,
      consultations: data.consultations.filter(
        (c) =>
          c.attorneyId === u.id &&
          c.status !== "cancelled" &&
          within(c.start, start, now),
      ).length,
    };
  });

  const ages = active.map((m) =>
    differenceInCalendarDays(now, new Date(m.openedAt)),
  );
  return {
    cards: {
      open: matters.filter((m) => m.status === "open").length,
      pending: matters.filter((m) => m.status === "pending").length,
      opened: matters.filter((m) => within(m.openedAt, start, now)).length,
      closed: matters.filter((m) => m.status === "closed").length,
      avgAge: ages.length
        ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
        : 0,
    },
    stages,
    workload,
  };
}

/* ---------------------------------------------------------------- */
/* Financial                                                         */
/* ---------------------------------------------------------------- */

export const agingBuckets = [
  { key: "current", label: "Not yet due", min: -Infinity, max: 0 },
  { key: "1-30", label: "1–30 days", min: 1, max: 30 },
  { key: "31-60", label: "31–60 days", min: 31, max: 60 },
  { key: "61-90", label: "61–90 days", min: 61, max: 90 },
  { key: "90+", label: "Over 90 days", min: 91, max: Infinity },
] as const;

export function financialReport(data: Data, f: ReportFilters, now: Date) {
  const start = rangeStart(f.range, now);
  const matterIds = new Set(filterMatters(data.matters, f).map((m) => m.id));
  const matterOf = new Map(data.matters.map((m) => [m.id, m]));
  const invoices = data.invoices.filter((i) => matterIds.has(i.matterId));
  const invoiceIds = new Set(invoices.map((i) => i.id));
  const invoiceOf = new Map(invoices.map((i) => [i.id, i]));
  const payments = data.payments.filter((p) => invoiceIds.has(p.invoiceId));

  const billable = (i: Invoice) => i.status !== "draft" && i.status !== "void";
  const billedIn = (from: Date, to: Date) =>
    invoices
      .filter((i) => billable(i) && within(i.issuedAt, from, to))
      .reduce((s, i) => s + invoiceTotal(i), 0);
  const collectedIn = (from: Date, to: Date) =>
    payments
      .filter((p) => within(p.date, from, to))
      .reduce((s, p) => s + p.amount, 0);

  const billed = billedIn(start, now);
  const collected = collectedIn(start, now);
  const open = invoices.filter((i) => OPEN_STATUSES.includes(i.status));
  const outstanding = open.reduce(
    (s, i) => s + invoiceBalance(i, data.payments),
    0,
  );

  const trend = rangeBuckets(f.range, now).map((b) => ({
    period: b.label,
    billed: Math.round(billedIn(b.start, b.end > now ? now : b.end)),
    collected: Math.round(collectedIn(b.start, b.end > now ? now : b.end)),
  }));

  const aging = agingBuckets.map((bucket) => {
    const rows = open.filter((i) => {
      const late = differenceInCalendarDays(now, new Date(i.dueAt));
      return late >= bucket.min && late <= bucket.max;
    });
    return {
      bucket: bucket.label,
      invoices: rows.length,
      amount: rows.reduce((s, i) => s + invoiceBalance(i, data.payments), 0),
    };
  });

  const byArea = practiceAreas
    .filter((a) => f.area === "all" || a.slug === f.area)
    .map((a) => ({
      area: a.title,
      billed: Math.round(
        invoices
          .filter(
            (i) =>
              billable(i) &&
              within(i.issuedAt, start, now) &&
              matterOf.get(i.matterId)?.practiceArea === a.slug,
          )
          .reduce((s, i) => s + invoiceTotal(i), 0),
      ),
      collected: Math.round(
        payments
          .filter(
            (p) =>
              within(p.date, start, now) &&
              matterOf.get(invoiceOf.get(p.invoiceId)?.matterId ?? "")
                ?.practiceArea === a.slug,
          )
          .reduce((s, p) => s + p.amount, 0),
      ),
    }))
    .sort((a, b) => b.collected - a.collected);

  return {
    cards: {
      billed,
      collected,
      collectionRate: rate(collected, billed),
      outstanding,
      openCount: open.length,
      // Same rule as the Billing page: invoices marked overdue.
      overdue: outstandingFor(
        open.filter((i) => i.status === "overdue"),
        data.payments,
      ).amount,
    },
    trend,
    aging,
    byArea,
  };
}
