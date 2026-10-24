import { findDemoUser } from "./seed/users";
import type {
  Invoice,
  InvoiceStatus,
  Lead,
  MessageThread,
  Payment,
} from "./types";

/*
 * Pure helpers over store data. Components select raw collections from
 * useDemoStore and derive views with these, so everything updates when
 * the store changes.
 */

/*
 * Billing math. Every screen (overview, client, matter, billing) uses these
 * so the numbers always agree.
 */

export function invoiceSubtotal(invoice: Pick<Invoice, "lineItems">) {
  return invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );
}

/** Subtotal plus tax, rounded to cents. */
export function invoiceTotal(invoice: Pick<Invoice, "lineItems" | "taxRate">) {
  const subtotal = invoiceSubtotal(invoice);
  return Math.round(subtotal * (1 + (invoice.taxRate ?? 0) / 100) * 100) / 100;
}

export function amountPaid(invoiceId: string, payments: Payment[]) {
  return payments
    .filter((p) => p.invoiceId === invoiceId)
    .reduce((sum, p) => sum + p.amount, 0);
}

/** Statuses the client still owes money on. */
export const OPEN_STATUSES: InvoiceStatus[] = [
  "sent",
  "partially_paid",
  "overdue",
];

/** What's left to pay; zero for drafts, paid and void invoices. */
export function invoiceBalance(invoice: Invoice, payments: Payment[]) {
  if (!OPEN_STATUSES.includes(invoice.status)) return 0;
  return Math.max(0, invoiceTotal(invoice) - amountPaid(invoice.id, payments));
}

export function outstandingFor(invoices: Invoice[], payments: Payment[]) {
  const open = invoices.filter((i) => OPEN_STATUSES.includes(i.status));
  return {
    amount: open.reduce((sum, i) => sum + invoiceBalance(i, payments), 0),
    count: open.length,
    overdue: open.filter((i) => i.status === "overdue"),
  };
}

export function leadName(lead: Pick<Lead, "firstName" | "lastName">) {
  return `${lead.firstName} ${lead.lastName}`;
}

export function userName(id: string) {
  return findDemoUser(id)?.name ?? "Unassigned";
}

/** Messages are authored by a staff user id, a client id or Maria's login. */
export function isClientAuthor(authorId: string) {
  return (
    authorId.startsWith("cl-") || findDemoUser(authorId)?.role === "client"
  );
}

/** Client messages staff haven't read yet. */
export function unreadForStaff(threads: MessageThread[]) {
  return threads
    .flatMap((t) => t.messages)
    .filter((m) => !m.read && isClientAuthor(m.authorId)).length;
}
