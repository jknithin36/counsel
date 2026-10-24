import { Call02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { FirmPhoneLink } from "@/components/site/live/firm";
import { Button } from "@/components/ui/button";
import { TexturePanel } from "@/components/ui/texture-panel";
import { hero } from "@/lib/content/home";
import { PortalMockup } from "./portal-mockup";

export function Hero() {
  return (
    <section className="bg-white pt-16 pb-12 lg:pt-[120px]">
      <div className="container-page">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
          <h1 className="text-[clamp(2.75rem,5.5vw,5.25rem)] leading-[1.02] tracking-[-0.025em] text-[#111] lg:col-span-7">
            {hero.headline.map((line) => (
              <span key={line} className="block lg:whitespace-nowrap">
                {line}
              </span>
            ))}
          </h1>

          <div className="flex flex-col gap-7 lg:col-span-5 lg:self-end">
            <p className="max-w-[440px] text-[19px] leading-[1.6] text-[#3a3a3a]">
              {hero.subtext}
            </p>
            <div className="flex max-w-[440px] flex-col items-stretch gap-4 lg:max-w-none lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href={hero.primaryCta.href} />}
                className="w-full lg:w-auto"
              >
                {hero.primaryCta.label}
              </Button>
              <FirmPhoneLink
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-[15px] font-medium underline-offset-4 hover:underline"
                prefix={`${hero.secondaryCta.label} `}
              >
                <HugeiconsIcon icon={Call02Icon} className="size-4" />
              </FirmPhoneLink>
            </div>
          </div>
        </div>

        <div className="relative mt-10 h-[340px] overflow-hidden rounded-[10px] md:h-[420px] lg:mt-16 lg:h-[640px]">
          <TexturePanel tone="charcoal" src={hero.media.texture} priority />
          <div className="absolute inset-x-5 top-5 -bottom-24 md:inset-x-12 md:top-12 lg:inset-x-20 lg:top-20">
            <PortalMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
