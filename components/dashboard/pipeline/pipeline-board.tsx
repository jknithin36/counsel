"use client";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { leadStatus, leadStatuses } from "@/lib/config/lead-status";
import { pipelinePage as copy } from "@/lib/content/dashboard-leads";
import { practiceAreas } from "@/lib/content/practice-areas";
import { practiceAreaLabel } from "@/lib/data/labels";
import { setLeadStatus } from "@/lib/data/leads";
import { attorneyUsers } from "@/lib/data/seed/users";
import { leadName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { Lead, LeadStatus } from "@/lib/data/types";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDemoStatus } from "../demo-data-provider";
import { ConvertDialog } from "../leads/convert-dialog";
import { UrgencyBadge, UserChip } from "../leads/lead-badges";
import { PageHeader } from "../page-header";
import { LeadSheet } from "./lead-sheet";

const ALL = "all";
const order = leadStatuses.map((s) => s.value);

/**
 * Arrow keys jump a picked-up card to the previous or next column instead
 * of nudging it a few pixels.
 */
const columnKeyboard: KeyboardCoordinateGetter = (
  event,
  {
    currentCoordinates,
    context: { active, over, droppableRects, collisionRect },
  },
) => {
  if (event.code !== "ArrowLeft" && event.code !== "ArrowRight") {
    if (event.code === "ArrowUp" || event.code === "ArrowDown")
      event.preventDefault();
    return currentCoordinates;
  }
  event.preventDefault();
  const from = (over?.id ?? active?.data.current?.status) as LeadStatus;
  const index = order.indexOf(from);
  const next = order[index + (event.code === "ArrowRight" ? 1 : -1)];
  const rect = next ? droppableRects.get(next) : undefined;
  if (!rect || !collisionRect) return currentCoordinates;
  return {
    x: rect.left + (rect.width - collisionRect.width) / 2,
    y: rect.top + 56,
  };
};

