"use client";

import { Add01Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  notFound,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { matterDetail as copy } from "@/lib/content/dashboard-practice";
import {
  feeTypeLabels,
  matterStatusLabels,
  practiceAreaLabel,
} from "@/lib/data/labels";
import { changeStage, closeMatter, deleteMatter } from "@/lib/data/matters";
import { matterStages, stageLabel } from "@/lib/data/stages";
import { useDemoStore } from "@/lib/data/store";
import type { Matter, MatterTask } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { useDemoStatus } from "../../demo-data-provider";
import { RequestDocumentDialog } from "../../documents/document-dialogs";
import { PageSkeleton } from "../../page-skeleton";
import { StatusBadge } from "../../status-badge";
import { TipButton } from "../../tip-button";
import { matterStatusTones } from "../matter-bits";
import { MatterDialog } from "../matter-dialog";
import { PostUpdateDialog, TaskDialog, TeamDialog } from "./dialogs";
import { BillingTab, DocumentsTab, MessagesTab } from "./tab-files";
import { OverviewTab } from "./tab-overview";
import { TasksTab, TimelineTab } from "./tab-work";

const tabValues = copy.tabs.map((t) => t.value);

/** All stages as steps: done = filled, current = ring, upcoming = gray. */
function StageProgress({ matter }: { matter: Matter }) {
  const stages = matterStages[matter.practiceArea];
  const current = stages.findIndex((s) => s.key === matter.stage);
  return (
    // A list of stages, not links, so a labelled region. It scrolls sideways
    // on small screens; tabIndex lets keyboard users scroll it too.
    <section
      aria-label={copy.progress}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be focusable
      tabIndex={0}
      className="-mx-4 overflow-x-auto rounded-md px-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 md:mx-0 md:px-0"
    >
      <ol className="flex min-w-[560px]">
        {stages.map((stage, i) => {
          const done = i < current || matter.status === "closed";
          const isCurrent = i === current && matter.status !== "closed";
          return (
            <li
              key={stage.key}
              aria-current={isCurrent ? "step" : undefined}
              className="relative flex flex-1 flex-col items-center gap-2 text-center"
            >
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-[5px] right-1/2 h-px w-full",
                    i <= current || matter.status === "closed"
                      ? "bg-foreground"
                      : "bg-border",
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "relative size-[11px] rounded-full",
                  done && "bg-foreground",
                  isCurrent &&
                    "bg-background ring-2 ring-foreground ring-offset-0",
                  !done && !isCurrent && "bg-[#D9D9D9]",
                )}
              />
              <span
                className={cn(
                  "text-xs",
                  isCurrent
                    ? "font-medium text-foreground"
                    : done
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function MatterDetail({ id }: { id: string }) {
  const status = useDemoStatus();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const matter = useDemoStore((s) => s.matters.find((m) => m.id === id));
  const [updateOpen, setUpdateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  // Dialogs opened from the tabs live here with the page's other dialogs.
  const [taskDialog, setTaskDialog] = useState<{
    open: boolean;
    task?: MatterTask;
  }>({
    open: false,
  });
  const [requestOpen, setRequestOpen] = useState(false);
  const editTask = useCallback(
    (task?: MatterTask) => setTaskDialog({ open: true, task }),
    [],
  );

  const requested = params.get("tab") ?? "overview";
  const tab = tabValues.includes(requested) ? requested : "overview";
  const setTab = (next: string) => {
    const qs = new URLSearchParams(params.toString());
    if (next === "overview") qs.delete("tab");
    else qs.set("tab", next);
    const query = qs.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  if (status !== "ready" || deleted) return <PageSkeleton />;
  if (!matter) notFound();

  const stages = matterStages[matter.practiceArea];

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground tabular-nums">
            {copy.clientMatter(matter.id)}
          </p>
          <h1 className="mt-1 text-[32px] leading-tight">{matter.title}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusBadge tone={matterStatusTones[matter.status]}>
              {matterStatusLabels[matter.status]}
            </StatusBadge>
            <StatusBadge>{practiceAreaLabel(matter.practiceArea)}</StatusBadge>
            <StatusBadge>{feeTypeLabels[matter.feeType]}</StatusBadge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            items={stages.map((s) => ({ value: s.key, label: s.label }))}
            value={matter.stage}
            onValueChange={(v) => {
              if (!v) return;
              changeStage(matter.id, v as string);
              toast.add({
                title: copy.stageChanged(
                  stageLabel(matter.practiceArea, v as string),
                ),
              });
            }}
          >
            <SelectTrigger aria-label={copy.stageLabel} className="h-9 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-9" onClick={() => setUpdateOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} />
            {copy.postUpdate}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <TipButton
                  variant="outline"
                  size="icon"
                  className="size-9 border-input"
                  aria-label={copy.more}
                />
              }
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                {copy.edit}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={matter.status === "closed"}
                onClick={() => setCloseOpen(true)}
              >
                {copy.close}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                {copy.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <StageProgress matter={matter} />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as string)}
        className="gap-4"
      >
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <TabsList>
            {copy.tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="px-3">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="overview">
          <OverviewTab
            matter={matter}
            onShowTimeline={() => setTab("timeline")}
            onManageTeam={() => setTeamOpen(true)}
          />
        </TabsContent>
        <TabsContent value="timeline">
          <TimelineTab matter={matter} onPost={() => setUpdateOpen(true)} />
        </TabsContent>
        <TabsContent value="tasks">
          <TasksTab matter={matter} onEditTask={editTask} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab
            matter={matter}
            onRequest={() => setRequestOpen(true)}
          />
        </TabsContent>
        <TabsContent value="messages">
          <MessagesTab matter={matter} />
        </TabsContent>
        <TabsContent value="billing">
          <BillingTab matter={matter} />
        </TabsContent>
      </Tabs>

      <PostUpdateDialog
        matterId={matter.id}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
      />
      <MatterDialog
        matter={matter}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <TeamDialog matter={matter} open={teamOpen} onOpenChange={setTeamOpen} />
      <TaskDialog
        matter={matter}
        task={taskDialog.task}
        open={taskDialog.open}
        onOpenChange={(open) => setTaskDialog((d) => ({ ...d, open }))}
      />
      <RequestDocumentDialog
        matterId={matter.id}
        open={requestOpen}
        onOpenChange={setRequestOpen}
      />

      <AlertDialog open={closeOpen} onOpenChange={setCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.closeDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {copy.closeDialog.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">
              {copy.closeDialog.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              onClick={() => {
                closeMatter(matter.id);
                setCloseOpen(false);
                toast.add({ title: copy.closedToast });
              }}
            >
              {copy.closeDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {copy.deleteDialog.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">
              {copy.deleteDialog.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              variant="destructive"
              onClick={() => {
                setDeleted(true);
                deleteMatter(matter.id);
                toast.add({ title: copy.deleteDialog.done });
                router.push("/dashboard/matters");
              }}
            >
              {copy.deleteDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
