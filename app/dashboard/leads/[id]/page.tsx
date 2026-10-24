import type { Metadata } from "next";
import { LeadDetail } from "@/components/dashboard/leads/lead-detail";

export const metadata: Metadata = { title: "Lead" };

/** Leads live in the browser store, so the page resolves the id client-side. */
export default async function Page({
  params,
}: PageProps<"/dashboard/leads/[id]">) {
  const { id } = await params;
  return <LeadDetail id={decodeURIComponent(id)} />;
}
