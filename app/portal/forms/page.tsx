import type { Metadata } from "next";
import { FormsPage } from "@/components/portal/forms-page";
export const metadata: Metadata = { title: "Forms" };
export default function Page() {
  return <FormsPage />;
}
