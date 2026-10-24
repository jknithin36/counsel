import { TexturePanel } from "@/components/ui/texture-panel";
import type { Attorney } from "@/lib/content/attorneys";
import { publicFileExists } from "@/lib/public-file";
import { LiveAttorneyCard, LivePortrait } from "./live/attorney";

/*
 * Server wrappers: they render the texture and check for a portrait file,
 * then hand off to the live client components so dashboard edits show.
 */

/** Portrait image, or a sage texture with the attorney's initials. */
export function Portrait({
  attorney,
  sizes = "(min-width: 1024px) 280px, (min-width: 768px) 50vw, 80vw",
  initialsClassName = "text-[64px]",
  priority,
  alt = "",
}: {
  attorney: Attorney;
  /** Empty in cards, where the name is already shown as text. */
  alt?: string;
  sizes?: string;
  initialsClassName?: string;
  priority?: boolean;
}) {
  return (
    <LivePortrait
      attorney={attorney}
      background={
        <TexturePanel tone="sage" sizes={sizes} priority={priority} />
      }
      hasPublicImage={Boolean(
        attorney.image && publicFileExists(attorney.image),
      )}
      sizes={sizes}
      initialsClassName={initialsClassName}
      priority={priority}
      alt={alt}
    />
  );
}

export function AttorneyAvatar({ attorney }: { attorney: Attorney }) {
  return (
    <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full">
      <Portrait
        attorney={attorney}
        sizes="44px"
        initialsClassName="text-[15px] text-white"
      />
    </span>
  );
}

/** Card linking to an attorney profile. `areas="all"` lists every practice. */
export function AttorneyCard({
  attorney,
  areas = "primary",
  priority,
}: {
  attorney: Attorney;
  areas?: "primary" | "all";
  priority?: boolean;
}) {
  return (
    <LiveAttorneyCard
      attorney={attorney}
      areas={areas}
      priority={priority}
      background={<TexturePanel tone="sage" priority={priority} />}
      hasPublicImage={Boolean(
        attorney.image && publicFileExists(attorney.image),
      )}
    />
  );
}

/** The shared texture for client-built attorney lists. */
export function AttorneyTexture() {
  return <TexturePanel tone="sage" />;
}
