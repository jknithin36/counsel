import Image from "next/image";
import { publicFileExists } from "@/lib/public-file";
import { cn } from "@/lib/utils";

export type TextureTone = "charcoal" | "sage" | "olive" | "ink";

const tones: Record<
  TextureTone,
  { base: string; highlight: string; edge: string }
> = {
  charcoal: { base: "#3a3f3d", highlight: "201 209 207", edge: "#2a2d2c" },
  sage: { base: "#8e9a96", highlight: "226 232 229", edge: "#6e7a76" },
  olive: { base: "#5a5446", highlight: "196 188 168", edge: "#3e392f" },
  ink: { base: "#0e0e0e", highlight: "90 96 94", edge: "#000000" },
};

// feTurbulence noise as a data URI, so every panel can share it without
// duplicate SVG filter ids.
const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/** Drop a file at /public/images/textures/<tone>.webp (or .jpg/.png). */
function toneImage(tone: TextureTone) {
  return ["webp", "jpg", "jpeg", "png"]
    .map((ext) => `/images/textures/${tone}.${ext}`)
    .find(publicFileExists);
}

type TexturePanelProps = {
  tone?: TextureTone;
  /**
   * Optional image under /public. Falls back to the tone's texture image,
   * then to a CSS texture when neither file exists.
   */
  src?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

export function TexturePanel({
  tone = "charcoal",
  src,
  priority,
  sizes = "100vw",
  className,
}: TexturePanelProps) {
  const image = src && publicFileExists(src) ? src : toneImage(tone);

  if (image) {
    return (
      <div aria-hidden="true" className={cn("absolute inset-0", className)}>
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      </div>
    );
  }

  const { base, highlight, edge } = tones[tone];

  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0", className)}
      style={{
        backgroundColor: base,
        backgroundImage: [
          // Wide, low-contrast washes read as soft brush strokes.
          `radial-gradient(ellipse 80% 70% at 50% 10%, rgb(${highlight} / 0.36), transparent 72%)`,
          `radial-gradient(ellipse 55% 60% at 26% 58%, rgb(${highlight} / 0.12), transparent 75%)`,
          `radial-gradient(ellipse 55% 60% at 76% 64%, rgb(${highlight} / 0.1), transparent 75%)`,
          `radial-gradient(ellipse 60% 110% at 0% 50%, ${edge}, transparent 72%)`,
          `radial-gradient(ellipse 60% 110% at 100% 50%, ${edge}, transparent 72%)`,
        ].join(", "),
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.22] mix-blend-overlay"
        style={{ backgroundImage: noise }}
      />
    </div>
  );
}
