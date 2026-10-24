import type { Metadata } from "next";
import { PipelineBoard } from "@/components/dashboard/pipeline/pipeline-board";

export const metadata: Metadata = { title: "Pipeline" };

export default function Page() {
  return <PipelineBoard />;
}
