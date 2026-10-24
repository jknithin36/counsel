import type { Metadata } from "next";
import { SignPage } from "@/components/portal/sign-page";
export const metadata: Metadata = { title: "Review and sign" };
export default async function Page({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = await params;
  return <SignPage docId={docId} />;
}
