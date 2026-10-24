"use client";

import { Add01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  format,
  isSameMonth,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { billingPage as copy } from "@/lib/content/dashboard-office";
import { invoiceStatusLabels, paymentMethodLabels } from "@/lib/data/labels";
import { attorneyUsers } from "@/lib/data/seed/users";
import {
  invoiceTotal,
  OPEN_STATUSES,
  outstandingFor,
} from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { InvoiceStatus } from "@/lib/data/types";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDemoStatus } from "../demo-data-provider";
import { FacetedFilter } from "../faceted-filter";
import { PageHeader } from "../page-header";
import { PageSkeleton } from "../page-skeleton";
import { SectionCard } from "../section-card";
import { InvoiceDialog, PaymentDialog, TrustDialog } from "./billing-dialogs";
import { InvoicesTable } from "./invoices-table";

const CollectionsChart = dynamic(
  () => import("./collections-chart").then((m) => m.CollectionsChart),
  { ssr: false, loading: () => <Skeleton className="h-[220px] w-full" /> },
);

const statusOptions = (Object.keys(invoiceStatusLabels) as InvoiceStatus[]).map(
  (value) => ({
    value,
    label: invoiceStatusLabels[value],
  }),
);
const attorneyOptions = attorneyUsers.map((u) => ({
  value: u.id,
  label: u.name,
}));

