import type { Metadata } from "next";
import { AppointmentsPage } from "@/components/portal/appointments-page";
export const metadata: Metadata = { title: "Appointments" };
export default function Page() {
  return <AppointmentsPage />;
}
