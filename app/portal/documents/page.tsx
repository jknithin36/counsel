import type { Metadata } from "next";
import { DocumentsPage } from "@/components/portal/documents-page";
export const metadata: Metadata = { title: "Documents" };
export default function Page() {
  return <DocumentsPage />;
}
