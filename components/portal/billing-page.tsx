"use client";

import { useState } from "react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { recordPayment } from "@/lib/data/billing";
import { invoiceBalance, invoiceTotal } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { Invoice } from "@/lib/data/types";
import { formatDate, formatMoney } from "@/lib/format";
import { CLIENT_ID, PortalPage } from "./shared";

const paymentSchema = z.object({
  name: z.string().min(3),
  card: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(z.string().length(16)),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/),
  cvc: z.string().regex(/^\d{3,4}$/),
});

function InvoiceView({ invoice }: { invoice: Invoice }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>View</SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{invoice.id}</SheetTitle>
          <SheetDescription>
            Issued {formatDate(invoice.issuedAt)} · Due{" "}
            {formatDate(invoice.dueAt)}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 p-4">
          <div>
            <p className="font-serif text-2xl">Calloway &amp; Reyes</p>
            <p className="text-muted-foreground">Invoice for Maria Delgado</p>
          </div>
          <div className="divide-y rounded-lg border">
            {invoice.lineItems.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 p-4">
                <span>{item.description}</span>
                <span>{formatMoney(item.quantity * item.rate, true)}</span>
              </div>
            ))}
            <div className="flex justify-between p-4 font-medium">
              <span>Total</span>
              <span>{formatMoney(invoiceTotal(invoice), true)}</span>
            </div>
          </div>
          {invoice.notes && (
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PayDialog({ invoice }: { invoice: Invoice }) {
  const payments = useDemoStore((s) => s.payments);
  const balance = invoiceBalance(invoice, payments);
  const [paymentAmount] = useState(balance);
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fields, setFields] = useState({
    name: "Maria Delgado",
    card: "",
    expiry: "",
    cvc: "",
  });
  const [error, setError] = useState("");
  const pay = () => {
    const result = paymentSchema.safeParse(fields);
    if (!result.success) {
      setError(
        "Check the card name, 16-digit number, expiry (MM/YY), and CVC.",
      );
      return;
    }
    setError("");
    setProcessing(true);
    setTimeout(() => {
      const payment = recordPayment({
        invoiceId: invoice.id,
        amount: paymentAmount,
        method: "card",
        date: new Date().toISOString(),
        reference: `Card ending ${result.data.card.slice(-4)}`,
      });
      setProcessing(false);
      if (payment) {
        setSuccess(true);
        toast.add({
          title: "Payment complete",
          description: `${formatMoney(paymentAmount, true)} paid on ${invoice.id}.`,
          type: "success",
        });
      }
    }, 1200);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setTimeout(() => setSuccess(false), 200);
      }}
    >
      {paymentAmount > 0 && (
        <DialogTrigger render={<Button />}>Pay now</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle>Payment received</DialogTitle>
              <DialogDescription>
                This demo payment did not make a real charge.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg bg-muted p-5 text-center">
              <p className="text-3xl">✓</p>
              <p className="mt-2 text-2xl font-medium">
                {formatMoney(paymentAmount, true)}
              </p>
              <p className="text-muted-foreground">Receipt for {invoice.id}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => window.print()}>
                Print receipt
              </Button>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pay {formatMoney(paymentAmount, true)}</DialogTitle>
              <DialogDescription>
                Demo payment, no real charge. Use 4242 4242 4242 4242.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor={`card-name-${invoice.id}`}>Name on card</Label>
                <Input
                  id={`card-name-${invoice.id}`}
                  value={fields.name}
                  onChange={(event) =>
                    setFields({ ...fields, name: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`card-number-${invoice.id}`}>Card number</Label>
                <Input
                  id={`card-number-${invoice.id}`}
                  inputMode="numeric"
                  value={fields.card}
                  onChange={(event) => {
                    const digits = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 16);
                    setFields({
                      ...fields,
                      card: digits.replace(/(.{4})/g, "$1 ").trim(),
                    });
                  }}
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor={`expiry-${invoice.id}`}>Expiry</Label>
                  <Input
                    id={`expiry-${invoice.id}`}
                    value={fields.expiry}
                    onChange={(event) =>
                      setFields({
                        ...fields,
                        expiry: event.target.value.slice(0, 5),
                      })
                    }
                    placeholder="12/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`cvc-${invoice.id}`}>CVC</Label>
                  <Input
                    id={`cvc-${invoice.id}`}
                    inputMode="numeric"
                    value={fields.cvc}
                    onChange={(event) =>
                      setFields({
                        ...fields,
                        cvc: event.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    placeholder="123"
                  />
                </div>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={pay} disabled={processing}>
                {processing
                  ? "Processing…"
                  : `Pay ${formatMoney(paymentAmount, true)}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function BillingPage() {
  const allInvoices = useDemoStore((s) => s.invoices);
  const allPayments = useDemoStore((s) => s.payments);
  const invoices = allInvoices.filter(
    (invoice) => invoice.clientId === CLIENT_ID,
  );
  const payments = allPayments.filter(
    (payment) => payment.clientId === CLIENT_ID,
  );
  const client = useDemoStore((s) =>
    s.clients.find((item) => item.id === CLIENT_ID),
  );
  const due = invoices.reduce(
    (sum, invoice) => sum + invoiceBalance(invoice, payments),
    0,
  );
  const nextDue = invoices
    .filter((invoice) => invoiceBalance(invoice, payments) > 0)
    .toSorted((a, b) => a.dueAt.localeCompare(b.dueAt))[0];
  return (
    <PortalPage
      title="Billing"
      description="Invoices, payments, and case expenses in one place."
    >
      <Card>
        <CardHeader>
          <CardDescription>Balance due</CardDescription>
          <CardTitle className="text-4xl">{formatMoney(due, true)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {due
              ? `Next due date: ${formatDate(nextDue.dueAt)}`
              : "You don't owe anything right now."}
          </p>
          <p className="mt-2 text-muted-foreground">
            Contingency: your attorney fee is paid from the settlement if we
            win. Case expenses may be billed separately.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {invoices.length ? (
            invoices
              .toSorted((a, b) => b.issuedAt.localeCompare(a.issuedAt))
              .map((invoice) => {
                return (
                  <div
                    key={invoice.id}
                    className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_120px_120px_auto] md:items-center"
                  >
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invoice.issuedAt)}
                      </p>
                    </div>
                    <span>{formatMoney(invoiceTotal(invoice), true)}</span>
                    <Badge variant="secondary">
                      {invoice.status.replace("_", " ")}
                    </Badge>
                    <div className="flex gap-2">
                      <InvoiceView invoice={invoice} />
                      <PayDialog invoice={invoice} />
                    </div>
                  </div>
                );
              })
          ) : (
            <p className="text-muted-foreground">No invoices yet.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
          <CardDescription>
            Trust balance: {formatMoney(client?.trustBalance ?? 0, true)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length ? (
            <div className="divide-y">
              {payments
                .toSorted((a, b) => b.date.localeCompare(a.date))
                .map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div>
                      <p>{payment.invoiceId}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.date)} · {payment.reference}
                      </p>
                    </div>
                    <span className="font-medium">
                      {formatMoney(payment.amount, true)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No payments recorded.</p>
          )}
        </CardContent>
      </Card>
    </PortalPage>
  );
}
