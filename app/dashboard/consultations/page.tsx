import type { Metadata } from "next";
import { ConsultationsPage } from "@/components/dashboard/consultations/consultations-page";

export const metadata: Metadata = { title: "Consultations" };

export default function Page() {
  return <ConsultationsPage />;
}
