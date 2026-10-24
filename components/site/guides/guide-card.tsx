import Link from "next/link";
import { ArrowIcon } from "@/components/site/arrow-icon";
import { TexturePanel, type TextureTone } from "@/components/ui/texture-panel";
import type { Guide } from "@/lib/content/guides";
import { formatDate, resourcesPage } from "@/lib/content/pages";
import { getPracticeArea } from "@/lib/content/practice-areas";
import { cn } from "@/lib/utils";

const areaTone: Record<string, TextureTone> = {
  "personal-injury": "charcoal",
  "family-law": "sage",
  "estate-planning": "olive",
  "business-law": "ink",
  "criminal-defense": "charcoal",
};

/** Guide card; `featured` is the large horizontal version. */
export function GuideCard({
  guide,
  featured,
}: {
  guide: Guide;
  featured?: boolean;
}) {
  const area = getPracticeArea(guide.practiceArea);
  const Heading = featured ? "h2" : "h3";

  return (
    <Link
      href={`/resources/${guide.slug}`}
      className={cn(
        "group/arrow block rounded-[10px]",
        featured && "grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12",
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden rounded-[10px]",
          featured && "lg:col-span-7",
        )}
      >
        <TexturePanel
          tone={areaTone[guide.practiceArea] ?? "charcoal"}
          sizes={
            featured
              ? "(min-width: 1024px) 700px, 100vw"
              : "(min-width: 1024px) 380px, 100vw"
          }
        />
      </div>
      <div className={cn(!featured && "mt-6", featured && "lg:col-span-5")}>
        <p className="text-[13px] text-muted-foreground">
          {area?.title} · {guide.readTime}
        </p>
        <Heading
          className={cn(
            "mt-3 text-[#111] underline-offset-4 group-hover/arrow:underline",
            featured
              ? "text-[clamp(2rem,3.5vw,2.75rem)]"
              : "text-[24px] leading-tight",
          )}
        >
          {guide.title}
        </Heading>
        <p className="mt-3 text-[16px] leading-[1.6] text-[#3a3a3a]">
          {guide.excerpt}
        </p>
        {featured ? (
          <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium">
            {resourcesPage.read} <ArrowIcon />
          </span>
        ) : (
          <p className="mt-4 text-[13px] text-muted-foreground">
            {formatDate(guide.publishedAt)}
          </p>
        )}
      </div>
    </Link>
  );
}
