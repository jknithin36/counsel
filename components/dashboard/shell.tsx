"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./app-sidebar";
import { SearchProvider } from "./command-search";
import { DemoDataProvider } from "./demo-data-provider";
import { NewLeadProvider } from "./leads/new-lead-dialog";
import { Preferences } from "./preferences";
import { Topbar } from "./topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DemoDataProvider>
      <TooltipProvider>
        <Toaster>
          <SearchProvider>
            <NewLeadProvider>
              <SidebarProvider className="text-sm leading-normal">
                <AppSidebar />
                <SidebarInset id="main" className="min-w-0">
                  <Topbar />
                  <div className="mx-auto w-full max-w-[1400px] flex-1 p-4 md:p-8">
                    <Preferences>{children}</Preferences>
                  </div>
                </SidebarInset>
              </SidebarProvider>
            </NewLeadProvider>
          </SearchProvider>
        </Toaster>
      </TooltipProvider>
    </DemoDataProvider>
  );
}
