"use client";

import { formatMoney } from "@/lib/format";
import { currentUser, uid } from "./leads";
import { amountPaid, invoiceBalance, invoiceTotal } from "./selectors";
import { useDemoStore } from "./store";
import type {
  FirmActivityType,
  Invoice,
  LineItem,
  Payment,
  PaymentMethod,
} from "./types";

/*
 * Billing data access: invoices, payments and the trust account. Paying
 * by trust transfer moves money out of the client's trust balance.
 */

const now = () => new Date().toISOString();

function log(
  type: FirmActivityType,
  message: string,
  href = "/dashboard/billing",
) {
  useDemoStore.getState().mutate((data) => ({
    activityLog: [
      {
        id: uid(),
        createdAt: now(),
        type,
        actorId: currentUser().id,
        message,
        href,
      },
      ...data.activityLog,
    ],
  }));
}

const clientName = (id: string) =>
  useDemoStore.getState().clients.find((c) => c.id === id)?.name ?? "client";

export function getInvoice(id: string) {
  return useDemoStore.getState().invoices.find((i) => i.id === id);
}

/** The next number, e.g. "INV-2026-1041". */
export function nextInvoiceNumber(
  invoices: Invoice[],
  year = new Date().getFullYear(),
  prefix = useDemoStore.getState().settings.billing?.prefix ?? "INV",
) {
  const max = Math.max(
    1000,
    ...invoices.map((i) => Number(i.id.split("-").at(-1)) || 0),
  );
  return `${prefix}-${year}-${max + 1}`;
}

export type InvoiceInput = {
  clientId: string;
  matterId: string;
  issuedAt: string;
  dueAt: string;
  lineItems: Omit<LineItem, "id">[];
  taxRate: number;
  notes: string;
  send: boolean;
};

export function createInvoice(input: InvoiceInput): Invoice {
  const { invoices, mutate } = useDemoStore.getState();
  const id = nextInvoiceNumber(
    invoices,
    new Date(input.issuedAt).getFullYear(),
  );
  const invoice: Invoice = {
    id,
    matterId: input.matterId,
    clientId: input.clientId,
    status: input.send ? "sent" : "draft",
    issuedAt: input.issuedAt,
    dueAt: input.dueAt,
    lineItems: input.lineItems.map((item) => ({ ...item, id: uid() })),
    taxRate: input.taxRate || undefined,
    notes: input.notes.trim() || undefined,
  };
  mutate((data) => ({ invoices: [...data.invoices, invoice] }));
  log(
    input.send ? "invoice_sent" : "matter_updated",
    input.send
      ? `Invoice ${id} sent to ${clientName(input.clientId)} · ${formatMoney(invoiceTotal(invoice))}`
      : `Draft invoice ${id} created for ${clientName(input.clientId)}`,
    `/dashboard/billing/invoices/${id}`,
  );
  return invoice;
}

function setStatus(id: string, patch: Partial<Invoice>) {
  useDemoStore.getState().mutate((data) => ({
    invoices: data.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  }));
}

export function sendInvoice(id: string) {
  const invoice = getInvoice(id);
  if (!invoice || invoice.status !== "draft") return;
  setStatus(id, { status: "sent", issuedAt: now() });
  log(
    "invoice_sent",
    `Invoice ${id} sent to ${clientName(invoice.clientId)} · ${formatMoney(invoiceTotal(invoice))}`,
    `/dashboard/billing/invoices/${id}`,
  );
}

export function voidInvoice(id: string) {
  setStatus(id, { status: "void" });
  log(
    "invoice_sent",
    `Invoice ${id} voided`,
    `/dashboard/billing/invoices/${id}`,
  );
}

export type PaymentInput = {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  reference: string;
};

/**
 * Records a payment and sets the invoice to paid or partially paid. A
 * trust transfer also debits the client's trust balance.
 */
export function recordPayment(input: PaymentInput): Payment | null {
  const { invoices, payments, clients, mutate } = useDemoStore.getState();
  const invoice = invoices.find((i) => i.id === input.invoiceId);
  if (!invoice) return null;
  const amount = Math.round(input.amount * 100) / 100;
  const client = clients.find((c) => c.id === invoice.clientId);
  if (input.method === "trust" && (client?.trustBalance ?? 0) < amount)
    return null;

  const payment: Payment = {
    id: `PAY-${uid().slice(0, 6).toUpperCase()}`,
    invoiceId: invoice.id,
    clientId: invoice.clientId,
    date: input.date,
    method: input.method,
    amount,
    reference:
      input.reference.trim() ||
      (input.method === "trust" ? "Transfer from trust" : ""),
  };
  const paidAfter = amountPaid(invoice.id, payments) + amount;
  const settled = paidAfter >= invoiceTotal(invoice) - 0.005;

  mutate((data) => ({
    payments: [...data.payments, payment],
    invoices: data.invoices.map((i) =>
      i.id === invoice.id
        ? {
            ...i,
            status: settled ? "paid" : "partially_paid",
            paidAt: settled ? input.date : i.paidAt,
          }
        : i,
    ),
    ...(input.method === "trust"
      ? {
          clients: data.clients.map((c) =>
            c.id === invoice.clientId
              ? { ...c, trustBalance: c.trustBalance - amount }
              : c,
          ),
          trustTransactions: [
            ...data.trustTransactions,
            {
              id: `TR-${uid().slice(0, 6).toUpperCase()}`,
              clientId: invoice.clientId,
              matterId: invoice.matterId,
              date: input.date,
              type: "transfer" as const,
              amount,
              invoiceId: invoice.id,
              note: `Applied to ${invoice.id}`,
            },
          ],
        }
      : {}),
  }));
  const clientPayment = useDemoStore.getState().session?.role === "client";
  log(
    clientPayment ? "invoice_paid" : "payment_recorded",
    clientPayment
      ? `Maria Delgado paid ${invoice.id} · ${formatMoney(amount, true)}`
      : `Payment of ${formatMoney(amount, true)} recorded on ${invoice.id} (${settled ? "paid in full" : "partial"})`,
    `/dashboard/billing/invoices/${invoice.id}`,
  );
  return payment;
}

/** Pays the remaining balance in one step. */
export function markInvoicePaid(id: string, method: PaymentMethod = "ach") {
  const { invoices, payments } = useDemoStore.getState();
  const invoice = invoices.find((i) => i.id === id);
  if (!invoice) return null;
  return recordPayment({
    invoiceId: id,
    amount: invoiceBalance(invoice, payments) || invoiceTotal(invoice),
    method,
    date: now(),
    reference: "Marked paid",
  });
}

export function trustDeposit(input: {
  clientId: string;
  matterId?: string;
  amount: number;
  note: string;
}) {
  const amount = Math.round(input.amount * 100) / 100;
  useDemoStore.getState().mutate((data) => ({
    clients: data.clients.map((c) =>
      c.id === input.clientId
        ? { ...c, trustBalance: c.trustBalance + amount }
        : c,
    ),
    trustTransactions: [
      ...data.trustTransactions,
      {
        id: `TR-${uid().slice(0, 6).toUpperCase()}`,
        clientId: input.clientId,
        matterId: input.matterId,
        date: now(),
        type: "deposit",
        amount,
        note: input.note.trim() || "Deposit",
      },
    ],
  }));
  log(
    "trust_updated",
    `Trust deposit of ${formatMoney(amount, true)} for ${clientName(input.clientId)}`,
  );
}
