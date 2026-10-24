import type { Metadata } from "next";
import { ConflictsPage } from "@/components/dashboard/conflicts/conflicts-page";

export const metadata: Metadata = { title: "Conflict Check" };

export default function Page() {
  return <ConflictsPage />;
}
