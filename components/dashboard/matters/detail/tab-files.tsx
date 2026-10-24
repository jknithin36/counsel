"use client";

import { Upload04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { matterDetail as copy } from "@/lib/content/dashboard-practice";
import { uploadDocument } from "@/lib/data/documents";
import { paymentMethodLabels } from "@/lib/data/labels";
import { useDemoStore } from "@/lib/data/store";
import type { Matter } from "@/lib/data/types";
import { formatDate, formatMoney } from "@/lib/format";
import { InvoiceDialog } from "../../billing/billing-dialogs";
import { InvoicesTable } from "../../billing/invoices-table";
import { DocumentsTable } from "../../documents/documents-table";
import { MessageThread } from "../../messages/message-thread";
import { SectionCard } from "../../section-card";

export function DocumentsTab({
  matter,
  onRequest,
}: {
  matter: Matter;
  /** Opens the request dialog (rendered with the page's other dialogs). */
  onRequest: () => void;
}) {
  const d = copy.documents;
  const all = useDemoStore((s) => s.documents);
  const docs = all
    .filter((doc) => doc.matterId === matter.id)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const fileInput = useRef<HTMLInputElement>(null);

  function upload(event: React.ChangeEvent<HTMLInputElement>) {
    for (const file of Array.from(event.target.files ?? [])) {
      uploadDocument(matter.id, { name: file.name, size: file.size });
      toast.add({ title: d.uploaded(file.name) });
    }
    event.target.value = "";
  }

  return (
    <SectionCard
      title={copy.tabs[3].label}
      contentClassName="px-0"
      action={
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-input"
            onClick={onRequest}
          >
            {d.request}
          </Button>
          <Button
            size="sm"
            className="h-8"
            onClick={() => fileInput.current?.click()}
          >
            <HugeiconsIcon icon={Upload04Icon} />
            {d.upload}
          </Button>
          <input
            ref={fileInput}
            type="file"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-label={d.upload}
            onChange={upload}
          />
        </div>
      }
    >
      <DocumentsTable documents={docs} />
    </SectionCard>
  );
}

export function MessagesTab({ matter }: { matter: Matter }) {
  return (
    <SectionCard title={copy.tabs[4].label}>
      <MessageThread matterId={matter.id} className="h-[620px]" />
    </SectionCard>
  );
}

export function BillingTab({ matter }: { matter: Matter }) {
  const b = copy.billing;
  const all = useDemoStore((s) => s.invoices);
  const allPayments = useDemoStore((s) => s.payments);
  const client = useDemoStore((s) =>
    s.clients.find((c) => c.id === matter.clientId),
  );
  const [createOpen, setCreateOpen] = useState(false);
  const invoices = all
    .filter((i) => i.matterId === matter.id)
    .sort((x, y) => y.issuedAt.localeCompare(x.issuedAt));
  const payments = allPayments
    .filter((p) => invoices.some((i) => i.id === p.invoiceId))
    .sort((x, y) => y.date.localeCompare(x.date));

  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      <SectionCard
        title={copy.tabs[5].label}
        className="lg:col-span-2"
        contentClassName="px-0"
        action={
          <Button size="sm" className="h-8" onClick={() => setCreateOpen(true)}>
            {b.create}
          </Button>
        }
      >
        <InvoicesTable
          invoices={invoices}
          showClient={false}
          showMatter={false}
          empty={matter.feeType === "contingency" ? b.contingency : b.empty}
        />
      </SectionCard>

      <div className="flex flex-col gap-4">
        <SectionCard title={b.trust}>
          <p className="font-serif text-[32px] leading-none tabular-nums">
            {formatMoney(client?.trustBalance ?? 0, true)}
          </p>
        </SectionCard>
        <SectionCard title={b.payments}>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{b.noPayments}</p>
          ) : (
            <ul className="flex flex-col divide-y text-sm">
              {payments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                >
                  <span>
                    {p.invoiceId}
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      {formatDate(p.date)} · {paymentMethodLabels[p.method]}
                    </span>
                  </span>
                  <span className="tabular-nums">
                    {formatMoney(p.amount, true)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <InvoiceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        clientId={matter.clientId}
        matterId={matter.id}
      />
    </div>
  );
}
