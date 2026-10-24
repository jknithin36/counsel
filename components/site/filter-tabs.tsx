import Link from "next/link";
import { cn } from "@/lib/utils";

/** Underlined text tabs that link to filtered URLs. */
export function FilterTabs({
  label,
  tabs,
  active,
}: {
  label: string;
  tabs: { key: string; label: string; href: string }[];
  active: string;
}) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-x-8 gap-y-3 border-b border-border">
        {tabs.map((tab) => {
          const current = tab.key === active;
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                scroll={false}
                aria-current={current ? "true" : undefined}
                className={cn(
                  "-mb-px inline-block border-b-2 pb-3 text-[15px] font-medium",
                  current
                    ? "border-[#111] text-[#111]"
                    : "border-transparent text-muted-foreground hover:text-[#111]",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
