import Link from "next/link";
import { FirmPhoneLink } from "@/components/site/live/firm";
import { Button } from "@/components/ui/button";
import { closingCta } from "@/lib/content/home";

export function ClosingCta() {
  return (
    <section data-nav-theme="dark" className="bg-ink pt-[120px] text-white">
      <div className="container-page">
        <div className="flex flex-col gap-10 border-b border-white/12 pb-20 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-[760px] text-[clamp(2.25rem,4.5vw,4rem)]">
            {closingCta.headline}
          </h2>
          <div className="flex shrink-0 flex-col items-start gap-4 lg:items-center">
            <Button
              variant="inverse"
              size="lg"
              nativeButton={false}
              render={<Link href={closingCta.cta.href} />}
            >
              {closingCta.cta.label}
            </Button>
            <FirmPhoneLink
              className="text-[15px] text-white/70 underline-offset-4 transition-colors duration-150 hover:text-white hover:underline"
              prefix={`${closingCta.callPrefix} `}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
