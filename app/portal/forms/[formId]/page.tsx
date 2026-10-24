import type { Metadata } from "next";
import { FormDetail } from "@/components/portal/form-detail";
export const metadata: Metadata = { title: "Questionnaire" };
export default async function Page({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  return <FormDetail formId={formId} />;
}
