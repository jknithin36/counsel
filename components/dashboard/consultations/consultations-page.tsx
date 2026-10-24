"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { endOfWeek, startOfWeek } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { consultationsPage as copy } from "@/lib/content/dashboard-practice";
import { useDemoStatus } from "../demo-data-provider";
import { ScheduleDialog } from "../leads/schedule-dialog";
import { PageHeader } from "../page-header";
import { PageSkeleton } from "../page-skeleton";
import { CalendarView } from "./calendar-view";
import { ConsultationSheet } from "./consultation-sheet";
import { ConsultationsList } from "./consultations-list";
import { useConsultationRows } from "./shared";

export function ConsultationsPage() {
  const status = useDemoStatus();
  const isMobile = useIsMobile();
  const rows = useConsultationRows();
  const [tab, setTab] = useState("calendar");
  const [openId, setOpenId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // Phones start on the list; the calendar there is day-only.
  useEffect(() => {
    if (isMobile) setTab("list");
  }, [isMobile]);

  if (status !== "ready") return <PageSkeleton />;

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const thisWeek = rows.filter(
    (r) =>
      r.status !== "cancelled" &&
      r.startDate >= weekStart &&
      r.startDate <= weekEnd,
  ).length;
  const open = rows.find((r) => r.id === openId) ?? null;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title={copy.title}
        description={copy.subtitle(thisWeek)}
        actions={
          <Button
            size="sm"
            className="h-9"
            onClick={() => setScheduleOpen(true)}
          >
            <HugeiconsIcon icon={Add01Icon} />
            {copy.schedule}
          </Button>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as string)}
        className="gap-4"
      >
        <TabsList>
          <TabsTrigger value="calendar" className="px-3">
            {copy.tabs.calendar}
          </TabsTrigger>
          <TabsTrigger value="list" className="px-3">
            {copy.tabs.list}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <CalendarView rows={rows} onOpen={setOpenId} />
        </TabsContent>
        <TabsContent value="list">
          <ConsultationsList rows={rows} onOpen={setOpenId} />
        </TabsContent>
      </Tabs>

      <ConsultationSheet
        row={open}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
      <ScheduleDialog open={scheduleOpen} onOpenChange={setScheduleOpen} />
    </div>
  );
}
