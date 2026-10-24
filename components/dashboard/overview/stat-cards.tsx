"use client";

import { endOfWeek, startOfWeek, subDays } from "date-fns";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { overview } from "@/lib/content/dashboard";
import { outstandingFor } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const s = overview.stats;

export function StatCards({ now, days }: { now: Date; days: number }) {
  const leads = useDemoStore((st) => st.leads);
  const consultations = useDemoStore((st) => st.consultations);
  const matters = useDemoStore((st) => st.matters);
  const invoices = useDemoStore((st) => st.invoices);
  const payments = useDemoStore((st) => st.payments);

  const stats = useMemo(() => {
    const start = subDays(now, days).getTime();
    const prevStart = subDays(now, days * 2).getTime();
    const created = leads.map((l) => new Date(l.createdAt).getTime());
    const current = created.filter((t) => t >= start).length;
    const previous = created.filter((t) => t >= prevStart && t < start).length;

    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).getTime();
    const thisWeek = consultations.filter((c) => {
      const t = new Date(c.start).getTime();
      return t >= weekStart && t <= weekEnd && c.status !== "cancelled";
    });
    const upcoming = thisWeek.filter(
      (c) => c.status === "scheduled" && new Date(c.start) > now,
    ).length;

    const unpaid = outstandingFor(invoices, payments);

    return {
      current,
      diff: current - previous,
      consultations: thisWeek.length,
      upcoming,
      open: matters.filter((m) => m.status === "open").length,
      pending: matters.filter((m) => m.status === "pending").length,
      outstanding: unpaid.amount,
      overdue: unpaid.overdue.length,
    };
  }, [leads, consultations, matters, invoices, payments, now, days]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label={s.newLeads}
        value={stats.current}
        detail={s.vsPrevious(stats.diff)}
        detailClassName={
          stats.diff > 0
            ? "text-[#2F6B3F]"
            : stats.diff < 0
              ? "text-[#A23B3B]"
              : undefined
        }
      />
      <Stat
        label={s.consultations}
        value={stats.consultations}
        detail={s.consultationsDetail(stats.upcoming)}
      />
      <Stat
        label={s.openMatters}
        value={stats.open}
        detail={s.openMattersDetail(stats.pending)}
      />
      <Stat
        label={s.outstanding}
        value={formatMoney(stats.outstanding)}
        detail={s.outstandingDetail(stats.overdue)}
        detailClassName={stats.overdue > 0 ? "text-[#A23B3B]" : undefined}
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  detail,
  detailClassName,
}: {
  label: string;
  value: React.ReactNode;
  detail: string;
  detailClassName?: string;
}) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 font-serif text-[32px] leading-none tabular-nums text-foreground">
          {value}
        </p>
        <p
          className={cn(
            "mt-2 text-xs text-muted-foreground tabular-nums",
            detailClassName,
          )}
        >
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}
