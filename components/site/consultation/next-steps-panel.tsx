import { LockIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FirmPhoneLink } from "@/components/site/live/firm";
import { TexturePanel } from "@/components/ui/texture-panel";
import { consultation as c } from "@/lib/content/consultation";

/** Sage reassurance panel: what happens after the form, plus the phone. */
export function NextStepsPanel() {
  return (
    <div className="relative overflow-hidden rounded-[10px] p-7 text-white lg:p-10">
      <TexturePanel tone="sage" sizes="(min-width: 1024px) 480px, 100vw" />
      {/* Darken the light sage slightly so white text stays readable. */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/25" />
      <div className="relative">
        <h2 className="text-[26px] lg:text-[32px]">{c.panel.title}</h2>
        <ol className="mt-6 flex flex-col gap-4">
          {c.panel.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-4 text-[16px]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/60 text-[13px] font-semibold">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-8 flex items-center gap-2 border-t border-white/25 pt-6 text-[14px] text-white/90">
          <HugeiconsIcon icon={LockIcon} className="size-4 shrink-0" />
          {c.panel.confidential}
        </p>
        <FirmPhoneLink
          className="mt-3 inline-block text-[15px] font-medium underline underline-offset-4"
          hideNumber
        >
          {c.panel.call}
        </FirmPhoneLink>
      </div>
    </div>
  );
}
