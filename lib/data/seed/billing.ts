import { invoiceTotal } from "../selectors";
import type {
  Client,
  Invoice,
  InvoiceStatus,
  LineItem,
  Matter,
  Payment,
  PaymentMethod,
  TrustTransaction,
} from "../types";
import { at, past } from "./time";

const ATTORNEY_RATE = 375;
const PARALEGAL_RATE = 165;

/**
 * Two invoices for every hourly and flat-fee matter (40 in all):
 * 20 paid, 8 sent, 1 partially paid, 6 overdue and 5 drafts. Contingency matters are
 * paid out of the settlement, so they have none.
 */
const plan: Record<string, [InvoiceStatus, InvoiceStatus]> = {
  "Estate of Ruth Ingram": ["paid", "paid"],
  "In re Marriage of Shaw": ["paid", "paid"],
  "State v. Moreau": ["paid", "paid"],
  "Harbor & Pine Bakery — Employment Policies": ["paid", "paid"],
  "Albright Family Trust": ["paid", "overdue"],
  "Albright Hardware — Succession Plan": ["paid", "overdue"],
  "State v. Castillo": ["overdue", "draft"],
  "Lin v. Lin — Custody Modification": ["overdue", "draft"],
  "Hollis Consulting — Partnership Dissolution": ["overdue", "draft"],
  "Harbor & Pine Bakery — Commercial Lease": ["overdue", "draft"],
  "Wong Family Estate Plan": ["paid", "draft"],
  "Lin Estate Plan": ["paid", "partially_paid"],
  "In re Marriage of Okafor": ["paid", "sent"],
  "Lumen Botanics — Formation & Operating Agreement": ["paid", "sent"],
  "Lumen Botanics — Trademark Filings": ["paid", "sent"],
  "State v. Herrera": ["paid", "sent"],
  "Mensah v. Whitlock — Custody Enforcement": ["paid", "sent"],
  "Estate of Gerald Hayes": ["paid", "sent"],
  "Quillstone Software — Seed Financing": ["paid", "sent"],
  "In re Marriage of Lindqvist": ["paid", "sent"],
};

const phases: Record<string, [string, string]> = {
  "estate-planning": ["Plan design and drafting", "Signing and funding"],
  "family-law": ["Petition and initial filings", "Discovery and negotiation"],
  "business-law": ["Document review", "Drafting and negotiation"],
  "criminal-defense": ["Pre-arraignment representation", "Pretrial phase"],
  "personal-injury": ["Case costs", "Case costs"],
};

function lineItems(matter: Matter, part: 0 | 1, seed: number): LineItem[] {
  const phase = phases[matter.practiceArea][part];
  const id = (n: number) => `${matter.id}-${part}-${n}`;
  if (matter.feeType === "flat") {
    const items: LineItem[] = [
      {
        id: id(1),
        description: `Flat fee — ${phase}`,
        quantity: 1,
        rate: Math.round((matter.budget ?? 0) / 2),
      },
    ];
    if (part === 1 && matter.practiceArea === "estate-planning") {
      items.push({
        id: id(2),
        description: "Recording and filing costs",
        quantity: 1,
        rate: 185,
      });
    }
    return items;
  }
  return [
    {
      id: id(1),
      description: `Attorney time — ${phase}`,
      quantity: 4 + (seed % 7),
      rate: ATTORNEY_RATE,
    },
    {
      id: id(2),
      description: "Paralegal time",
      quantity: 2 + (seed % 4),
      rate: PARALEGAL_RATE,
    },
    ...(part === 0 && matter.practiceArea === "family-law"
      ? [
          {
            id: id(3),
            description: "Court filing fee",
            quantity: 1,
            rate: 435,
          },
        ]
      : []),
  ];
}

function dates(
  now: Date,
  status: InvoiceStatus,
  part: 0 | 1,
  openedDaysAgo: number,
  seed: number,
) {
  const net30 = (issuedDaysAgo: number) => ({
    issuedAt: past(now, issuedDaysAgo, 9),
    dueAt: at(now, 30 - issuedDaysAgo, 17),
  });
  switch (status) {
    case "overdue":
      return net30(part === 0 ? 48 : 40);
    case "draft":
      return net30(0);
    case "sent":
    case "partially_paid":
      return net30(Math.min(openedDaysAgo - 4, 3 + (seed % 15)));
    case "paid": {
      const issued =
        part === 0
          ? Math.max(openedDaysAgo - 3, 1)
          : Math.max(Math.round(openedDaysAgo / 2), 1);
      const paidDaysAgo = Math.max(issued - 6 - (seed % 5), 0);
      return { ...net30(issued), paidAt: past(now, paidDaysAgo, 14) };
    }
    default:
      return net30(0);
  }
}

