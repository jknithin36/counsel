"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** An icon-only button whose accessible name also shows as a tooltip. */
export function TipButton({
  "aria-label": label,
  ...props
}: React.ComponentProps<typeof Button> & { "aria-label": string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button aria-label={label} {...props} />} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
