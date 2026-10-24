"use client";

import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { firm } from "@/lib/config/firm";
import {
  billingPage,
  invoiceDocument as copy,
} from "@/lib/content/dashboard-office";
import { markInvoicePaid, sendInvoice } from "@/lib/data/billing";
import { paymentMethodLabels } from "@/lib/data/labels";
import {
  amountPaid,
  invoiceBalance,
  invoiceSubtotal,
  invoiceTotal,
  OPEN_STATUSES,
} from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import { formatDate, formatMoney } from "@/lib/format";
import { useDemoStatus } from "../demo-data-provider";
import { PageSkeleton } from "../page-skeleton";
import { PaymentDialog } from "./billing-dialogs";
import { InvoiceStatusBadge } from "./invoices-table";

/** A printable invoice document with its payment status and history. */
export function InvoiceDetail({ id }: { id: string }) {
  const status = useDemoStatus();
  const invoice = useDemoStore((s) => s.invoices.find((i) => i.id === id));
  const client = useDemoStore((s) =>
    s.clients.find((c) => c.id === invoice?.clientId),
  );
  const matter = useDemoStore((s) =>
    s.matters.find((m) => m.id === invoice?.matterId),
  );
  const allPayments = useDemoStore((s) => s.payments);
  const [paying, setPaying] = useState(false);

  if (status !== "ready") return <PageSkeleton />;
  if (!invoice) notFound();

  const payments = allPayments
    .filter((p) => p.invoiceId === invoice.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const subtotal = invoiceSubtotal(invoice);
  const total = invoiceTotal(invoice);
  const paid = amountPaid(invoice.id, allPayments);
  const balance = invoiceBalance(invoice, allPayments);
  const open = OPEN_STATUSES.includes(invoice.status);
  const address = `${firm.address.line1}, ${firm.address.city}, ${firm.address.region} ${firm.address.postalCode}`;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8"
          nativeButton={false}
          render={<Link href="/dashboard/billing" />}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
          {copy.back}
        </Button>
        <div className="flex flex-wrap gap-2">
          {invoice.status === "draft" && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-input"
              onClick={() => {
                sendInvoice(invoice.id);
                toast.add({ title: billingPage.toasts.sent(invoice.id) });
              }}
            >
              {billingPage.actions.send}
            </Button>
          )}
          {open && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-input"
                onClick={() => setPaying(true)}
              >
                {billingPage.actions.record}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-input"
                onClick={() => {
                  markInvoicePaid(invoice.id);
                  toast.add({ title: billingPage.toasts.paid(invoice.id) });
                }}
              >
                {billingPage.actions.markPaid}
              </Button>
            </>
          )}
          <Button size="sm" className="h-9" onClick={() => window.print()}>
            {copy.print}
          </Button>
        </div>
      </div>

      <Card className="mx-auto w-full max-w-3xl print:ring-0" data-print-area>
        <CardContent className="flex flex-col gap-8 p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row">
            <div>
              <p className="font-serif text-2xl leading-tight">{firm.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {firm.legalName}
              </p>
              <p className="text-sm text-muted-foreground">{address}</p>
              <p className="text-sm text-muted-foreground tabular-nums">
                {firm.phone} · {firm.email}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                {copy.invoice}
              </p>
              <h1 className="mt-1 font-serif text-[32px] leading-none tabular-nums">
                {invoice.id}
              </h1>
              <div className="mt-2 sm:flex sm:justify-end">
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">{copy.billTo}</p>
              <p className="mt-1 font-medium">{client?.name}</p>
              <p className="text-muted-foreground">{client?.address}</p>
              <p className="text-muted-foreground">{client?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{copy.matter}</p>
              <p className="mt-1 tabular-nums">{matter?.id}</p>
              <p className="text-muted-foreground">{matter?.title}</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
              <dt className="text-muted-foreground">{copy.issued}</dt>
              <dd className="text-right tabular-nums">
                {formatDate(invoice.issuedAt)}
              </dd>
              <dt className="text-muted-foreground">{copy.due}</dt>
              <dd className="text-right tabular-nums">
                {formatDate(invoice.dueAt)}
              </dd>
            </dl>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 font-normal">{copy.description}</th>
                <th className="pb-2 text-right font-normal">{copy.quantity}</th>
                <th className="hidden pb-2 text-right font-normal sm:table-cell">
                  {copy.rate}
                </th>
                <th className="pb-2 text-right font-normal">{copy.amount}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3 pr-3">{item.description}</td>
                  <td className="py-3 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="hidden py-3 text-right tabular-nums sm:table-cell">
                    {formatMoney(item.rate, true)}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {formatMoney(item.quantity * item.rate, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
            <div className="max-w-sm text-sm">
              {invoice.notes && (
                <>
                  <p className="text-xs text-muted-foreground">{copy.notes}</p>
                  <p className="mt-1 whitespace-pre-line">{invoice.notes}</p>
                </>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                {copy.thanks}
              </p>
            </div>
            <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:w-64">
              <dt className="text-muted-foreground">{copy.subtotal}</dt>
              <dd className="text-right tabular-nums">
                {formatMoney(subtotal, true)}
              </dd>
              {(invoice.taxRate ?? 0) > 0 && (
                <>
                  <dt className="text-muted-foreground">
                    {copy.tax(invoice.taxRate ?? 0)}
                  </dt>
                  <dd className="text-right tabular-nums">
                    {formatMoney(total - subtotal, true)}
                  </dd>
                </>
              )}
              <dt className="border-t pt-1.5 font-medium">{copy.total}</dt>
              <dd className="border-t pt-1.5 text-right font-medium tabular-nums">
                {formatMoney(total, true)}
              </dd>
              <dt className="text-muted-foreground">{copy.paid}</dt>
              <dd className="text-right tabular-nums">
                {formatMoney(paid, true)}
              </dd>
              <dt className="font-medium">{copy.balance}</dt>
              <dd className="text-right font-serif text-xl tabular-nums">
                {formatMoney(balance, true)}
              </dd>
            </dl>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">{copy.payments}</p>
            {payments.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {copy.noPayments}
              </p>
            ) : (
              <ul className="mt-2 flex flex-col divide-y text-sm">
                {payments.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <span className="tabular-nums">
                      {formatDate(p.date)} · {paymentMethodLabels[p.method]}
                      {p.reference && (
                        <span className="text-muted-foreground">
                          {" "}
                          · {p.reference}
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums">
                      {formatMoney(p.amount, true)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <PaymentDialog
        open={paying}
        onOpenChange={setPaying}
        invoiceId={invoice.id}
      />
    </div>
  );
}
