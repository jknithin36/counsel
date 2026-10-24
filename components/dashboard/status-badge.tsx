import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Tone = "neutral" | "green" | "amber" | "red" | "blue";

/** Muted status colors; the only color used in the dashboard. */
const tones: Record<Tone, string> = {
  neutral: "border-border bg-transparent text-muted-foreground",
  green: "bg-[#EAF3EC] text-[#2F6B3F]",
  amber: "bg-[#FBF1DE] text-[#8A5A00]",
  red: "bg-[#FBEAEA] text-[#A23B3B]",
  blue: "bg-[#E8EFF8] text-[#2E5A8A]",
};

export function StatusBadge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant={tone === "neutral" ? "outline" : "secondary"}
      className={cn("font-medium tabular-nums", tones[tone], className)}
    >
      {children}
    </Badge>
  );
}
