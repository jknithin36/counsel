import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

/** The site's "→" for text links. Sized to the surrounding text. */
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <HugeiconsIcon
      icon={ArrowRight02Icon}
      strokeWidth={1.75}
      aria-hidden="true"
      className={cn("size-[1.1em] shrink-0", className)}
    />
  );
}
