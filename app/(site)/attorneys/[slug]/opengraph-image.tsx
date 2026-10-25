import { firm } from "@/lib/config/firm";
import { getAttorney } from "@/lib/content/attorneys";
import {
  counselOgImage,
  ogImageContentType,
  ogImageSize,
} from "@/lib/og-image";

export const alt = `Attorney profile at ${firm.name}`;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const attorney = getAttorney((await params).slug);
  return counselOgImage(attorney?.name ?? "Our Attorneys");
}
