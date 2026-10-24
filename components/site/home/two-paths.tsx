import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TexturePanel } from "@/components/ui/texture-panel";
import { twoPaths } from "@/lib/content/home";
import { DocumentsMockup, MatterMockup } from "./path-mockups";

const mockups = {
  individuals: DocumentsMockup,
  business: MatterMockup,
};

export function TwoPaths() {
  return (
    <section className="bg-white pb-[88px] lg:pb-[140px]">
      <div className="container-page">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center">
            <h2 className="text-[clamp(2.25rem,4.5vw,4rem)] text-[#111]">
              {twoPaths.heading}
            </h2>
            <p className="mx-auto mt-5 max-w-[640px] text-[18px] leading-[1.6] text-[#3a3a3a]">
              {twoPaths.subtext}
            </p>
          </div>

          <div className="mt-[72px] grid gap-6 lg:grid-cols-2">
            {twoPaths.cards.map((card) => {
              const Mockup = mockups[card.key as keyof typeof mockups];
              return (
                <div key={card.key}>
                  <article className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[10px] lg:h-[640px]">
                    <TexturePanel tone={card.tone} />

                    <div className="relative p-8 lg:p-12">
                      <h3 className="text-[34px] text-white lg:text-[44px]">
                        {card.title}
                      </h3>
                      <p className="mt-5 max-w-[420px] text-[18px] leading-[1.6] text-white/85">
                        {card.body}
                      </p>
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link href={card.cta.href} />}
                        className="mt-7 border-white text-white hover:bg-white/10"
                      >
                        {card.cta.label}
                      </Button>
                    </div>

                    {/* Peeks out of the lower right; the card clips it. */}
                    <div className="relative mt-auto h-[220px] lg:h-[250px]">
                      <div className="absolute top-0 -right-6 -bottom-40 left-8 lg:-right-12 lg:left-16">
                        <Mockup />
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
