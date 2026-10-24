import { CountUp } from "@/components/site/motion/count-up";
import { trustStrip } from "@/lib/content/home";
import { cn } from "@/lib/utils";

export function TrustStrip() {
  const last = trustStrip.items.length - 1;

  return (
    <section className="bg-white py-[88px] lg:py-[140px]">
      <div className="container-page">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mx-auto max-w-[900px] text-balance text-center text-[clamp(2.25rem,4vw,3.5rem)] text-[#111]">
            {trustStrip.heading}
          </h2>

          {/* 1px gaps over a border-colored background draw the dividers. */}
          <dl className="mt-[72px] grid grid-cols-2 gap-px bg-border md:grid-cols-6 lg:grid-cols-5">
            {trustStrip.items.map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  "flex flex-col items-center bg-white px-4 py-7 text-center lg:py-4",
                  i < 3 ? "md:col-span-2" : "md:col-span-3",
                  "lg:col-span-1",
                  i === last && "col-span-2",
                )}
              >
                <dt className="order-2 mt-2 text-[14px] leading-snug text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="order-1 font-serif text-[44px] leading-none tracking-[-0.02em] text-[#111]">
                  <CountUp value={item.value} />
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-12 text-center text-[12px] text-[#8a8a8a]">
            {trustStrip.footnote}
          </p>
        </div>
      </div>
    </section>
  );
}
