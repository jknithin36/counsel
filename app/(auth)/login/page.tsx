import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginPanel } from "@/components/auth/login-panel";
import { FirmText } from "@/components/site/live/firm";
import { TexturePanel } from "@/components/ui/texture-panel";
import { auth } from "@/lib/content/auth";
import { portalPreview } from "@/lib/content/home";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: auth.metaTitle,
  robots: { index: false },
};

/** A small case-timeline card, built from the hero portal preview data. */
function TimelineCard() {
  const { timeline, title } = portalPreview;
  return (
    <div
      role="img"
      aria-label={auth.panel.cardLabel}
      className="w-[340px] motion-safe:animate-[float_6s_ease-in-out_infinite]"
    >
      <div
        aria-hidden="true"
        className="rounded-[10px] bg-white p-6 text-left text-[#111] shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
      >
        <p className="text-[12px] text-muted-foreground">{timeline.title}</p>
        <p className="mt-1 font-serif text-[22px] leading-tight">{title}</p>
        <ol className="mt-5 flex flex-col">
          {timeline.steps.map((step, i) => (
            <li
              key={step.label}
              className="relative flex gap-3 pb-3.5 last:pb-0"
            >
              {i < timeline.steps.length - 1 && (
                <span
                  className={cn(
                    "absolute top-3.5 left-[5px] h-full w-px",
                    step.state === "done" ? "bg-[#111]" : "bg-border",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative mt-1 flex size-[11px] shrink-0 items-center justify-center rounded-full",
                  step.state === "done" && "bg-[#111]",
                  step.state === "current" &&
                    "border-2 border-[#111] bg-white after:size-[3px] after:rounded-full after:bg-[#111]",
                  step.state === "upcoming" &&
                    "border border-[#c4c4c4] bg-white",
                )}
              />
              <span
                className={cn(
                  "flex flex-1 items-baseline justify-between gap-2 text-[13px]",
                  step.state === "current" && "font-medium",
                  step.state === "upcoming" && "text-muted-foreground",
                )}
              >
                {step.label}
                <span className="text-[12px] text-muted-foreground">
                  {step.meta}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col px-5 py-8 lg:px-12">
        <Link
          href="/"
          className="self-start whitespace-nowrap font-serif text-[26px] leading-none tracking-[-0.02em] text-[#111]"
        >
          <FirmText field="name" />
        </Link>
        <div className="flex flex-1 items-center justify-center py-12">
          <Suspense
            fallback={<div className="min-h-[640px] w-full max-w-[400px]" />}
          >
            <LoginPanel />
          </Suspense>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <TexturePanel tone="charcoal" sizes="50vw" priority />
        <div className="relative flex h-full flex-col items-center justify-center gap-14 px-12 text-center">
          <p className="max-w-[460px] font-serif text-[40px] leading-[1.15] tracking-[-0.02em] text-white">
            {auth.panel.message}
          </p>
          <TimelineCard />
        </div>
      </div>
    </div>
  );
}
