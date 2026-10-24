"use client";

import {
  LinkSquare02Icon,
  Logout01Icon,
  RefreshIcon,
  UnfoldMoreIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { isStaff, type StaffRole, staffRoleLabels } from "@/lib/auth/roles";
import { signOut, useSession } from "@/lib/auth/session";
import { dashboardShell } from "@/lib/content/dashboard";
import { resetDemoData } from "@/lib/data/demo-data";
import { useDemoStatus } from "./demo-data-provider";

const copy = dashboardShell.userMenu;
const dialog = dashboardShell.resetDialog;

export function UserMenu() {
  const router = useRouter();
  const { user, session } = useSession();
  const { isMobile } = useSidebar();
  const ready = useDemoStatus() === "ready";
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!ready || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem className="flex h-12 items-center gap-2 px-2">
          <Skeleton className="size-6 rounded-[5px] bg-sidebar-accent" />
          <Skeleton className="h-4 flex-1 bg-sidebar-accent group-data-[collapsible=icon]:hidden" />
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

  function handleReset() {
    resetDemoData();
    setConfirmOpen(false);
    toast.add({ title: dialog.done });
  }

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
            <Avatar size="sm" className="rounded-[5px] after:hidden">
              <AvatarFallback className="rounded-[5px] bg-white text-[12px] font-semibold text-[#111]">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="grid flex-1 text-left leading-tight">
              <span className="truncate text-[14px] text-white/90">
                {user.name}
              </span>
              <span className="truncate text-xs text-white/50">
                {/* A demo role switch shows the role being tried. */}
                {session && session.role !== user.role && isStaff(session.role)
                  ? staffRoleLabels[session.role as StaffRole]
                  : user.title}
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
              <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
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
                {copy.reset}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <HugeiconsIcon icon={Logout01Icon} />
              {copy.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {dialog.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel size="sm">{dialog.cancel}</AlertDialogCancel>
              <AlertDialogAction size="sm" onClick={handleReset}>
                {dialog.confirm}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
