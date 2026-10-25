"use client";

import { DemoModeBanner } from "@/components/demo-mode-banner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { dashboardShell as copy } from "@/lib/content/dashboard";
import { AppSidebar } from "./app-sidebar";
import { SearchProvider } from "./command-search";
import { DemoDataProvider } from "./demo-data-provider";
import { NewLeadProvider } from "./leads/new-lead-dialog";
import { Preferences } from "./preferences";
import { Topbar } from "./topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DemoDataProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-button focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        {copy.skipToContent}
      </a>
      <TooltipProvider>
        <Toaster>
          <SearchProvider>
            <NewLeadProvider>
              <SidebarProvider className="text-sm leading-normal">
                <AppSidebar />
                <SidebarInset
                  id="main"
                  role="main"
                  tabIndex={-1}
                  className="min-w-0 outline-none"
                >
                  <Topbar />
                  <DemoModeBanner />
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
