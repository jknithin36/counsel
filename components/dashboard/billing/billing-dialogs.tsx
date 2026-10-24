"use client";

import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { addDays, format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  billingPage,
  invoiceDialog as copy,
  paymentDialog,
  trustDialog,
} from "@/lib/content/dashboard-office";
import { createInvoice, recordPayment, trustDeposit } from "@/lib/data/billing";
import { paymentMethodLabels } from "@/lib/data/labels";
import { findDemoUser } from "@/lib/data/seed/users";
import { invoiceBalance, OPEN_STATUSES } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { PaymentMethod } from "@/lib/data/types";
import { formatMoney } from "@/lib/format";
import { useSettings } from "@/lib/site-content";
import { TipButton } from "../tip-button";

/** A date input (yyyy-mm-dd) as a local ISO timestamp at noon. */
const toIso = (value: string) => new Date(`${value}T12:00:00`).toISOString();
const ymd = (date: Date) => format(date, "yyyy-MM-dd");
const money = (value: string) => Number(value.replace(/[^\d.]/g, "")) || 0;

type Line = {
  key: string;
  description: string;
  quantity: string;
  rate: string;
};
const blankLine = (n: number): Line => ({
  key: `l${n}-${Date.now()}`,
  description: "",
  quantity: "1",
  rate: "",
});

function Footer({ children }: { children: React.ReactNode }) {
  return <DialogFooter className="gap-2">{children}</DialogFooter>;
}

