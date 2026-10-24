"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { dashboardNav, navItemFor } from "@/lib/config/dashboard-nav";
import { firm } from "@/lib/config/firm";
import { dashboardShell as copy } from "@/lib/content/dashboard";
import { unreadForStaff } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import { useOpenSearch } from "./command-search";
import { useDemoStatus } from "./demo-data-provider";
import { NotificationsMenu } from "./notifications-menu";
import { TipButton } from "./tip-button";
import { UserMenu } from "./user-menu";

/** Icon buttons on the black sidebar. */
const darkIconButton =
  "size-8 text-white/70 hover:bg-sidebar-accent hover:text-white aria-expanded:bg-sidebar-accent aria-expanded:text-white";

export function AppSidebar() {
  const pathname = usePathname();
  const active = navItemFor(pathname);
  const { isMobile, setOpenMobile } = useSidebar();
  const openSearch = useOpenSearch();
  const ready = useDemoStatus() === "ready";
  const newLeads = useDemoStore(
    (s) => s.leads.filter((l) => l.status === "new").length,
  );
  const unread = useDemoStore((s) => unreadForStaff(s.threads));
  const counts = { newLeads, unreadMessages: unread };
  const closeOnMobile = () => isMobile && setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center justify-between gap-2 px-4 pt-6 pb-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
        <Link
          href="/dashboard"
          aria-label={`${copy.brand}, ${firm.name}`}
          className="flex items-center gap-2 rounded-md font-serif text-[26px] leading-none text-white outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          onClick={closeOnMobile}
        >
          {/* The logo file is black; invert it for the dark sidebar. */}
          <Image
            src="/logo.svg"
            alt=""
            width={1120}
            height={1248}
            unoptimized
            priority
            className="h-8 w-auto shrink-0 invert"
          />
          <span className="group-data-[collapsible=icon]:hidden">
            {copy.brand}
          </span>
        </Link>
        <div className="flex items-center group-data-[collapsible=icon]:hidden">
          <NotificationsMenu
            side={isMobile ? "bottom" : "right"}
            className={darkIconButton}
          />
          <TipButton
            variant="ghost"
            size="icon"
            aria-label={copy.search.buttonShort}
            className={darkIconButton}
            onClick={() => {
              closeOnMobile();
              openSearch();
            }}
          >
            <HugeiconsIcon icon={Search01Icon} />
          </TipButton>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-3">
        {dashboardNav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="mb-1 text-[12px] font-normal text-white/55">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => {
                const isActive = active?.href === item.href;
                const count = item.badge && ready ? counts[item.badge] : 0;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-9 gap-3 px-2.5 text-[14px] text-white/80 data-active:font-normal [&_svg]:text-white/55 data-active:[&_svg]:text-white hover:[&_svg]:text-white"
                      render={
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                          onClick={closeOnMobile}
                        />
                      }
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={1.5} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {count > 0 && (
                      <SidebarMenuBadge className="top-2! text-white/55">
                        {count}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-4 pb-5 group-data-[collapsible=icon]:px-2">
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
