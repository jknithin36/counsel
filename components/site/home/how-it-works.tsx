import Link from "next/link";
import { Button } from "@/components/ui/button";
import { howItWorks } from "@/lib/content/home";

export function HowItWorks() {
  return (
    <section className="bg-surface py-[88px] lg:py-[140px]">
      <div className="container-page">
        <div className="mx-auto max-w-[1200px]">
          <div>
            <h2 className="text-center text-[clamp(2.25rem,4vw,3.5rem)] text-[#111]">
              {howItWorks.heading}
            </h2>
          </div>

          {/* No column gap, so the top borders read as one continuous line. */}
          <div className="relative mt-[72px]">
            <ol className="grid gap-10 md:grid-cols-3 md:gap-0">
              {howItWorks.steps.map((step) => (
                <li
                  key={step.number}
                  className="border-t border-[#dadada] pt-7 md:pr-10"
                >
                  <p className="text-[13px] font-semibold text-muted-foreground">
                    {step.number}
                  </p>
                  <h3 className="mt-5 text-[30px] text-[#111]">{step.title}</h3>
                  <p className="mt-3 max-w-[320px] text-[17px] leading-[1.6] text-[#3a3a3a]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-16 flex justify-center">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href={howItWorks.cta.href} />}
            >
              {howItWorks.cta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
