import Link from "next/link";
import { FirmPhoneLink } from "@/components/site/live/firm";
import { Button } from "@/components/ui/button";
import { TexturePanel } from "@/components/ui/texture-panel";
import { common, ctaBand } from "@/lib/content/pages";

/** Consultation band for the bottom of inner pages. */
export function CtaBand({
  area,
  href = "/consultation",
}: {
  /** Practice area name for the heading, e.g. "Family Law". */
  area?: string;
  href?: string;
}) {
  return (
    <section className="bg-white pb-[88px] lg:pb-[140px]">
      <div className="container-page">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[10px] px-7 py-10 lg:p-14">
          <TexturePanel tone="charcoal" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="max-w-[560px] text-[32px] text-white lg:text-[40px]">
              {ctaBand.heading(area)}
            </h2>
            <div className="flex shrink-0 flex-col items-start gap-3 lg:items-center">
              <Button
                variant="inverse"
                size="lg"
                nativeButton={false}
                render={<Link href={href} />}
              >
                {common.bookConsultation}
              </Button>
              <FirmPhoneLink
                className="text-[15px] text-white underline-offset-4 hover:underline"
                prefix={`${common.orCallLower} `}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
