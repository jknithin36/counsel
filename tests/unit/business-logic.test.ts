import { beforeEach, describe, expect, test } from "vitest";
import { nextInvoiceNumber, recordPayment } from "@/lib/data/billing";
import { scoreMatch } from "@/lib/data/conflicts";
import { setLeadStatus } from "@/lib/data/leads";
import { nextMatterNumber } from "@/lib/data/matters";
import { buildSeed } from "@/lib/data/seed";
import { demoStaffUser } from "@/lib/data/seed/users";
import { invoiceBalance, invoiceTotal } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { Invoice, Matter } from "@/lib/data/types";

const today = new Date("2026-10-24T16:00:00.000Z");

beforeEach(() => {
  useDemoStore.getState().resetData(buildSeed(today));
  useDemoStore.getState().setSession({
    userId: demoStaffUser.id,
    role: demoStaffUser.role,
    signedInAt: today.toISOString(),
  });
});

describe("lead status transitions", () => {
  test("changes a lead status and records the transition", () => {
    const lead = useDemoStore.getState().leads[0];
    const before = lead.activity.length;

    setLeadStatus(lead.id, "contacted");

    const updated = useDemoStore
      .getState()
      .leads.find((item) => item.id === lead.id);
    expect(updated?.status).toBe("contacted");
    expect(updated?.activity).toHaveLength(before + 1);
    expect(updated?.activity.at(-1)?.type).toBe("status_changed");
  });

  test("does not duplicate an unchanged status", () => {
    const lead = useDemoStore.getState().leads[0];
    const before = lead.activity.length;
    setLeadStatus(lead.id, lead.status);
    expect(useDemoStore.getState().leads[0].activity).toHaveLength(before);
  });
});

describe("conflict matching", () => {
  test("matches exact names after normalizing company suffixes", () => {
    expect(
      scoreMatch("Example Company LLC", "Example Company, Inc."),
    ).toMatchObject({ strength: "exact" });
  });

  test("finds a likely typo but rejects unrelated names", () => {
    expect(scoreMatch("Lindquist", "Lindqvist")?.strength).toBe("possible");
    expect(scoreMatch("North Group", "South Partners")).toBeNull();
  });
});

describe("invoice totals and payments", () => {
  test("calculates quantity, rate and tax to the cent", () => {
    const invoice = {
      lineItems: [
        { id: "1", description: "Service", quantity: 1.5, rate: 200 },
        { id: "2", description: "Filing", quantity: 1, rate: 25.5 },
      ],
      taxRate: 6.25,
    };
    expect(invoiceTotal(invoice)).toBe(345.84);
  });

  test("applies a partial payment and updates the remaining balance", () => {
    const invoice = useDemoStore
      .getState()
      .invoices.find((item) => ["sent", "overdue"].includes(item.status));
    expect(invoice).toBeDefined();
    if (!invoice) return;

    const payment = recordPayment({
      invoiceId: invoice.id,
      amount: 25,
      method: "ach",
      date: today.toISOString(),
      reference: "TEST-25",
    });
    const updated = useDemoStore
      .getState()
      .invoices.find((item) => item.id === invoice.id);

    expect(payment?.amount).toBe(25);
    expect(updated?.status).toBe("partially_paid");
    expect(
      updated && invoiceBalance(updated, useDemoStore.getState().payments),
    ).toBeCloseTo(invoiceTotal(invoice) - 25, 2);
  });
});

describe("identifier generation", () => {
  test("generates the next padded matter number", () => {
    const matters = [{ id: "M-2026-0009" }, { id: "M-2025-0142" }] as Matter[];
    expect(nextMatterNumber(matters, 2027)).toBe("M-2027-0143");
  });

  test("generates the next invoice number with a configurable prefix", () => {
    const invoices = [
      { id: "INV-2026-1040" },
      { id: "INV-2025-1004" },
    ] as Invoice[];
    expect(nextInvoiceNumber(invoices, 2027, "BILL")).toBe("BILL-2027-1041");
  });
});
