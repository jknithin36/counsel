"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { settingsPage as copy } from "@/lib/content/dashboard-admin";
import { useDemoStatus } from "../demo-data-provider";
import { DirtyReporter } from "../editor-kit";
import { LeaveGuard } from "../leave-guard";
import { PageHeader } from "../page-header";
import { PageSkeleton } from "../page-skeleton";
import { BillingSettings } from "./billing-settings";
import { DemoSettings } from "./demo-settings";
import { FirmSettings } from "./firm-settings";
import { IntakeSettings } from "./intake-settings";
import { NotificationsSettings } from "./notifications-settings";
import { PortalSettings } from "./portal-settings";
import { TeamSettings } from "./team-settings";

type Section = (typeof copy.sections)[number]["value"];
const sections = copy.sections.map((s) => s.value) as Section[];

const panels: Record<Section, () => React.ReactNode> = {
  firm: FirmSettings,
  team: TeamSettings,
  intake: IntakeSettings,
  notifications: NotificationsSettings,
  portal: PortalSettings,
  billing: BillingSettings,
  demo: DemoSettings,
};

const wide = "(min-width: 1024px)";

/** Vertical section list on large screens, a scrolling row below that. */
function useWide() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(wide);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(wide).matches,
    () => true,
  );
}

export function SettingsPage() {
  const isWide = useWide();
  const status = useDemoStatus();
  const router = useRouter();
  const params = useSearchParams();
  const fromUrl = params.get("section") as Section | null;
  const section: Section =
    fromUrl && sections.includes(fromUrl) ? fromUrl : "firm";
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<Section | null>(null);
  const report = useCallback((value: boolean) => setDirty(value), []);

  const go = (next: Section) =>
    router.replace(next === "firm" ? "?" : `?section=${next}`, {
      scroll: false,
    });

  if (status !== "ready") return <PageSkeleton />;
  const Panel = panels[section];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={copy.title} description={copy.subtitle} />

      <Tabs
        value={section}
        onValueChange={(v) => {
          const next = v as Section;
          if (next === section) return;
          if (dirty) setPending(next);
          else go(next);
        }}
        orientation={isWide ? "vertical" : "horizontal"}
        className="flex-col gap-4 lg:flex-row lg:items-start lg:gap-8"
      >
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0 lg:sticky lg:top-20 lg:w-48 lg:shrink-0 lg:overflow-visible">
          <TabsList
            aria-label={copy.sectionsLabel}
            variant="line"
            className="lg:w-full lg:items-stretch"
          >
            {copy.sections.map((s) => (
              <TabsTrigger
                key={s.value}
                value={s.value}
                className="px-3 lg:justify-start"
              >
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value={section} className="min-w-0 max-w-3xl flex-1">
          <DirtyReporter value={report}>
            <Panel key={section} />
          </DirtyReporter>
        </TabsContent>
      </Tabs>

      <LeaveGuard
        open={pending !== null}
        onStay={() => setPending(null)}
        onLeave={() => {
          if (pending) go(pending);
          setDirty(false);
          setPending(null);
        }}
      />
    </div>
  );
}