export function InvoiceDialog({
  open,
  onOpenChange,
  clientId: fixedClient,
  matterId: fixedMatter,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  matterId?: string;
}) {
  const router = useRouter();
  const ids = useId();
  const clients = useDemoStore((s) => s.clients);
  const matters = useDemoStore((s) => s.matters);
  const [clientId, setClientId] = useState<string | null>(null);
  const [matterId, setMatterId] = useState<string | null>(null);
  const [issued, setIssued] = useState(ymd(new Date()));
  const billing = useSettings("billing");
  const [terms, setTerms] = useState(String(billing.terms));
  const [lines, setLines] = useState<Line[]>([blankLine(0)]);
  const [tax, setTax] = useState("0");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when opened
  useEffect(() => {
    if (!open) return;
    setClientId(fixedClient ?? null);
    setMatterId(fixedMatter ?? null);
    setIssued(ymd(new Date()));
    setTerms(String(billing.terms));
    setLines([blankLine(0)]);
    if (fixedMatter) pickMatter(fixedMatter);
    setTax("0");
    setNotes("");
    setSubmitted(false);
  }, [open]);

  const clientItems = useMemo(
    () =>
      clients
        .filter((c) => !c.archived)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => ({ value: c.id, label: c.name })),
    [clients],
  );
  const matterItems = useMemo(
    () =>
      matters
        .filter((m) => m.clientId === clientId && m.status !== "closed")
        .map((m) => ({ value: m.id, label: `${m.id} · ${m.title}` })),
    [matters, clientId],
  );
  const matter = matters.find((m) => m.id === matterId);
  const contingency = matter?.feeType === "contingency";

  /** Fills empty rates with the lead attorney's hourly rate (Settings › Billing). */
  function pickMatter(id: string) {
    setMatterId(id);
    const lead = findDemoUser(
      matters.find((m) => m.id === id)?.leadAttorneyId ?? "",
    );
    if (!lead || lead.role === "client") return;
    const rate = String(billing.rates[lead.role]);
    setLines((list) => list.map((l) => (l.rate ? l : { ...l, rate })));
  }

  const subtotal = lines.reduce(
    (sum, l) => sum + money(l.quantity) * money(l.rate),
    0,
  );
  const taxRate = Math.min(Math.max(Number(tax) || 0, 0), 100);
  const total = Math.round(subtotal * (1 + taxRate / 100) * 100) / 100;
  const due = addDays(new Date(`${issued}T12:00:00`), Number(terms));
  const valid = lines.filter(
    (l) => l.description.trim() && money(l.quantity) * money(l.rate) > 0,
  );

  const errors = {
    client: clientId ? "" : copy.errors.client,
    matter: matterId ? "" : copy.errors.matter,
    items: valid.length ? "" : copy.errors.items,
  };

  function save(send: boolean) {
    setSubmitted(true);
    if (!clientId || !matterId || valid.length === 0) return;
    const invoice = createInvoice({
      clientId,
      matterId,
      issuedAt: toIso(issued),
      dueAt: due.toISOString(),
      lineItems: valid.map((l) => ({
        description: l.description.trim(),
        quantity: money(l.quantity),
        rate: money(l.rate),
      })),
      taxRate,
      notes,
      send,
    });
    onOpenChange(false);
    toast.add({
      title: send
        ? billingPage.toasts.createdSent(invoice.id)
        : billingPage.toasts.created(invoice.id),
      actionProps: {
        children: billingPage.actions.view,
        onClick: () => router.push(`/dashboard/billing/invoices/${invoice.id}`),
      },
    });
  }

  const update = (key: string, patch: Partial<Line>) =>
    setLines((list) =>
      list.map((l) => (l.key === key ? { ...l, ...patch } : l)),
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">
            {copy.title}
          </DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            data-invalid={(submitted && Boolean(errors.client)) || undefined}
          >
            <FieldLabel htmlFor={`${ids}-client`}>{copy.client}</FieldLabel>
            <Select
              items={clientItems}
              value={clientId}
              onValueChange={(v) => {
                setClientId(v as string);
                setMatterId(null);
              }}
              disabled={Boolean(fixedClient)}
            >
              <SelectTrigger id={`${ids}-client`} className="h-9 w-full">
                <SelectValue placeholder={copy.clientPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {clientItems.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{submitted ? errors.client : undefined}</FieldError>
          </Field>
          <Field
            data-invalid={(submitted && Boolean(errors.matter)) || undefined}
          >
            <FieldLabel htmlFor={`${ids}-matter`}>{copy.matter}</FieldLabel>
            <Select
              items={matterItems}
              value={matterId}
              onValueChange={(v) => pickMatter(v as string)}
              disabled={!clientId || Boolean(fixedMatter)}
            >
              <SelectTrigger id={`${ids}-matter`} className="h-9 w-full">
                <SelectValue placeholder={copy.matterPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {matterItems.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{submitted ? errors.matter : undefined}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-issued`}>{copy.issued}</FieldLabel>
            <Input
              id={`${ids}-issued`}
              type="date"
              className="h-9"
              value={issued}
              onChange={(e) => e.target.value && setIssued(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel id={`${ids}-terms`}>{copy.terms}</FieldLabel>
            <div className="flex flex-wrap items-center gap-3">
              <ToggleGroup
                aria-labelledby={`${ids}-terms`}
                variant="outline"
                size="sm"
                spacing={0}
                value={[terms]}
                onValueChange={(v) => v[0] && setTerms(v[0] as string)}
              >
                {["15", "30"].map((n) => (
                  <ToggleGroupItem key={n} value={n} className="h-9 px-3">
                    {copy.net(Number(n))}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <span className="text-sm text-muted-foreground tabular-nums">
                {copy.due} {format(due, "MMM d, yyyy")}
              </span>
            </div>
          </Field>
        </div>

        {contingency && (
          <p className="rounded-lg border bg-muted/50 px-3 py-2 text-sm">
            {copy.contingency}
          </p>
        )}

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">{copy.items}</legend>
          <div className="hidden grid-cols-[1fr_96px_112px_104px_32px] gap-2 text-xs text-muted-foreground sm:grid">
            <span>{copy.description_}</span>
            <span>{copy.quantity}</span>
            <span>{copy.rate}</span>
            <span className="text-right">{copy.amount}</span>
            <span />
          </div>
          {lines.map((line, i) => (
            <div
              key={line.key}
              className="grid grid-cols-[1fr_1fr_32px] gap-2 sm:grid-cols-[1fr_96px_112px_104px_32px]"
            >
              <Input
                aria-label={`${copy.description_} ${i + 1}`}
                className="col-span-3 h-9 sm:col-span-1"
                placeholder={
                  contingency ? copy.expensesPlaceholder : copy.itemPlaceholder
                }
                value={line.description}
                onChange={(e) =>
                  update(line.key, { description: e.target.value })
                }
              />
              <Input
                aria-label={`${copy.quantity} ${i + 1}`}
                inputMode="decimal"
                className="h-9 tabular-nums"
                value={line.quantity}
                onChange={(e) =>
                  update(line.key, {
                    quantity: e.target.value.replace(/[^\d.]/g, ""),
                  })
                }
              />
              <Input
                aria-label={`${copy.rate} ${i + 1}`}
                inputMode="decimal"
                placeholder="$"
                className="h-9 tabular-nums"
                value={line.rate}
                onChange={(e) =>
                  update(line.key, {
                    rate: e.target.value.replace(/[^\d.]/g, ""),
                  })
                }
              />
              <span className="hidden self-center text-right text-sm tabular-nums sm:block">
                {formatMoney(money(line.quantity) * money(line.rate), true)}
              </span>
              <TipButton
                variant="ghost"
                size="icon"
                aria-label={copy.removeItem(i + 1)}
                disabled={lines.length === 1}
                onClick={() =>
                  setLines((list) => list.filter((l) => l.key !== line.key))
                }
              >
                <HugeiconsIcon icon={Delete02Icon} />
              </TipButton>
            </div>
          ))}
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() =>
                setLines((list) => [...list, blankLine(list.length)])
              }
            >
              <HugeiconsIcon icon={Add01Icon} />
              {copy.addItem}
            </Button>
          </div>
          {submitted && errors.items && (
            <p className="text-sm text-destructive">{errors.items}</p>
          )}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${ids}-notes`}>{copy.notes}</FieldLabel>
            <Textarea
              id={`${ids}-notes`}
              rows={3}
              placeholder={copy.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          <dl className="flex flex-col gap-2 self-end text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{copy.subtotal}</dt>
              <dd className="tabular-nums">{formatMoney(subtotal, true)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt>
                <label htmlFor={`${ids}-tax`} className="text-muted-foreground">
                  {copy.tax}
                </label>
              </dt>
              <dd>
                <Input
                  id={`${ids}-tax`}
                  inputMode="decimal"
                  className="h-8 w-20 text-right tabular-nums"
                  value={tax}
                  onChange={(e) =>
                    setTax(e.target.value.replace(/[^\d.]/g, ""))
                  }
                />
              </dd>
            </div>
            <div className="flex justify-between border-t pt-2 font-medium">
              <dt>{copy.total}</dt>
              <dd className="font-serif text-xl tabular-nums">
                {formatMoney(total, true)}
              </dd>
            </div>
          </dl>
        </div>

        <Footer>
          <Button
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => onOpenChange(false)}
          >
            {copy.cancel}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => save(false)}
          >
            {copy.draft}
          </Button>
          <Button size="sm" className="h-9" onClick={() => save(true)}>
            {copy.send}
          </Button>
        </Footer>
      </DialogContent>
    </Dialog>
  );
}

const methods = Object.keys(paymentMethodLabels) as PaymentMethod[];

export function PaymentDialog({
  open,
  onOpenChange,
  invoiceId: fixedInvoice,
  method: presetMethod = "card",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId?: string;
  /** e.g. "trust" for a transfer from the trust account. */
  method?: PaymentMethod;
}) {
  const c = paymentDialog;
  const ids = useId();
  const invoices = useDemoStore((s) => s.invoices);
  const payments = useDemoStore((s) => s.payments);
  const clients = useDemoStore((s) => s.clients);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("card");
  const accepted = useSettings("billing").methods;
  // Methods turned off in Settings › Billing are hidden (unless preset).
  const methodItems = methods
    .filter((m) => accepted[m] || m === presetMethod)
    .map((m) => ({ value: m, label: paymentMethodLabels[m] }));
  const [date, setDate] = useState(ymd(new Date()));
  const [reference, setReference] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const unpaid = useMemo(
    () =>
      invoices
        .filter((i) => OPEN_STATUSES.includes(i.status))
        .map((i) => ({
          value: i.id,
          label: `${i.id} · ${clients.find((cl) => cl.id === i.clientId)?.name ?? ""} · ${formatMoney(invoiceBalance(i, payments), true)}`,
        })),
    [invoices, payments, clients],
  );
  const invoice = invoices.find((i) => i.id === invoiceId);
  const balance = invoice ? invoiceBalance(invoice, payments) : 0;
  const trust =
    clients.find((cl) => cl.id === invoice?.clientId)?.trustBalance ?? 0;

  /** Selects an invoice; the amount defaults to its balance (or what trust covers). */
  function pick(id: string | null, payWith: PaymentMethod = method) {
    setInvoiceId(id);
    const inv = invoices.find((i) => i.id === id);
    if (!inv) {
      setAmount("");
      return;
    }
    const due = invoiceBalance(inv, payments);
    const available =
      clients.find((cl) => cl.id === inv.clientId)?.trustBalance ?? 0;
    setAmount(String(payWith === "trust" ? Math.min(due, available) : due));
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when opened
  useEffect(() => {
    if (!open) return;
    setMethod(presetMethod);
    pick(fixedInvoice ?? null, presetMethod);
    setDate(ymd(new Date()));
    setReference("");
    setSubmitted(false);
  }, [open]);

  const value = money(amount);
  const errors = {
    invoice: invoice ? "" : c.errors.invoice,
    amount: value > 0 && value <= balance + 0.005 ? "" : c.errors.amount,
    trust: method === "trust" && value > trust + 0.005 ? c.errors.trust : "",
  };

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!invoice || errors.amount || errors.trust) return;
    const payment = recordPayment({
      invoiceId: invoice.id,
      amount: value,
      method,
      date: toIso(date),
      reference,
    });
    if (!payment) return;
    toast.add({
      title: billingPage.toasts.payment(formatMoney(value, true), invoice.id),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>
        <form
          id={`${ids}-form`}
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={save}
        >
          <Field
            className="sm:col-span-2"
            data-invalid={(submitted && Boolean(errors.invoice)) || undefined}
          >
            <FieldLabel htmlFor={`${ids}-invoice`}>{c.invoice}</FieldLabel>
            <Select
              items={unpaid}
              value={invoiceId}
              onValueChange={(v) => pick(v as string)}
              disabled={Boolean(fixedInvoice)}
            >
              <SelectTrigger id={`${ids}-invoice`} className="h-9 w-full">
                <SelectValue placeholder={c.invoicePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {unpaid.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{submitted ? errors.invoice : undefined}</FieldError>
          </Field>
          <Field
            data-invalid={(submitted && Boolean(errors.amount)) || undefined}
          >
            <FieldLabel htmlFor={`${ids}-amount`}>{c.amount}</FieldLabel>
            <Input
              id={`${ids}-amount`}
              inputMode="decimal"
              className="h-9 tabular-nums"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            />
            {invoice && (
              <FieldDescription>
                {c.balance(formatMoney(balance, true))}
              </FieldDescription>
            )}
            <FieldError>{submitted ? errors.amount : undefined}</FieldError>
          </Field>
          <Field
            data-invalid={(submitted && Boolean(errors.trust)) || undefined}
          >
            <FieldLabel htmlFor={`${ids}-method`}>{c.method}</FieldLabel>
            <Select
              items={methodItems}
              value={method}
              onValueChange={(v) => setMethod(v as PaymentMethod)}
            >
              <SelectTrigger id={`${ids}-method`} className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {methodItems.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {method === "trust" && invoice && (
              <FieldDescription>
                {c.trustAvailable(formatMoney(trust, true))}
              </FieldDescription>
            )}
            <FieldError>{submitted ? errors.trust : undefined}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-date`}>{c.date}</FieldLabel>
            <Input
              id={`${ids}-date`}
              type="date"
              className="h-9"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-ref`}>{c.reference}</FieldLabel>
            <Input
              id={`${ids}-ref`}
              className="h-9"
              placeholder={c.referencePlaceholder}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </Field>
        </form>
        <Footer>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => onOpenChange(false)}
          >
            {c.cancel}
          </Button>
          <Button type="submit" form={`${ids}-form`} size="sm" className="h-9">
            {c.save}
          </Button>
        </Footer>
      </DialogContent>
    </Dialog>
  );
}

export function TrustDialog({
  open,
  onOpenChange,
  clientId: fixedClient,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
}) {
  const c = trustDialog;
  const ids = useId();
  const clients = useDemoStore((s) => s.clients);
  const matters = useDemoStore((s) => s.matters);
  const [clientId, setClientId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when opened
  useEffect(() => {
    if (!open) return;
    setClientId(fixedClient ?? null);
    setAmount("");
    setNote("");
    setSubmitted(false);
  }, [open]);

  const items = useMemo(
    () =>
      clients
        .filter((cl) => !cl.archived)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((cl) => ({ value: cl.id, label: cl.name })),
    [clients],
  );

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const value = money(amount);
    if (!clientId || value <= 0) return;
    trustDeposit({
      clientId,
      matterId: matters.find(
        (m) => m.clientId === clientId && m.status !== "closed",
      )?.id,
      amount: value,
      note,
    });
    toast.add({
      title: billingPage.toasts.deposit(
        formatMoney(value, true),
        clients.find((cl) => cl.id === clientId)?.name ?? "",
      ),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>
        <form id={`${ids}-form`} className="grid gap-4" onSubmit={save}>
          <Field data-invalid={(submitted && !clientId) || undefined}>
            <FieldLabel htmlFor={`${ids}-client`}>{c.client}</FieldLabel>
            <Select
              items={items}
              value={clientId}
              onValueChange={(v) => setClientId(v as string)}
              disabled={Boolean(fixedClient)}
            >
              <SelectTrigger id={`${ids}-client`} className="h-9 w-full">
                <SelectValue placeholder={c.clientPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {items.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>
              {submitted && !clientId ? c.errors.client : undefined}
            </FieldError>
          </Field>
          <Field data-invalid={(submitted && money(amount) <= 0) || undefined}>
            <FieldLabel htmlFor={`${ids}-amount`}>{c.amount}</FieldLabel>
            <Input
              id={`${ids}-amount`}
              inputMode="decimal"
              placeholder="$"
              className="h-9 tabular-nums"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            />
            <FieldError>
              {submitted && money(amount) <= 0 ? c.errors.amount : undefined}
            </FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-note`}>{c.note}</FieldLabel>
            <Input
              id={`${ids}-note`}
              className="h-9"
              placeholder={c.notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
        </form>
        <Footer>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => onOpenChange(false)}
          >
            {c.cancel}
          </Button>
          <Button type="submit" form={`${ids}-form`} size="sm" className="h-9">
            {c.save}
          </Button>
        </Footer>
      </DialogContent>
    </Dialog>
  );
}