export function BillingPage() {
  const status = useDemoStatus();
  const invoices = useDemoStore((s) => s.invoices);
  const payments = useDemoStore((s) => s.payments);
  const clients = useDemoStore((s) => s.clients);
  const matters = useDemoStore((s) => s.matters);
  const trust = useDemoStore((s) => s.trustTransactions);
  const [tab, setTab] = useState("invoices");
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [attorneys, setAttorneys] = useState<string[]>([]);
  const [range, setRange] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deposit, setDeposit] = useState<{ open: boolean; clientId?: string }>({
    open: false,
  });
  const [transfer, setTransfer] = useState<string | undefined>();
  const [now] = useState(() => new Date());

  const chart = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const month = startOfMonth(subMonths(now, 5 - i));
        return {
          month: format(month, "MMM"),
          paid: payments
            .filter((p) => isSameMonth(new Date(p.date), month))
            .reduce((s, p) => s + p.amount, 0),
          invoiced: invoices
            .filter(
              (inv) =>
                inv.status !== "draft" &&
                inv.status !== "void" &&
                isSameMonth(new Date(inv.issuedAt), month),
            )
            .reduce((s, inv) => s + invoiceTotal(inv), 0),
        };
      }),
    [payments, invoices, now],
  );

  if (status !== "ready") return <PageSkeleton />;

  const owed = outstandingFor(invoices, payments);
  const overdueAmount = outstandingFor(owed.overdue, payments).amount;
  const paidThisMonth = payments.filter((p) =>
    isSameMonth(new Date(p.date), now),
  );
  const trustTotal = clients.reduce((s, c) => s + c.trustBalance, 0);
  const trustClients = clients.filter((c) => c.trustBalance > 0);

  const summary = [
    {
      label: copy.summary.outstanding,
      value: formatMoney(owed.amount),
      detail: copy.summary.invoices(owed.count),
    },
    {
      label: copy.summary.overdue,
      value: formatMoney(overdueAmount),
      detail: copy.summary.invoices(owed.overdue.length),
      danger: owed.overdue.length > 0,
    },
    {
      label: copy.summary.paidMonth,
      value: formatMoney(paidThisMonth.reduce((s, p) => s + p.amount, 0)),
      detail: copy.summary.payments(paidThisMonth.length),
    },
    {
      label: copy.summary.trust,
      value: formatMoney(trustTotal),
      detail: copy.summary.clients(trustClients.length),
    },
  ];

  const q = query.trim().toLowerCase();
  const since =
    range === "all" ? null : subDays(now, Number(range)).toISOString();
  const leadOf = (matterId: string) =>
    matters.find((m) => m.id === matterId)?.leadAttorneyId ?? "";
  const filtered = invoices
    .filter((inv) => statuses.length === 0 || statuses.includes(inv.status))
    .filter(
      (inv) =>
        attorneys.length === 0 || attorneys.includes(leadOf(inv.matterId)),
    )
    .filter((inv) => !since || inv.issuedAt >= since)
    .filter((inv) => {
      if (!q) return true;
      const client = clients.find((c) => c.id === inv.clientId)?.name ?? "";
      const matter = matters.find((m) => m.id === inv.matterId)?.title ?? "";
      return `${inv.id} ${client} ${matter}`.toLowerCase().includes(q);
    })
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  const statusCounts = new Map<string, number>();
  for (const inv of invoices)
    statusCounts.set(inv.status, (statusCounts.get(inv.status) ?? 0) + 1);
  const attorneyCounts = new Map<string, number>();
  for (const inv of invoices)
    attorneyCounts.set(
      leadOf(inv.matterId),
      (attorneyCounts.get(leadOf(inv.matterId)) ?? 0) + 1,
    );

  const sortedPayments = [...payments].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  function startTransfer(clientId: string) {
    const open = invoices
      .filter(
        (i) => i.clientId === clientId && OPEN_STATUSES.includes(i.status),
      )
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];
    if (!open) {
      toast.add({ title: copy.trustNote });
      return;
    }
    setTransfer(open.id);
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title={copy.title}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-input"
              onClick={() => setPaymentOpen(true)}
            >
              {copy.recordPayment}
            </Button>
            <Button
              size="sm"
              className="h-9"
              onClick={() => setCreateOpen(true)}
            >
              <HugeiconsIcon icon={Add01Icon} />
              {copy.createInvoice}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label}>
            <CardContent>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p
                className={cn(
                  "mt-2 font-serif text-[32px] leading-none tabular-nums",
                  s.danger && "text-[#A23B3B]",
                )}
              >
                {s.value}
              </p>
              <p className="mt-2 text-xs text-muted-foreground tabular-nums">
                {s.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionCard
        title={copy.chart.title}
        description={copy.chart.description}
      >
        <CollectionsChart data={chart} />
      </SectionCard>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as string)}
        className="gap-4"
      >
        <TabsList>
          <TabsTrigger value="invoices" className="px-3">
            {copy.tabs.invoices}
          </TabsTrigger>
          <TabsTrigger value="payments" className="px-3">
            {copy.tabs.payments}
          </TabsTrigger>
          <TabsTrigger value="trust" className="px-3">
            {copy.tabs.trust}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-72">
              <HugeiconsIcon
                icon={Search01Icon}
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                data-table-search
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.search}
                aria-label={copy.search}
                className="h-8 pl-8"
              />
            </div>
            <FacetedFilter
              title={copy.filters.status}
              options={statusOptions}
              selected={statuses}
              counts={statusCounts}
              onChange={setStatuses}
            />
            <FacetedFilter
              title={copy.filters.attorney}
              options={attorneyOptions}
              selected={attorneys}
              counts={attorneyCounts}
              onChange={setAttorneys}
            />
            <Select
              items={copy.ranges}
              value={range}
              onValueChange={(v) => setRange(v as string)}
            >
              <SelectTrigger
                aria-label={copy.filters.range}
                size="sm"
                className="h-8 w-40"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {copy.ranges.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <InvoicesTable invoices={filtered} />
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="overflow-hidden rounded-lg border">
            {sortedPayments.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                {copy.noPayments}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">{copy.columns.date}</TableHead>
                    <TableHead>{copy.columns.client}</TableHead>
                    <TableHead>{copy.columns.invoice}</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      {copy.columns.method}
                    </TableHead>
                    <TableHead className="text-right">
                      {copy.columns.amount}
                    </TableHead>
                    <TableHead className="hidden pr-4 md:table-cell">
                      {copy.columns.reference}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-4 whitespace-nowrap tabular-nums">
                        {formatDate(p.date)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {clients.find((c) => c.id === p.clientId)?.name}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/billing/invoices/${p.invoiceId}`}
                          className="whitespace-nowrap tabular-nums underline-offset-4 hover:underline"
                        >
                          {p.invoiceId}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {paymentMethodLabels[p.method]}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular-nums">
                        {formatMoney(p.amount, true)}
                      </TableCell>
                      <TableCell className="hidden pr-4 text-muted-foreground md:table-cell">
                        {p.reference}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trust" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{copy.trustNote}</p>
            <Button
              size="sm"
              className="h-8"
              onClick={() => setDeposit({ open: true })}
            >
              {copy.actions.deposit}
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            {trustClients.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                {copy.noTrust}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">
                      {copy.columns.client}
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      {copy.columns.matter}
                    </TableHead>
                    <TableHead className="text-right">
                      {copy.columns.balance}
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      {copy.columns.lastActivity}
                    </TableHead>
                    <TableHead className="pr-4 text-right">
                      <span className="sr-only">{copy.columns.actions}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trustClients.map((client) => {
                    const ledger = trust
                      .filter((t) => t.clientId === client.id)
                      .sort((a, b) => b.date.localeCompare(a.date));
                    const matter = matters.find(
                      (m) => m.id === ledger[0]?.matterId,
                    );
                    return (
                      <TableRow key={client.id}>
                        <TableCell className="pl-4">
                          <Link
                            href={`/dashboard/clients/${client.id}?tab=billing`}
                            className="font-medium underline-offset-4 hover:underline"
                          >
                            {client.name}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden max-w-60 truncate text-muted-foreground md:table-cell">
                          {matter?.title}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap tabular-nums">
                          {formatMoney(client.trustBalance, true)}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {ledger[0] ? (
                            <span className="tabular-nums">
                              {formatDate(ledger[0].date)} ·{" "}
                              {ledger[0].type === "deposit"
                                ? "Deposit"
                                : ledger[0].note}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="pr-4">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              aria-label={`${copy.actions.deposit}: ${client.name}`}
                              onClick={() =>
                                setDeposit({ open: true, clientId: client.id })
                              }
                            >
                              {copy.actions.deposit}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              aria-label={`${copy.actions.transfer}: ${client.name}`}
                              onClick={() => startTransfer(client.id)}
                            >
                              {copy.actions.transfer}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <InvoiceDialog open={createOpen} onOpenChange={setCreateOpen} />
      <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} />
      <PaymentDialog
        open={Boolean(transfer)}
        onOpenChange={(o) => !o && setTransfer(undefined)}
        invoiceId={transfer}
        method="trust"
      />
      <TrustDialog
        open={deposit.open}
        onOpenChange={(open) => setDeposit((d) => ({ ...d, open }))}
        clientId={deposit.clientId}
      />
    </div>
  );
}
