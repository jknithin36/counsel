import { File01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { ArrowIcon } from "@/components/site/arrow-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { TexturePanel } from "@/components/ui/texture-panel";
import { portalTeaser as t } from "@/lib/content/home";
import { cn } from "@/lib/utils";
import { MockupFrame } from "./mockup-frame";

function MessagesCard() {
  const m = t.messages;
  return (
    <MockupFrame
      label={m.label}
      className="rounded-[10px] shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
    >
      <p className="border-b border-border px-5 py-4 text-[14px] font-semibold">
        {m.title}
      </p>
      <ul className="p-2">
        {m.threads.map((thread, i) => (
          <li
            key={thread.name}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5",
              i === 0 && "bg-surface",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#111] text-[11px] font-semibold text-white">
              {thread.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[13px] font-medium">
                  {thread.name}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {thread.time}
                </span>
              </span>
              <span className="block truncate text-[12px] text-muted-foreground">
                {thread.preview}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-border px-5 py-4">
        <p className="max-w-[320px] rounded-lg rounded-tl-sm bg-surface px-3.5 py-2.5 text-[13px] leading-relaxed">
          <span className="font-medium">{m.open.author}:</span> {m.open.body}
        </p>
      </div>
    </MockupFrame>
  );
}

function SignatureCard() {
  const s = t.signature;
  return (
    <MockupFrame
      label={s.label}
      className="rounded-[10px] shadow-[0_32px_80px_rgba(0,0,0,0.35)]"
    >
      <div className="p-4 lg:p-5">
        <p className="text-[14px] font-semibold">{s.title}</p>
        <p className="mt-3 flex items-center gap-2 text-[12px]">
          <HugeiconsIcon icon={File01Icon} className="size-4 shrink-0" />
          <span className="truncate">{s.file}</span>
        </p>
        <div className="mt-3 flex flex-col gap-1.5 rounded-md bg-surface p-3">
          {["w-full", "w-11/12", "w-4/5", "w-full", "w-2/3"].map((w, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder lines
              key={i}
              className={cn("h-1.5 rounded-full bg-[#dcdcdc]", w)}
            />
          ))}
        </div>
        <p className="mt-4 border-b border-[#111] pb-1 font-serif text-[24px] leading-none italic">
          {s.signer}
        </p>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {s.signatureLabel}
        </p>
        <span className={cn(buttonVariants({ size: "sm" }), "mt-4 w-full")}>
          {s.action}
        </span>
      </div>
    </MockupFrame>
  );
}

export function PortalTeaser() {
  return (
    <section className="bg-white py-[88px] lg:py-[140px]">
      <div className="container-page">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {t.eyebrow}
            </p>
            <h2 className="mt-4 text-[clamp(2.25rem,4vw,3.5rem)] text-[#111]">
              {t.heading}
            </h2>
            <p className="mt-5 text-[18px] leading-[1.6] text-[#3a3a3a]">
              {t.body}
            </p>
            <ul className="mt-7 flex flex-col gap-3.5">
              {t.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-[16px] text-[#111]"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#111] text-white">
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      strokeWidth={2.5}
                      className="size-3"
                    />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button
                nativeButton={false}
                render={<Link href={t.primaryCta.href} />}
              >
                {t.primaryCta.label}
              </Button>
              <Link
                href={t.linkCta.href}
                className="group/arrow inline-flex items-center gap-1.5 text-[15px] font-medium underline-offset-4 hover:underline"
              >
                {t.linkCta.label} <ArrowIcon />
              </Link>
            </div>
          </div>

          <div className="relative h-[420px] overflow-hidden rounded-[10px] lg:col-span-7 lg:h-[560px]">
            <TexturePanel tone="sage" />
            <div className="absolute top-6 left-5 w-[82%] lg:top-12 lg:left-12 lg:w-[72%]">
              <MessagesCard />
            </div>
            <div className="absolute right-5 bottom-6 w-[62%] lg:right-12 lg:bottom-12 lg:w-[44%]">
              <SignatureCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
