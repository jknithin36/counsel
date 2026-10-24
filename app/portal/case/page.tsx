import type { Metadata } from "next";
import { CasePage } from "@/components/portal/case-page";
export const metadata: Metadata = { title: "My Case" };
export default function Page() {
  return <CasePage />;
}
