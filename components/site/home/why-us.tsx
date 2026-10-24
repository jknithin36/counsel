import {
  CallRinging01Icon,
  DashboardSquare01Icon,
  DollarCircleIcon,
  LanguageSkillIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { ArrowIcon } from "@/components/site/arrow-icon";
import { whyUs } from "@/lib/content/home";

const icons = {
  call: CallRinging01Icon,
  dashboard: DashboardSquare01Icon,
  fee: DollarCircleIcon,
  languages: LanguageSkillIcon,
};

export function WhyUs() {
  return (
    <section className="bg-white py-[88px] lg:py-[140px]">
      <div className="container-page">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[120px]">
              <h2 className="max-w-[440px] text-[clamp(2.25rem,4vw,3.5rem)] text-[#111]">
                {whyUs.heading}
              </h2>
              <Link
                href={whyUs.link.href}
                className="mt-6 group/arrow inline-flex items-center gap-1.5 text-[15px] font-medium underline-offset-4 hover:underline"
              >
                {whyUs.link.label} <ArrowIcon />
              </Link>
            </div>
          </div>

          <ul className="lg:col-span-7">
            {whyUs.reasons.map((reason) => (
              <li
                key={reason.title}
                className="grid grid-cols-[44px_1fr] gap-6 border-t border-border py-9"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-surface">
                  <HugeiconsIcon
                    icon={icons[reason.icon]}
                    strokeWidth={1.5}
                    className="size-[22px]"
                  />
                </span>
                <div>
                  <h3 className="text-[28px] text-[#111]">{reason.title}</h3>
                  <p className="mt-3 max-w-[520px] text-[17px] leading-[1.6] text-[#3a3a3a]">
                    {reason.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
