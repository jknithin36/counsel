"use client";

import Link from "next/link";
import { ArrowIcon } from "@/components/site/arrow-icon";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { mainNav } from "@/lib/config/navigation";

export function DesktopNav() {
  return (
    <NavigationMenu
      aria-label="Main"
      delay={100}
      closeDelay={100}
      className="hidden xl:flex"
    >
      {/* Triggers carry 12px side padding, so a 12px gap gives 36px between labels. */}
      <NavigationMenuList className="gap-3">
        {mainNav.map((entry) =>
          entry.type === "link" ? (
            <NavigationMenuItem key={entry.label}>
              <NavigationMenuLink
                render={<Link href={entry.href} />}
                className={navigationMenuTriggerStyle()}
              >
                {entry.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={entry.label} value={entry.label}>
              <NavigationMenuTrigger>{entry.label}</NavigationMenuTrigger>
              <NavigationMenuContent className="w-[362px] p-0">
                <ul>
                  {entry.items.map((item) => (
                    <li key={item.href}>
                      <NavigationMenuLink render={<Link href={item.href} />}>
                        <span className="text-[15px] font-medium leading-snug text-[#111]">
                          {item.title}
                        </span>
                        <span className="text-[13px] leading-snug text-muted-foreground">
                          {item.description}
                        </span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
                {entry.footer && (
                  <div className="mt-2 border-t border-border pt-2">
                    <NavigationMenuLink
                      render={<Link href={entry.footer.href} />}
                      className="group/arrow flex-row items-center gap-1.5 text-[15px] font-medium leading-snug text-[#111]"
                    >
                      {entry.footer.label} <ArrowIcon />
                    </NavigationMenuLink>
                  </div>
                )}
              </NavigationMenuContent>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
