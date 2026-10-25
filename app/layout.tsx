import type { Metadata } from "next";
import { Geist_Mono, Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { firm } from "@/lib/config/firm";
import { siteMeta } from "@/lib/content/pages";
import { siteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: "400",
});

// Italic is only used below the fold (quotes, signatures), so it isn't
// preloaded. globals.css maps `italic` on serif text to this face.
const newsreaderItalic = Newsreader({
  variable: "--font-newsreader-italic",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  preload: false,
});

// Only used for numbers in dashboard chart tooltips.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  // Absolute URLs for canonicals and social cards; see lib/site-url.ts.
  metadataBase: new URL(siteUrl),
  title: {
    default: siteMeta.title,
    template: `%s | ${firm.name}`,
  },
  description: siteMeta.description,
  applicationName: firm.name,
  openGraph: {
    type: "website",
    siteName: firm.name,
    title: siteMeta.title,
    description: siteMeta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteMeta.title,
    description: siteMeta.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={cn(
        "h-full antialiased",
        manrope.variable,
        newsreader.variable,
        newsreaderItalic.variable,
        geistMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
