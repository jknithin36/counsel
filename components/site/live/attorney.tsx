"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { type Attorney, attorneyInitials } from "@/lib/content/attorneys";
import { attorneysPage } from "@/lib/content/pages";
import { useAttorney, usePracticeAreas } from "@/lib/site-content";
import { cn } from "@/lib/utils";

/*
 * Attorney cards and portraits that reflect Dashboard › Content edits.
 * `background` is the server-rendered texture (it reads the filesystem),
 * shown when there's no portrait.
 */

/** The attorney with any saved edits applied. */
export function useLiveAttorney(attorney: Attorney): Attorney {
  return useAttorney(attorney.slug) ?? attorney;
}

/** Uploaded (data:/blob:) images come from the dashboard. */
const isUpload = (src?: string) => Boolean(src && /^(data|blob):/.test(src));

export function LivePortrait({
  attorney,
  background,
  hasPublicImage = false,
  sizes,
  initialsClassName = "text-[64px]",
  priority,
  alt = "",
}: {
  attorney: Attorney;
  background: ReactNode;
  /** The static image path exists under /public. */
  hasPublicImage?: boolean;
  sizes?: string;
  initialsClassName?: string;
  priority?: boolean;
  alt?: string;
}) {
  const live = useLiveAttorney(attorney);
  if (isUpload(live.image)) {
    return (
      // biome-ignore lint/performance/noImgElement: uploaded data URLs can't go through next/image
      <img
        src={live.image}
        alt={alt}
        className="absolute inset-0 size-full object-cover"
      />
    );
  }
  if (live.image && live.image === attorney.image && hasPublicImage) {
    return (
      <Image
        src={live.image}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    );
  }
  return (
    <>
      {background}
      <span
        aria-hidden="true"
        className={cn(
          "relative font-serif leading-none tracking-[-0.02em] text-white",
          initialsClassName,
        )}
      >
        {attorneyInitials(live.name)}
      </span>
    </>
  );
}

export function LiveAttorneyCard({
  attorney,
  background,
  hasPublicImage,
  areas = "primary",
  priority,
}: {
  attorney: Attorney;
  background: ReactNode;
  hasPublicImage?: boolean;
  areas?: "primary" | "all";
  priority?: boolean;
}) {
  const live = useLiveAttorney(attorney);
  const allAreas = usePracticeAreas();
  const titleOf = (slug: string) =>
    allAreas.find((a) => a.slug === slug)?.title;
  const areaText =
    areas === "all"
      ? live.practiceAreas.map(titleOf).filter(Boolean).join(", ")
      : titleOf(live.practiceAreas[0]);

  return (
    <Link
      href={`/attorneys/${live.slug}`}
      className="group block rounded-[10px]"
    >
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[10px]">
        <LivePortrait
          attorney={attorney}
          background={background}
          hasPublicImage={hasPublicImage}
          priority={priority}
          sizes="(min-width: 1024px) 280px, (min-width: 768px) 50vw, 80vw"
        />
      </div>
      <p className="mt-5 flex items-center gap-1.5 font-serif text-[24px] leading-tight tracking-[-0.02em] text-[#111]">
        <span className="underline-offset-4 group-hover:underline group-focus-visible:underline">
          {live.name}
        </span>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          strokeWidth={1.75}
          className="size-5 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </p>
      <p className="mt-1.5 text-[14px] text-muted-foreground">
        {live.title}
        {areaText && ` · ${areaText}`}
      </p>
      {live.languages.length > 1 && (
        <p className="mt-1 text-[13px] text-muted-foreground">
          {attorneysPage.languagesPrefix} {live.languages.join(", ")}
        </p>
      )}
    </Link>
  );
}

/** Text that follows edits, e.g. an attorney's name in a byline. */
export function LiveAttorneyName({ attorney }: { attorney: Attorney }) {
  return <>{useLiveAttorney(attorney).name}</>;
}
