"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/auth/session";
import { invoiceBalance } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";

/** The signed-in client with their matter and client record. */
export function usePortal() {
  const { user } = useSession();
  const matter = useDemoStore((s) =>
    s.matters.find((m) => m.id === user?.matterId),
  );
  const client = useDemoStore((s) =>
    s.clients.find((c) => c.id === matter?.clientId),
  );
  return {
    user,
    matter,
    client,
    firstName: user?.name.split(" ")[0] ?? "",
  };
}

/** What the client still needs to do, for the sidebar and overview. */
export function usePortalTasks() {
  const { user, matter, client } = usePortal();
  const documents = useDemoStore((s) => s.documents);
  const threads = useDemoStore((s) => s.threads);
  const forms = useDemoStore((s) => s.portalForms);
  const invoices = useDemoStore((s) => s.invoices);
  const payments = useDemoStore((s) => s.payments);

  return useMemo(() => {
    const mine = documents.filter((d) => d.matterId === matter?.id);
    const open = invoices
      .filter((i) => i.clientId === client?.id)
      .map((invoice) => ({
        invoice,
        balance: invoiceBalance(invoice, payments),
      }))
      .filter((i) => i.balance > 0)
      .sort((a, b) => a.invoice.dueAt.localeCompare(b.invoice.dueAt));
    const toSign = mine.filter((d) => d.status === "sent_for_signature");
    const toUpload = mine.filter((d) => d.status === "requested");
    const toFill = forms.filter(
      (f) => f.matterId === matter?.id && f.status !== "submitted",
    );
    const unread =
      threads
        .find((t) => t.matterId === matter?.id)
        ?.messages.filter(
          (m) => m.authorId !== user?.id && !m.internal && !m.read,
        ).length ?? 0;
    return {
      toSign,
      toUpload,
      toFill,
      unread,
      balance: open.reduce((s, i) => s + i.balance, 0),
      nextDue: open[0]?.invoice,
      counts: {
        documents: toSign.length + toUpload.length,
        messages: unread,
        forms: toFill.length,
      },
    };
  }, [documents, threads, forms, invoices, payments, matter, client, user]);
}
