"use client";

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { consultation as c } from "@/lib/content/consultation";
import { useDemoStore } from "@/lib/data/store";
import { useSettings } from "@/lib/site-content";

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function ThankYou() {
  const { thankYouMessage } = useSettings("intake");
  const ref = useSearchParams().get("ref") ?? "";
  const lead = useDemoStore((state) => state.leads.find((l) => l.id === ref));
  const t = c.thankYou;

  return (
    <div className="mx-auto max-w-[720px]">
      <HugeiconsIcon
        icon={CheckmarkCircle02Icon}
        strokeWidth={1.5}
        className="size-12 text-[#1f7a45]"
      />
      <h1 className="mt-6 text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.02] tracking-[-0.025em] text-[#111]">
        {t.title(lead?.firstName)}
      </h1>
      <p className="mt-6 text-[19px] leading-[1.6] text-[#3a3a3a]">
        {thankYouMessage}
      </p>

      {ref && (
        <div className="mt-8 inline-flex flex-col rounded-[10px] border border-border px-6 py-4">
          <span className="text-[13px] text-muted-foreground">
            {t.reference}
          </span>
          <span className="mt-1 font-serif text-[28px] tracking-[-0.02em] text-[#111]">
            {ref}
          </span>
        </div>
      )}

      <h2 className="mt-12 text-[28px] text-[#111]">{t.nextSteps}</h2>
      <ol className="mt-5 flex flex-col gap-3">
        {c.panel.steps.map((step, i) => (
          <li
            key={step}
            className="flex items-start gap-4 text-[17px] text-[#3a3a3a]"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#111] text-[13px] font-semibold text-[#111]">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button nativeButton={false} render={<Link href="/" />}>
          {t.home}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/practice-areas" />}
        >
          {t.explore}
        </Button>
      </div>

      {demoMode && (
        <p className="mt-10 rounded-[10px] bg-surface px-5 py-4 text-[14px] text-[#3a3a3a]">
          {t.demoNote}
        </p>
      )}
    </div>
  );
}