export function buildInvoices(now: Date, matters: Matter[]): Invoice[] {
  const daysOpen = (m: Matter) =>
    Math.round((now.getTime() - new Date(m.openedAt).getTime()) / 864e5);

  const invoices = matters.flatMap((matter, i) => {
    const statuses = plan[matter.title];
    if (!statuses) return [];
    return statuses.map((status, part) => {
      const p = part as 0 | 1;
      return {
        matterId: matter.id,
        clientId: matter.clientId,
        status,
        ...dates(now, status, p, daysOpen(matter), i * 3 + part),
        lineItems: lineItems(matter, p, i * 5 + part),
      };
    });
  });

  const numbered: Invoice[] = invoices
    .sort((a, b) => a.issuedAt.localeCompare(b.issuedAt))
    .map((invoice, i) => ({
      id: `INV-${new Date(invoice.issuedAt).getFullYear()}-${1001 + i}`,
      ...invoice,
    }));
  const maria = matters.find((matter) => matter.id === "M-2026-0142");
  if (maria) {
    numbered.push({
      id: `INV-${now.getFullYear()}-1099`,
      matterId: maria.id,
      clientId: maria.clientId,
      status: "sent",
      issuedAt: past(now, 5, 9),
      dueAt: at(now, 25, 17),
      lineItems: [
        {
          id: `${maria.id}-expense-1`,
          description: "Medical records retrieval fees",
          quantity: 1,
          rate: 245,
        },
      ],
      notes: "Case expense advanced by the firm.",
    });
  }
  return numbered;
}

const methods: PaymentMethod[] = ["card", "ach", "check"];

function reference(method: PaymentMethod, n: number) {
  switch (method) {
    case "card":
      return `Card ending ${String(4242 + n * 7).slice(-4)}`;
    case "ach":
      return `ACH ${String(840_000 + n * 1337)}`;
    case "check":
      return `Check #${1040 + n}`;
    case "trust":
      return "Transfer from trust";
  }
}

/**
 * A payment for every paid invoice and half of each partially paid one.
 * Clients with money in trust pay some invoices by trust transfer.
 */
export function buildPayments(
  now: Date,
  invoices: Invoice[],
  clients: Client[],
): Payment[] {
  const payments: Payment[] = [];
  invoices.forEach((invoice, i) => {
    const total = invoiceTotal(invoice);
    const hasTrust =
      (clients.find((c) => c.id === invoice.clientId)?.trustBalance ?? 0) > 0;
    if (invoice.status === "paid" && invoice.paidAt) {
      const method = hasTrust && i % 3 === 0 ? "trust" : methods[i % 3];
      payments.push({
        id: `PAY-${2001 + payments.length}`,
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        date: invoice.paidAt,
        method,
        amount: total,
        reference: reference(method, i),
      });
    }
    if (invoice.status === "partially_paid") {
      const issued = new Date(invoice.issuedAt).getTime();
      payments.push({
        id: `PAY-${2001 + payments.length}`,
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        date: new Date(
          Math.min(issued + 2 * 864e5, now.getTime()),
        ).toISOString(),
        method: "card",
        amount: Math.round(total / 2),
        reference: reference("card", i),
      });
    }
  });
  return payments;
}

/**
 * Each client with trust money made one deposit when retained, minus any
 * transfers that paid invoices, so balances add up to `trustBalance`.
 */
export function buildTrustTransactions(
  clients: Client[],
  matters: Matter[],
  payments: Payment[],
  invoices: Invoice[],
): TrustTransaction[] {
  const transactions: TrustTransaction[] = [];
  for (const client of clients) {
    const transfers = payments.filter(
      (p) => p.clientId === client.id && p.method === "trust",
    );
    const transferred = transfers.reduce((sum, p) => sum + p.amount, 0);
    if (client.trustBalance + transferred <= 0) continue;
    const matterId = matters.find((m) => m.clientId === client.id)?.id;
    transactions.push({
      id: `TR-${3001 + transactions.length}`,
      clientId: client.id,
      matterId,
      date: client.since,
      type: "deposit",
      amount: client.trustBalance + transferred,
      note: "Retainer deposit",
    });
    for (const p of transfers) {
      transactions.push({
        id: `TR-${3001 + transactions.length}`,
        clientId: client.id,
        matterId: invoices.find((inv) => inv.id === p.invoiceId)?.matterId,
        date: p.date,
        type: "transfer",
        amount: p.amount,
        invoiceId: p.invoiceId,
        note: `Applied to ${p.invoiceId}`,
      });
    }
  }
  return transactions;
}
