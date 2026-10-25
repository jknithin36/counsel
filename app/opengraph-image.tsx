import { firm } from "@/lib/config/firm";
import { siteMeta } from "@/lib/content/pages";
import {
  counselOgImage,
  ogImageContentType,
  ogImageSize,
} from "@/lib/og-image";

export const alt = `${firm.name}, ${siteMeta.tagline}`;
export const size = ogImageSize;
export const contentType = ogImageContentType;

/** The default social card for every page without its own. */
export default function Image() {
  return counselOgImage(siteMeta.tagline);
}
