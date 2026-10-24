import { TexturePanel } from "@/components/ui/texture-panel";
import { practiceAreasSection } from "@/lib/content/home";
import {
  type PracticeAreaSlug,
  practiceAreas,
} from "@/lib/content/practice-areas";
import { practiceAreaMockups } from "./practice-area-mockups";
import { PracticeAreasExplorer } from "./practice-areas-explorer";

export function PracticeAreas() {
  const previews = Object.fromEntries(
    practiceAreas.map(({ slug }) => {
      const Mockup = practiceAreaMockups[slug];
      return [slug, <Mockup key={slug} />];
    }),
  ) as Record<PracticeAreaSlug, React.ReactNode>;

  return (
    <section className="bg-white py-[88px] lg:py-[140px]">
      <div className="container-page">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <h2 className="max-w-[560px] text-[clamp(2.25rem,4vw,3.5rem)] text-[#111]">
              {practiceAreasSection.heading}
            </h2>
            <p className="max-w-[360px] text-[17px] leading-[1.6] text-muted-foreground">
              {practiceAreasSection.subtext}
            </p>
          </div>

          <PracticeAreasExplorer
            items={practiceAreas}
            linkLabel={practiceAreasSection.linkLabel}
            previews={previews}
            background={<TexturePanel tone="ink" />}
          />
        </div>
      </div>
    </section>
  );
}
