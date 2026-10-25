import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { firm } from "@/lib/config/firm";

/*
 * Social card shared by every page: white, the firm wordmark, the page
 * title in Newsreader and a thin black rule. The fonts are static copies in
 * assets/fonts because next/og can't use next/font.
 */

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Newsreader-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Manrope-Medium.ttf")),
]);

export async function counselOgImage(title: string) {
  const [newsreader, manrope] = await fonts;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        color: "#111111",
        padding: "72px 84px",
        fontFamily: "Manrope",
      }}
    >
      <div style={{ display: "flex", fontFamily: "Newsreader", fontSize: 40 }}>
        {firm.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        <div
          style={{
            display: "flex",
            maxWidth: 1000,
            fontFamily: "Newsreader",
            fontSize: 84,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 2,
            background: "#111111",
          }}
        />
      </div>
    </div>,
    {
      ...ogImageSize,
      fonts: [
        { name: "Newsreader", data: newsreader, weight: 400, style: "normal" },
        { name: "Manrope", data: manrope, weight: 500, style: "normal" },
      ],
    },
  );
}
