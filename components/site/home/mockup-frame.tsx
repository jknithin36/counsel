import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** White "screenshot" panel. Decorative: one label for the whole picture. */
export function MockupFrame({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="img" aria-label={label} className="h-full">
      <div
        aria-hidden="true"
        className={cn(
          "h-full select-none overflow-hidden rounded-tl-[10px] bg-white text-[#111] shadow-[0_24px_60px_rgba(0,0,0,0.25)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export const pillTone = {
  positive: "bg-[#e8f5ec] text-[#1f7a45]",
  warning: "bg-[#fdf3e1] text-[#9a6500]",
  danger: "bg-[#fdecec] text-[#b42318]",
  neutral: "bg-[#f0f0f0] text-[#111]",
};

export function Pill({
  tone,
  children,
}: {
  tone: keyof typeof pillTone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium leading-none",
        pillTone[tone],
      )}
    >
      {children}
    </span>
  );
}
