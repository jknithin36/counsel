"use client";

import { CheckmarkCircle02Icon, PrinterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { billingPage as copy } from "@/lib/content/portal";
import { recordPayment } from "@/lib/data/billing";
import { paymentMethodLabels } from "@/lib/data/labels";
import {
  amountPaid,
  invoiceBalance,
  invoiceSubtotal,
  invoiceTotal,
} from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { Invoice, InvoiceStatus } from "@/lib/data/types";
import { formatDate, formatMoney } from "@/lib/format";
import { useFirm } from "@/lib/site-content";
import { Stat } from "../dashboard/overview/stat-cards";
import { SectionCard } from "../dashboard/section-card";
import { StatusBadge, type Tone } from "../dashboard/status-badge";
import { PortalPage } from "./shared";
import { usePortal, usePortalTasks } from "./use-portal";

const tone: Record<InvoiceStatus, Tone> = {
  draft: "neutral",
  sent: "amber",
  partially_paid: "amber",
  paid: "green",
  overdue: "red",
  void: "neutral",
};
const money = (n: number) => formatMoney(n, true);

function InvoiceSheet({
  invoice,
  onOpenChange,
  onPay,
}: {
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
  onPay: (invoice: Invoice) => void;
}) {
  const firm = useFirm();
  const { client } = usePortal();
  const payments = useDemoStore((s) => s.payments);
  const s = copy.sheet;
  return (
    <Sheet open={Boolean(invoice)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        {invoice && (
          <>
            <SheetHeader className="border-b p-5 pr-12">
              <SheetTitle className="font-serif text-[26px] leading-tight font-normal tabular-nums">
                {invoice.id}
              </SheetTitle>
              <SheetDescription className="tabular-nums">
                {s.issued(formatDate(invoice.issuedAt))} ·{" "}
                {s.due(formatDate(invoice.dueAt))}
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {firm.legalName}
                  </p>
                  <p className="mt-1">{firm.line1}</p>
                  <p>
                    {firm.city}, {firm.region} {firm.postalCode}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.billedTo}</p>
                  <p className="mt-1">{client?.name}</p>
                  <p className="text-muted-foreground">{client?.address}</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-0">{s.item}</TableHead>
                    <TableHead className="pr-0 text-right">
                      {s.amount}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-0 whitespace-normal">
                        {item.description}
                      </TableCell>
                      <TableCell className="pr-0 text-right tabular-nums">
                        {money(item.quantity * item.rate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <dl className="ml-auto grid w-56 grid-cols-2 gap-y-1.5 tabular-nums">
                <dt className="text-muted-foreground">{s.subtotal}</dt>
                <dd className="text-right">
                  {money(invoiceSubtotal(invoice))}
                </dd>
                {(invoice.taxRate ?? 0) > 0 && (
                  <>
                    <dt className="text-muted-foreground">
                      {s.tax(invoice.taxRate ?? 0)}
                    </dt>
                    <dd className="text-right">
                      {money(invoiceTotal(invoice) - invoiceSubtotal(invoice))}
                    </dd>
                  </>
                )}
                <dt className="font-medium">{s.total}</dt>
                <dd className="text-right font-medium">
                  {money(invoiceTotal(invoice))}
                </dd>
                <dt className="text-muted-foreground">{s.paid}</dt>
                <dd className="text-right">
                  {money(amountPaid(invoice.id, payments))}
                </dd>
                <dt className="border-t pt-1.5 font-medium">{s.balance}</dt>
                <dd className="border-t pt-1.5 text-right font-medium">
                  {money(invoiceBalance(invoice, payments))}
                </dd>
              </dl>
              {invoice.notes && (
                <p className="text-muted-foreground">{invoice.notes}</p>
              )}
            </div>
            <SheetFooter className="flex-row justify-end gap-2 border-t p-4">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => window.print()}
              >
                <HugeiconsIcon
                  icon={PrinterIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                {s.print}
              </Button>
              {invoiceBalance(invoice, payments) > 0 && (
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => onPay(invoice)}
                >
                  {copy.invoices.pay}
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function PayDialog({
  invoice,
  onOpenChange,
}: {
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
}) {
  const id = useId();
  const p = copy.pay;
  const { user } = usePortal();
  const payments = useDemoStore((s) => s.payments);
  const [fields, setFields] = useState({
    name: "",
    card: "",
    expiry: "",
    cvc: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState<number | null>(null);
  const balance = invoice ? invoiceBalance(invoice, payments) : 0;
  const amount = paid ?? balance;

  const errors = {
    name: fields.name.trim().length >= 3 ? "" : p.errors.name,
    card: fields.card.replace(/\D/g, "").length === 16 ? "" : p.errors.card,
    expiry: /^(0[1-9]|1[0-2])\/\d{2}$/.test(fields.expiry)
      ? ""
      : p.errors.expiry,
    cvc: /^\d{3,4}$/.test(fields.cvc) ? "" : p.errors.cvc,
  };
  const show = (m: string) => (submitted && m ? m : undefined);

  function change(open: boolean) {
    onOpenChange(open);
    if (!open) {
      setFields({ name: "", card: "", expiry: "", cvc: "" });
      setSubmitted(false);
      setPaid(null);
    }
  }

  function pay(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!invoice || Object.values(errors).some(Boolean)) return;
    setProcessing(true);
    // A short pause so the demo feels like a real payment.
    setTimeout(() => {
      const payment = recordPayment({
        invoiceId: invoice.id,
        amount: balance,
        method: "card",
        date: new Date().toISOString(),
        reference: `Card ending ${fields.card.replace(/\D/g, "").slice(-4)}`,
      });
      setProcessing(false);
      if (payment) {
        setPaid(balance);
        toast.add({ title: p.toast });
      }
    }, 900);
  }

  const field = (
    key: keyof typeof fields,
    label: string,
    props: React.ComponentProps<typeof Input>,
    format: (v: string) => string = (v) => v,
  ) => (
    <Field data-invalid={Boolean(show(errors[key])) || undefined}>
      <FieldLabel htmlFor={`${id}-${key}`}>{label}</FieldLabel>
      <Input
        id={`${id}-${key}`}
        value={fields[key]}
        aria-invalid={Boolean(show(errors[key])) || undefined}
        onChange={(e) =>
          setFields((f) => ({ ...f, [key]: format(e.target.value) }))
        }
        {...props}
      />
      <FieldError>{show(errors[key])}</FieldError>
    </Field>
  );

  return (
    <Dialog open={Boolean(invoice)} onOpenChange={change}>
      <DialogContent className="sm:max-w-md">
        {paid !== null && invoice ? (
          <div className="flex flex-col gap-5">
            <DialogHeader>
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                strokeWidth={1.5}
                className="size-8"
              />
              <DialogTitle>{p.successTitle}</DialogTitle>
              <DialogDescription>
                {p.successBody(money(paid), invoice.id)}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => window.print()}
              >
                {p.print}
              </Button>
              <Button size="sm" className="h-8" onClick={() => change(false)}>
                {p.done}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={pay}>
            <DialogHeader>
              <DialogTitle className="tabular-nums">
                {p.title(money(amount))}
              </DialogTitle>
              <DialogDescription>{p.description}</DialogDescription>
            </DialogHeader>
            {field("name", p.name, {
              autoComplete: "cc-name",
              placeholder: user?.name,
            })}
            {field(
              "card",
              p.card,
              {
                inputMode: "numeric",
                autoComplete: "cc-number",
                placeholder: "4242 4242 4242 4242",
              },
              (v) =>
                v
                  .replace(/\D/g, "")
                  .slice(0, 16)
                  .replace(/(.{4})/g, "$1 ")
                  .trim(),
            )}
            <div className="grid grid-cols-2 gap-4">
              {field(
                "expiry",
                p.expiry,
                {
                  inputMode: "numeric",
                  autoComplete: "cc-exp",
                  placeholder: "MM/YY",
                },
                (v) => {
                  const d = v.replace(/\D/g, "").slice(0, 4);
                  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
                },
              )}
              {field(
                "cvc",
                p.cvc,
                {
                  inputMode: "numeric",
                  autoComplete: "cc-csc",
                  placeholder: "123",
                },
                (v) => v.replace(/\D/g, "").slice(0, 4),
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => change(false)}
              >
                {p.cancel}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 tabular-nums"
                disabled={processing}
              >
                {processing ? p.processing : p.submit(money(amount))}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function BillingPage() {
  const { client, matter } = usePortal();
  const { balance, nextDue } = usePortalTasks();
  const allInvoices = useDemoStore((s) => s.invoices);
  const allPayments = useDemoStore((s) => s.payments);
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [paying, setPaying] = useState<Invoice | null>(null);

  const invoices = useMemo(
    () =>
      allInvoices
        .filter((i) => i.clientId === client?.id && i.status !== "draft")
        .toSorted((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    [allInvoices, client],
  );
  const payments = useMemo(
    () =>
      allPayments
        .filter((p) => p.clientId === client?.id)
        .toSorted((a, b) => b.date.localeCompare(a.date)),
    [allPayments, client],
  );
  const paidTotal = payments.reduce((s, p) => s + p.amount, 0);
  const c = copy.invoices.columns;
  const h = copy.history.columns;

  return (
    <PortalPage
      title={copy.title}
      description={matter ? copy.feeNote[matter.feeType] : copy.subtitle}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label={copy.stats.due}
          value={money(balance)}
          detail={
            nextDue
              ? copy.stats.nextDue(formatDate(nextDue.dueAt))
              : copy.stats.clear
          }
        />
        <Stat
          label={copy.stats.paid}
          value={money(paidTotal)}
          detail={copy.stats.paidDetail(payments.length)}
        />
        <Stat
          label={copy.stats.trust}
          value={money(client?.trustBalance ?? 0)}
          detail={copy.stats.trustDetail}
        />
      </div>

      <SectionCard title={copy.invoices.title} contentClassName="px-0">
        {invoices.length === 0 ? (
          <p className="px-4 text-sm text-muted-foreground">
            {copy.invoices.empty}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">{c.number}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {c.issued}
                </TableHead>
                <TableHead className="hidden md:table-cell">{c.due}</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  {c.amount}
                </TableHead>
                <TableHead className="text-right">{c.balance}</TableHead>
                <TableHead>{c.status}</TableHead>
                <TableHead className="pr-4">
                  <span className="sr-only">{copy.invoices.view}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => {
                const left = invoiceBalance(inv, allPayments);
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="pl-4 font-medium tabular-nums">
                      {inv.id}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                      {formatDate(inv.issuedAt)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums md:table-cell">
                      {formatDate(inv.dueAt)}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums sm:table-cell">
                      {money(invoiceTotal(inv))}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(left)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={tone[inv.status]}>
                        {copy.statuses[inv.status]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => setViewing(inv)}
                        >
                          {copy.invoices.view}
                        </Button>
                        {left > 0 && (
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => setPaying(inv)}
                          >
                            {copy.invoices.pay}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <SectionCard title={copy.history.title} contentClassName="px-0">
        {payments.length === 0 ? (
          <p className="px-4 text-sm text-muted-foreground">
            {copy.history.empty}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">{h.date}</TableHead>
                <TableHead>{h.invoice}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {h.method}
                </TableHead>
                <TableHead className="pr-4 text-right">{h.amount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-4 tabular-nums">
                    {formatDate(p.date)}
                  </TableCell>
                  <TableCell className="tabular-nums">{p.invoiceId}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {paymentMethodLabels[p.method]}
                    {p.reference && ` · ${p.reference}`}
                  </TableCell>
                  <TableCell className="pr-4 text-right tabular-nums">
                    {money(p.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <InvoiceSheet
        invoice={viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        onPay={(inv) => {
          setViewing(null);
          setPaying(inv);
        }}
      />
      <PayDialog
        invoice={paying}
        onOpenChange={(open) => !open && setPaying(null)}
      />
    </PortalPage>
  );
}