export function PipelineBoard() {
  const status = useDemoStatus();
  const leads = useDemoStore((s) => s.leads);
  const [area, setArea] = useState(ALL);
  const [attorney, setAttorney] = useState(ALL);
  const [query, setQuery] = useState("");
  const [mobileColumn, setMobileColumn] = useState<LeadStatus>("new");
  const [now] = useState(() => new Date());

  const [dragging, setDragging] = useState<Lead | null>(null);
  // Dropping with Enter also "clicks" the card; ignore that click.
  const droppedAt = useRef(0);
  const [openLead, setOpenLead] = useState<string | null>(null);
  const [retainLead, setRetainLead] = useState<Lead | null>(null);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: columnKeyboard,
      keyboardCodes: {
        start: ["Space"],
        cancel: ["Escape"],
        end: ["Space", "Enter"],
      },
    }),
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter(
      (l) =>
        (area === ALL || l.practiceArea === area) &&
        (attorney === ALL || l.assignedAttorney === attorney) &&
        (!q || `${leadName(l)} ${l.email} ${l.id}`.toLowerCase().includes(q)),
    );
  }, [leads, area, attorney, query]);

  const columns = leadStatuses.map((s) => ({
    ...s,
    leads: visible
      .filter((l) => l.status === s.value)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  }));

  function onDragStart(event: DragStartEvent) {
    setDragging(leads.find((l) => l.id === event.active.id) ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    setDragging(null);
    droppedAt.current = Date.now();
    const lead = leads.find((l) => l.id === event.active.id);
    const to = event.over?.id as LeadStatus | undefined;
    if (!lead || !to || to === lead.status) return;
    const from = lead.status;
    setLeadStatus(lead.id, to);
    toast.add({
      title: copy.moved(leadName(lead), leadStatus(to).label),
      actionProps: {
        children: copy.undo,
        onClick: () => setLeadStatus(lead.id, from),
      },
    });
    if (to === "retained" && !lead.matterId) setRetainLead(lead);
  }

  const areaItems = [
    { value: ALL, label: copy.allAreas },
    ...practiceAreas.map((a) => ({ value: a.slug, label: a.title })),
  ];
  const attorneyItems = [
    { value: ALL, label: copy.allAttorneys },
    ...attorneyUsers.map((u) => ({ value: u.id, label: u.name })),
  ];

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader title={copy.title} description={copy.subtitle} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            data-table-search
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.search}
            aria-label={copy.search}
            className="h-8 pl-8"
          />
        </div>
        <Select
          items={areaItems}
          value={area}
          onValueChange={(v) => setArea(v as string)}
        >
          <SelectTrigger
            aria-label={copy.allAreas}
            size="sm"
            className="h-8 w-full sm:w-48"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {areaItems.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={attorneyItems}
          value={attorney}
          onValueChange={(v) => setAttorney(v as string)}
        >
          <SelectTrigger
            aria-label={copy.allAttorneys}
            size="sm"
            className="h-8 w-full sm:w-44"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {attorneyItems.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile: one column at a time. */}
      <div className="md:hidden">
        <Select
          items={columns.map((c) => ({
            value: c.value,
            label: `${c.label} (${c.leads.length})`,
          }))}
          value={mobileColumn}
          onValueChange={(v) => setMobileColumn(v as LeadStatus)}
        >
          <SelectTrigger aria-label={copy.column} className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columns.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label} ({c.leads.length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {status !== "ready" ? (
        <div className="flex gap-4 overflow-hidden">
          {order.map((s) => (
            <Skeleton key={s} className="h-96 w-72 shrink-0" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => {
            setDragging(null);
            droppedAt.current = Date.now();
          }}
          accessibility={{
            screenReaderInstructions: { draggable: copy.instructions },
            announcements: {
              onDragStart: ({ active }) =>
                copy.announce.start(nameOf(leads, active.id)),
              onDragOver: ({ active, over }) =>
                over
                  ? copy.announce.over(
                      nameOf(leads, active.id),
                      leadStatus(over.id as LeadStatus).label,
                    )
                  : undefined,
              onDragEnd: ({ active, over }) =>
                over
                  ? copy.announce.end(
                      nameOf(leads, active.id),
                      leadStatus(over.id as LeadStatus).label,
                    )
                  : copy.announce.cancel(nameOf(leads, active.id)),
              onDragCancel: ({ active }) =>
                copy.announce.cancel(nameOf(leads, active.id)),
            },
          }}
        >
          <div className="relative -mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            <div className="flex gap-4">
              {columns.map((column) => (
                <Column
                  key={column.value}
                  status={column.value}
                  label={column.label}
                  leads={column.leads}
                  share={
                    visible.length
                      ? Math.round((column.leads.length / visible.length) * 100)
                      : 0
                  }
                  hiddenOnMobile={column.value !== mobileColumn}
                  now={now}
                  onOpen={(id) => {
                    if (Date.now() - droppedAt.current > 300) setOpenLead(id);
                  }}
                />
              ))}
            </div>
          </div>
          <DragOverlay dropAnimation={null}>
            {dragging && <LeadCard lead={dragging} now={now} overlay />}
          </DragOverlay>
        </DndContext>
      )}

      <LeadSheet
        leadId={openLead}
        onOpenChange={(open) => !open && setOpenLead(null)}
      />

      <Dialog
        open={Boolean(retainLead)}
        onOpenChange={(open) => !open && setRetainLead(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans text-base font-semibold">
              {copy.retainDialog.title}
            </DialogTitle>
            <DialogDescription>
              {retainLead && copy.retainDialog.body(leadName(retainLead))}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setRetainLead(null)}
            >
              {copy.retainDialog.later}
            </Button>
            <Button
              size="sm"
              className="h-9"
              onClick={() => {
                setConvertLead(retainLead);
                setRetainLead(null);
              }}
            >
              {copy.retainDialog.now}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {convertLead && (
        <ConvertDialog
          lead={convertLead}
          open={Boolean(convertLead)}
          onOpenChange={(open) => !open && setConvertLead(null)}
        />
      )}
    </div>
  );
}

function nameOf(leads: Lead[], id: string | number) {
  const lead = leads.find((l) => l.id === id);
  return lead ? leadName(lead) : "Lead";
}

function Column({
  status,
  label,
  leads,
  share,
  hiddenOnMobile,
  now,
  onOpen,
}: {
  status: LeadStatus;
  label: string;
  leads: Lead[];
  share: number;
  hiddenOnMobile: boolean;
  now: Date;
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      aria-label={label}
      className={cn(
        "flex w-full shrink-0 flex-col rounded-xl bg-muted/60 p-2 transition-colors md:w-72",
        isOver && "bg-muted ring-1 ring-foreground/15",
        hiddenOnMobile && "hidden md:flex",
      )}
    >
      <header className="flex items-center gap-2 px-2 pt-1 pb-3">
        <h2 className="font-sans text-sm font-semibold tracking-normal">
          {label}
        </h2>
        <Badge variant="secondary" className="bg-background tabular-nums">
          {leads.length}
        </Badge>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {share}%
        </span>
      </header>
      <ul className="flex max-h-[calc(100dvh-300px)] min-h-32 flex-col gap-2 overflow-y-auto p-0.5">
        {leads.length === 0 ? (
          <li className="flex h-24 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
            {copy.empty}
          </li>
        ) : (
          leads.map((lead) => (
            <li key={lead.id}>
              <DraggableCard lead={lead} now={now} onOpen={onOpen} />
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function DraggableCard({
  lead,
  now,
  onOpen,
}: {
  lead: Lead;
  now: Date;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { status: lead.status },
  });
  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      aria-label={`${leadName(lead)}, ${practiceAreaLabel(lead.practiceArea)}`}
      onClick={() => onOpen(lead.id)}
      className={cn(
        "block w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging && "opacity-40",
      )}
    >
      <LeadCard lead={lead} now={now} />
    </button>
  );
}

function LeadCard({
  lead,
  now,
  overlay = false,
}: {
  lead: Lead;
  now: Date;
  overlay?: boolean;
}) {
  return (
    <Card
      size="sm"
      className={cn(
        "cursor-grab gap-2 px-3 hover:ring-foreground/20",
        overlay && "w-68 cursor-grabbing shadow-lg",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{leadName(lead)}</p>
          <p className="truncate text-xs text-muted-foreground">
            {practiceAreaLabel(lead.practiceArea)}
          </p>
        </div>
        {lead.urgency === "urgent" && <UrgencyBadge value="urgent" />}
      </div>
      <div className="flex items-center justify-between gap-2">
        <UserChip
          userId={lead.assignedAttorney}
          fallback="Unassigned"
          hideName
          className="text-xs"
        />
        <span className="text-xs text-muted-foreground tabular-nums">
          {timeAgo(lead.createdAt, now)}
        </span>
      </div>
    </Card>
  );
}
