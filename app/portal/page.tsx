import type { Metadata } from "next";
import { PortalOverview } from "@/components/portal/overview";

export const metadata: Metadata = {
  title: "Client Portal",
  robots: { index: false },
};

export default function PortalPage() {
  return <PortalOverview />;
}
