import { firm } from "@/lib/config/firm";
import { getPracticeArea } from "@/lib/content/practice-areas";
import {
  counselOgImage,
  ogImageContentType,
  ogImageSize,
} from "@/lib/og-image";

export const alt = `Practice area at ${firm.name}`;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const area = getPracticeArea((await params).slug);
  return counselOgImage(area ? `${area.title} Attorneys` : "Practice Areas");
}
