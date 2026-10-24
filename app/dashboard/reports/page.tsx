import type { Metadata } from "next";
import { ReportsPage } from "@/components/dashboard/reports/reports-page";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ReportsPage />;
}
