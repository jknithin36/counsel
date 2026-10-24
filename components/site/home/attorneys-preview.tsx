import Link from "next/link";
import { AttorneyTexture } from "@/components/site/attorney-card";
import { Button } from "@/components/ui/button";
import { attorneysSection as s } from "@/lib/content/home";
import { FeaturedAttorneys } from "./featured-attorneys";

export function AttorneysPreview() {
  return (
    <section className="bg-white py-[88px] lg:py-[140px]">
      <div className="container-page">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] text-[#111]">
              {s.heading}
            </h2>
            <div className="flex flex-col items-start gap-6 lg:items-end">
              <p className="text-[17px] leading-[1.6] text-muted-foreground">
                {s.subtext}
              </p>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href={s.cta.href} />}
              >
                {s.cta.label}
              </Button>
            </div>
          </div>
          <FeaturedAttorneys background={<AttorneyTexture />} />
        </div>
      </div>
    </section>
  );
}
