import { getPracticeArea } from "@/lib/content/practice-areas";
import type { CaseResult } from "@/lib/content/results";

/** Light case result card for inner pages. */
export function ResultCard({ result }: { result: CaseResult }) {
  return (
    <article className="flex h-full flex-col rounded-[10px] border border-border p-7">
      <p className="text-[13px] text-muted-foreground">
        {getPracticeArea(result.area)?.title}
      </p>
      <p className="mt-3 font-serif text-[40px] leading-none tracking-[-0.02em] text-[#111]">
        {result.amount}
      </p>
      <span className="mt-4 self-start rounded-full border border-border px-2.5 py-1 text-[12px] leading-none text-muted-foreground">
        {result.type}
      </span>
      <p className="mt-4 text-[15px] leading-[1.6] text-[#3a3a3a]">
        {result.summary}
      </p>
    </article>
  );
}
