"use client";

import {
  LinkSquare02Icon,
  Logout01Icon,
  RefreshIcon,
  UnfoldMoreIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Toaster, toast } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { signOut } from "@/lib/auth/session";
import { firm } from "@/lib/config/firm";
import {
  type PortalNavItem,
  portalAccountNav,
  portalNav,
  portalNavItemFor,
} from "@/lib/config/portal-nav";
import { demoExperience } from "@/lib/content/demo";
import { portalShell as copy } from "@/lib/content/portal";
import { resetDemoData } from "@/lib/data/demo-data";
import { useDemoStore } from "@/lib/data/store";
import { initials } from "@/lib/format";
import { PortalProvider, usePortalStatus } from "./provider";
import { usePortal, usePortalTasks } from "./use-portal";

function NavGroup({ label, items }: { label: string; items: PortalNavItem[] }) {
  const pathname = usePathname();
  const active = portalNavItemFor(pathname);
  const { isMobile, setOpenMobile } = useSidebar();
  const ready = usePortalStatus() === "ready";
  const { counts } = usePortalTasks();
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="mb-1 text-[12px] font-normal text-white/55">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {items.map((item) => {
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
                    onClick={() => isMobile && setOpenMobile(false)}
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
  );
}

function PortalUserMenu() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { user } = usePortal();
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!user) return null;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8 rounded-[5px] after:rounded-[5px]">
              <AvatarFallback className="rounded-[5px] bg-white text-xs font-medium text-black">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="grid flex-1 text-left leading-tight">
              <span className="truncate text-[14px] text-white/90">
                {user.name}
              </span>
              <span className="truncate text-xs text-white/50">
                {user.email}
              </span>
            </span>
            <HugeiconsIcon
              icon={UnfoldMoreIcon}
              className="ml-auto text-white/50"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "top" : "right"}
            align="end"
            className="w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="block text-sm font-medium text-foreground">
                  {user.name}
                </span>
                <span className="block font-normal">{user.email}</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/portal/profile" />}>
                <HugeiconsIcon icon={UserIcon} />
                {copy.profile}
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  // biome-ignore lint/a11y/useAnchorContent: content is passed as children by Base UI
                  <a href="/" target="_blank" rel="noopener noreferrer" />
                }
              >
                <HugeiconsIcon icon={LinkSquare02Icon} />
                {copy.publicSite}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmOpen(true)}>
                <HugeiconsIcon icon={RefreshIcon} />
                {demoExperience.reset}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                signOut();
                router.replace("/login");
              }}
            >
              <HugeiconsIcon icon={Logout01Icon} />
              {copy.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {demoExperience.resetDialog.title}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {demoExperience.resetDialog.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel size="sm">
                {demoExperience.resetDialog.cancel}
              </AlertDialogCancel>
              <AlertDialogAction
                size="sm"
                onClick={() => {
                  resetDemoData();
                  setConfirmOpen(false);
                  toast.add({ title: demoExperience.resetDone });
                }}
              >
                {demoExperience.resetDialog.confirm}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function PortalSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { matter } = usePortal();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 pt-6 pb-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <Link
          href="/portal"
          aria-label={`${copy.brand}, ${firm.name}`}
          className="flex items-center gap-2 rounded-md font-serif text-[26px] leading-none text-white outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          onClick={() => isMobile && setOpenMobile(false)}
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
        {matter && (
          <div className="mt-5 border-t border-white/10 pt-4 group-data-[collapsible=icon]:hidden">
            <p className="text-[12px] text-white/55">{copy.matterLabel}</p>
            <p className="mt-1 truncate text-[14px] text-white/90">
              {matter.title}
            </p>
            <p className="text-xs text-white/50 tabular-nums">{matter.id}</p>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="gap-3">
        <NavGroup label={copy.navLabel} items={portalNav} />
        <NavGroup label={copy.accountLabel} items={portalAccountNav} />
      </SidebarContent>
      <SidebarFooter className="px-4 pb-5 group-data-[collapsible=icon]:px-2">
        <PortalUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/** Portal › Section › Detail (document or form name). */
function useCrumbs() {
  const pathname = usePathname();
  const item = portalNavItemFor(pathname);
  const id = decodeURIComponent(pathname.split("/").at(-1) ?? "");
  const detail = useDemoStore((s) => {
    if (pathname.startsWith("/portal/sign/"))
      return s.documents.find((d) => d.id === id)?.name;
    if (pathname.startsWith("/portal/forms/"))
      return s.portalForms.find((f) => f.id === id)?.name;
    return undefined;
  });
  const crumbs = [{ label: copy.breadcrumbRoot, href: "/portal" }];
  if (item && item.href !== "/portal")
    crumbs.push({ label: item.title, href: item.href });
  if (item && pathname !== item.href && item.href !== "/portal")
    crumbs.push({ label: detail ?? id, href: pathname });
  if (item?.href === "/portal")
    crumbs[0] = { label: item.title, href: "/portal" };
  return crumbs;
}

function Topbar() {
  const crumbs = useCrumbs();
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1;
            return (
              <Fragment key={crumb.href}>
                {i > 0 && <BreadcrumbSeparator className="hidden sm:flex" />}
                <BreadcrumbItem
                  className={last ? "min-w-0" : "hidden sm:inline-flex"}
                >
                  {last ? (
                    <BreadcrumbPage className="truncate">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={crumb.href} />}>
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-button focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        {copy.skipToContent}
      </a>
      <TooltipProvider>
        <Toaster>
          <SidebarProvider className="text-sm leading-normal">
            <PortalSidebar />
            <SidebarInset
              id="main"
              role="main"
              tabIndex={-1}
              className="min-w-0 outline-none"
            >
              <Topbar />
              <DemoModeBanner />
              <div className="mx-auto w-full max-w-[1200px] flex-1 p-4 md:p-8">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </Toaster>
      </TooltipProvider>
    </PortalProvider>
  );
}
