"use client";

import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { billingPage as copy } from "@/lib/content/dashboard-office";
import { markInvoicePaid, sendInvoice, voidInvoice } from "@/lib/data/billing";
import { invoiceStatusLabels } from "@/lib/data/labels";
import {
  invoiceBalance,
  invoiceTotal,
  OPEN_STATUSES,
} from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { Invoice, InvoiceStatus } from "@/lib/data/types";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatusBadge, type Tone } from "../status-badge";
import { TipButton } from "../tip-button";
import { Spacer, useVirtualRows } from "../use-virtual-rows";
import { PaymentDialog } from "./billing-dialogs";

export const invoiceTones: Record<InvoiceStatus, Tone> = {
  draft: "neutral",
  sent: "blue",
  partially_paid: "amber",
  paid: "green",
  overdue: "red",
  void: "neutral",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <StatusBadge
      tone={invoiceTones[status]}
      className={cn(status === "void" && "line-through")}
    >
      {invoiceStatusLabels[status]}
    </StatusBadge>
  );
}

/** Invoice rows with send / pay / void actions. */
export function InvoicesTable({
  invoices,
  showClient = true,
  showMatter = true,
  empty = copy.empty,
}: {
  invoices: Invoice[];
  showClient?: boolean;
  showMatter?: boolean;
  empty?: string;
}) {
  const c = copy.columns;
  const a = copy.actions;
  const clients = useDemoStore((s) => s.clients);
  const matters = useDemoStore((s) => s.matters);
  const payments = useDemoStore((s) => s.payments);
  const [paying, setPaying] = useState<string | undefined>();
  const [voiding, setVoiding] = useState<Invoice | null>(null);
  const virtual = useVirtualRows(invoices);
  const columnCount =
    7 + Number(Boolean(showClient)) + Number(Boolean(showMatter));

  if (invoices.length === 0)
    return <p className="px-4 py-6 text-sm text-muted-foreground">{empty}</p>;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">{c.number}</TableHead>
            {showClient && <TableHead>{c.client}</TableHead>}
            {showMatter && (
              <TableHead className="hidden lg:table-cell">{c.matter}</TableHead>
            )}
            <TableHead className="hidden sm:table-cell">{c.issued}</TableHead>
            <TableHead className="hidden md:table-cell">{c.due}</TableHead>
            <TableHead className="text-right">{c.amount}</TableHead>
            <TableHead className="text-right">{c.balance}</TableHead>
            <TableHead>{c.status}</TableHead>
            <TableHead className="w-12 pr-4">
              <span className="sr-only">{c.actions}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody ref={virtual.bodyRef}>
          <Spacer height={virtual.before} colSpan={columnCount} />
          {virtual.items.map(({ row: inv, index }) => {
            const client = clients.find((cl) => cl.id === inv.clientId);
            const matter = matters.find((m) => m.id === inv.matterId);
            const balance = invoiceBalance(inv, payments);
            const open = OPEN_STATUSES.includes(inv.status);
            return (
              <TableRow key={inv.id} data-index={index} ref={virtual.measure}>
                <TableCell className="pl-4">
                  <Link
                    href={`/dashboard/billing/invoices/${inv.id}`}
                    className="font-medium whitespace-nowrap tabular-nums underline-offset-4 hover:underline"
                  >
                    {inv.id}
                  </Link>
                </TableCell>
                {showClient && (
                  <TableCell className="whitespace-nowrap">
                    {client?.name}
                  </TableCell>
                )}
                {showMatter && (
                  <TableCell className="hidden lg:table-cell">
                    {matter && (
                      <Link
                        href={`/dashboard/matters/${matter.id}?tab=billing`}
                        className="block max-w-56 truncate text-muted-foreground underline-offset-4 hover:underline"
                      >
                        {matter.title}
                      </Link>
                    )}
                  </TableCell>
                )}
                <TableCell className="hidden whitespace-nowrap text-muted-foreground tabular-nums sm:table-cell">
                  {formatDate(inv.issuedAt)}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-muted-foreground tabular-nums md:table-cell">
                  {formatDate(inv.dueAt)}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap tabular-nums">
                  {formatMoney(invoiceTotal(inv), true)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right whitespace-nowrap tabular-nums",
                    inv.status === "overdue" && "text-[#A23B3B]",
                    balance === 0 && "text-muted-foreground",
                  )}
                >
                  {formatMoney(balance, true)}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={inv.status} />
                </TableCell>
                <TableCell className="pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <TipButton
                          variant="ghost"
                          size="icon"
                          aria-label={copy.rowActions(inv.id)}
                        />
                      }
                    >
                      <HugeiconsIcon icon={MoreHorizontalIcon} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        render={
                          <Link
                            href={`/dashboard/billing/invoices/${inv.id}`}
                          />
                        }
                      >
                        {a.view}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={inv.status !== "draft"}
                        onClick={() => {
                          sendInvoice(inv.id);
                          toast.add({ title: copy.toasts.sent(inv.id) });
                        }}
                      >
                        {a.send}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!open}
                        onClick={() => {
                          markInvoicePaid(inv.id);
                          toast.add({ title: copy.toasts.paid(inv.id) });
                        }}
                      >
                        {a.markPaid}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!open}
                        onClick={() => setPaying(inv.id)}
                      >
                        {a.record}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          toast.add({ title: copy.toasts.download })
                        }
                      >
                        {a.download}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={
                          inv.status === "paid" || inv.status === "void"
                        }
                        onClick={() => setVoiding(inv)}
                      >
                        {a.void}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
          <Spacer height={virtual.after} colSpan={columnCount} />
        </TableBody>
      </Table>

      <PaymentDialog
        open={Boolean(paying)}
        onOpenChange={(open) => !open && setPaying(undefined)}
        invoiceId={paying}
      />
      <AlertDialog
        open={Boolean(voiding)}
        onOpenChange={(open) => !open && setVoiding(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.voidDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {copy.voidDialog.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">
              {copy.voidDialog.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              variant="destructive"
              onClick={() => {
                if (voiding) {
                  voidInvoice(voiding.id);
                  toast.add({ title: copy.toasts.voided(voiding.id) });
                }
                setVoiding(null);
              }}
            >
              {copy.voidDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
