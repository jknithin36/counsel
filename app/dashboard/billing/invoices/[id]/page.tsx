import type { Metadata } from "next";
import { InvoiceDetail } from "@/components/dashboard/billing/invoice-detail";

export const metadata: Metadata = { title: "Invoice" };

/** Invoices live in the browser store, so the page resolves the id client-side. */
export default async function Page({
  params,
}: PageProps<"/dashboard/billing/invoices/[id]">) {
  const { id } = await params;
  return <InvoiceDetail id={decodeURIComponent(id)} />;
}
