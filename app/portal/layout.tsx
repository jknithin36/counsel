import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/shell";

export const metadata: Metadata = {
  title: { default: "Client Portal", template: "%s | Counsel" },
  robots: { index: false },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell>{children}</PortalShell>;
}
