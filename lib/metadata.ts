import type { Metadata } from "next";
import { firm } from "@/lib/config/firm";

type PageMetadata = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  /**
   * The route has its own opengraph-image file. Leave the default image out
   * so the route's image is used (an explicit image would override it).
   */
  ownImage?: boolean;
};

/** Social card used when a route has no opengraph-image of its own. */
const defaultImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
};

/** Complete, consistent metadata for an indexable public page. */
export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  type = "website",
  publishedTime,
  ownImage = false,
}: PageMetadata): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title,
      description,
      url: path,
      siteName: firm.name,
      ...(ownImage ? {} : { images: [defaultImage] }),
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ownImage ? {} : { images: [defaultImage.url] }),
    },
  };
}
