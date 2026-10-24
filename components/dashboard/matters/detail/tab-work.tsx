"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { isBefore, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { matterDetail as copy } from "@/lib/content/dashboard-practice";
import { toggleTask } from "@/lib/data/matters";
import { useDemoStore } from "@/lib/data/store";
import type { Matter, MatterTask, TaskPriority } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { UserChip } from "../../leads/lead-badges";
import { SectionCard } from "../../section-card";
import { StatusBadge, type Tone } from "../../status-badge";
import { newestFirst, UpdatesList } from "./tab-overview";

export function TimelineTab({
  matter,
  onPost,
}: {
  matter: Matter;
  onPost: () => void;
}) {
  const t = copy.timeline;
  const [filter, setFilter] = useState("all");
  const updates = newestFirst(matter.updates).filter(
    (u) => filter === "all" || (filter === "shared" ? u.shared : !u.shared),
  );
  return (
    <SectionCard
      title={copy.tabs[1].label}
      action={
        <Button size="sm" className="h-8" onClick={onPost}>
          <HugeiconsIcon icon={Add01Icon} />
          {copy.postUpdate}
        </Button>
      }
    >
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as string)}
        className="mb-5"
      >
        <TabsList>
          {t.filters.map((f) => (
            <TabsTrigger key={f.value} value={f.value} className="px-3">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {updates.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <UpdatesList updates={updates} />
      )}
    </SectionCard>
  );
}

const priorityTone: Record<TaskPriority, Tone> = {
  high: "red",
  medium: "amber",
  low: "neutral",
};
const isOverdue = (task: MatterTask) =>
  !task.done && isBefore(new Date(task.dueAt), startOfDay(new Date()));

const t = copy.tasks;

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function TasksTab({
  matter,
  onEditTask,
}: {
  matter: Matter;
  /** Opens the task dialog (rendered outside the tabs; see MatterDetail). */
  onEditTask: (task?: MatterTask) => void;
}) {
  const userId = useDemoStore((s) => s.session?.userId);
  const [filter, setFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "due", desc: false },
  ]);
  // Memoized: TanStack resets its state whenever `data` changes identity,
  // so a fresh array on every render would re-render forever.
  const rows = useMemo(
    () =>
      matter.tasks.filter(
        (task) =>
          filter === "all" ||
          (filter === "mine" ? task.assigneeId === userId : isOverdue(task)),
      ),
    [matter.tasks, filter, userId],
  );

  const columns = useMemo<ColumnDef<MatterTask>[]>(
    () => [
      {
        id: "done",
        header: () => <span className="sr-only">{t.columns.done}</span>,
        cell: ({ row }) => (
          <Checkbox
            aria-label={t.complete(row.original.title)}
            checked={row.original.done}
            onCheckedChange={(v) => {
              toggleTask(matter.id, row.original.id, Boolean(v));
              toast.add({ title: v ? t.done : t.reopened });
            }}
          />
        ),
        enableSorting: false,
      },
      {
        id: "task",
        accessorFn: (task) => task.title,
        header: t.columns.task,
        cell: ({ row }) => (
          <span
            className={cn(
              "block min-w-40",
              row.original.done && "text-muted-foreground line-through",
            )}
          >
            {row.original.title}
          </span>
        ),
      },
      {
        id: "assignee",
        accessorFn: (task) => task.assigneeId,
        header: t.columns.assignee,
        cell: ({ row }) => (
          <UserChip
            userId={row.original.assigneeId}
            fallback=""
            className="whitespace-nowrap"
          />
        ),
      },
      {
        id: "due",
        accessorFn: (task) => task.dueAt,
        header: t.columns.due,
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatDate(row.original.dueAt)}
          </span>
        ),
      },
      {
        id: "priority",
        accessorFn: (task) => priorityOrder[task.priority ?? "medium"],
        header: t.columns.priority,
        cell: ({ row }) => {
          const p = row.original.priority ?? "medium";
          return (
            <StatusBadge tone={priorityTone[p]}>{t.priority[p]}</StatusBadge>
          );
        },
      },
      {
        id: "status",
        accessorFn: (task) => (task.done ? 2 : isOverdue(task) ? 0 : 1),
        header: t.columns.status,
        cell: ({ row }) =>
          row.original.done ? (
            <StatusBadge tone="green">{t.status.done}</StatusBadge>
          ) : isOverdue(row.original) ? (
            <StatusBadge tone="red">{t.status.overdue}</StatusBadge>
          ) : (
            <StatusBadge>{t.status.open}</StatusBadge>
          ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{t.columns.actions}</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              aria-label={`${t.edit} ${row.original.title}`}
              onClick={() => onEditTask(row.original)}
            >
              {t.edit}
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [matter.id, onEditTask],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId: (task) => task.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <SectionCard
      title={copy.tabs[2].label}
      contentClassName="px-0"
      action={
        <Button size="sm" className="h-8" onClick={() => onEditTask()}>
          <HugeiconsIcon icon={Add01Icon} />
          {t.add}
        </Button>
      }
    >
      <div className="px-4 pb-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as string)}>
          <TabsList>
            {t.filters.map((f) => (
              <TabsTrigger key={f.value} value={f.value} className="px-3">
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(header.index === 0 && "w-10 pl-4")}
                >
                  {header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="font-medium hover:text-foreground"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{ asc: " ↑", desc: " ↓" }[
                        header.column.getIsSorted() as string
                      ] ?? ""}
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {t.empty}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell, i) => (
                  <TableCell key={cell.id} className={cn(i === 0 && "pl-4")}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </SectionCard>
  );
}
