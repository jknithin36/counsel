"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { navItemFor } from "@/lib/config/dashboard-nav";
import { dashboardShell as copy } from "@/lib/content/dashboard";
import { leadName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import { InvoiceDialog } from "./billing/billing-dialogs";
import { SearchButton } from "./command-search";
import { useNewLead } from "./leads/new-lead-dialog";
import { ScheduleDialog } from "./leads/schedule-dialog";
import { MatterDialog } from "./matters/matter-dialog";
import { NotificationsMenu } from "./notifications-menu";

function useCrumbs() {
  const pathname = usePathname();
  const item = navItemFor(pathname);
  const crumbs: { label: string; href: string }[] = [
    { label: copy.breadcrumbRoot, href: "/dashboard" },
  ];
  if (item) crumbs.push({ label: item.title, href: item.href });
  else if (pathname === "/dashboard/profile")
    crumbs.push({ label: copy.userMenu.profile, href: pathname });
  const rest = item ? pathname.slice(item.href.length + 1) : "";
  // The last path segment, shown by name where we have one.
  const id = decodeURIComponent(rest.split("/").at(-1) ?? "");
  const detailLabel = useDemoStore((s) => {
    if (!rest) return undefined;
    if (item?.href === "/dashboard/leads") {
      const lead = s.leads.find((l) => l.id === id);
      return lead ? leadName(lead) : undefined;
    }
    if (item?.href === "/dashboard/clients")
      return s.clients.find((c) => c.id === id)?.name;
    return undefined;
  });
  if (item && item.href !== "/dashboard" && rest) {
    crumbs.push({ label: detailLabel ?? id, href: pathname });
  }
  return crumbs;
}

export function Topbar() {
  const crumbs = useCrumbs();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1;
            return (
              <Fragment key={crumb.label}>
                {i > 0 && (
                  <BreadcrumbSeparator
                    className={
                      i < crumbs.length - 1
                        ? "hidden md:flex"
                        : "hidden sm:flex"
                    }
                  />
                )}
                <BreadcrumbItem
                  className={
                    last
                      ? "min-w-0"
                      : i === 0
                        ? "hidden sm:inline-flex"
                        : "hidden md:inline-flex"
                  }
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

      <div className="flex items-center gap-1.5">
        <SearchButton />
        {/* On desktop the bell lives in the sidebar header. */}
        <NotificationsMenu className="md:hidden" />
        <NewMenu />
      </div>
    </header>
  );
}

function NewMenu() {
  const m = copy.newMenu;
  const openNewLead = useNewLead();
  const [open, setOpen] = useState<
    "consultation" | "matter" | "invoice" | null
  >(null);
  const close = (next: boolean) => !next && setOpen(null);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" className="h-8" />}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
          <span className="hidden sm:inline">{m.label}</span>
          <span className="sr-only sm:hidden">{m.label}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {m.items.map((item) => (
            <DropdownMenuItem
              key={item.key}
              onClick={() =>
                item.key === "lead" ? openNewLead() : setOpen(item.key)
              }
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ScheduleDialog open={open === "consultation"} onOpenChange={close} />
      <MatterDialog open={open === "matter"} onOpenChange={close} />
      <InvoiceDialog open={open === "invoice"} onOpenChange={close} />
    </>
  );
}
