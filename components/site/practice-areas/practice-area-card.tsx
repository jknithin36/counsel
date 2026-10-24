import Link from "next/link";
import { ArrowIcon } from "@/components/site/arrow-icon";
import { TexturePanel, type TextureTone } from "@/components/ui/texture-panel";
import { common } from "@/lib/content/pages";
import type { PracticeArea } from "@/lib/content/practice-areas";
import { AreaText } from "./area-live";

export function PracticeAreaCard({
  area,
  tone,
  priority,
}: {
  area: PracticeArea;
  tone: TextureTone;
  priority?: boolean;
}) {
  return (
    <Link href={area.href} className="group/arrow block rounded-[10px]">
      <div className="relative aspect-video overflow-hidden rounded-[10px]">
        <TexturePanel
          tone={tone}
          sizes="(min-width: 1024px) 600px, 100vw"
          priority={priority}
        />
        <h2 className="absolute bottom-6 left-6 text-[30px] text-white lg:bottom-8 lg:left-8 lg:text-[36px]">
          <AreaText fallback={area} field="title" />
        </h2>
      </div>
      <p className="mt-6 text-[17px] leading-[1.6] text-[#3a3a3a]">
        <AreaText fallback={area} field="summary" />
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {area.commonCases.slice(0, 3).map((item) => (
          <li
            key={item.title}
            className="rounded-full border border-border px-3 py-1 text-[13px] text-[#3a3a3a]"
          >
            {item.title}
          </li>
        ))}
      </ul>
      <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium underline-offset-4 group-hover/arrow:underline">
        {common.learnMore} <ArrowIcon />
      </span>
    </Link>
  );
}
