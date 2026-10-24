"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { addDays, format } from "date-fns";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { consultationsPage as copy } from "@/lib/content/dashboard-practice";
import {
  consultationStatusLabels,
  meetingTypeLabels,
  practiceAreaLabel,
} from "@/lib/data/labels";
import { attorneyUsers } from "@/lib/data/seed/users";
import { userName } from "@/lib/data/selectors";
import { cn } from "@/lib/utils";
import { FacetedFilter } from "../faceted-filter";
import { UserChip } from "../leads/lead-badges";
import { StatusBadge } from "../status-badge";
import { TipButton } from "../tip-button";
import {
  type ConsultationRow,
  consultationStatusOptions,
  consultationTones,
} from "./shared";

const l = copy.list;
const attorneyOptions = attorneyUsers.map((u) => ({
  value: u.id,
  label: u.name,
}));

export function ConsultationsList({
  rows,
  onOpen,
}: {
  rows: ConsultationRow[];
  onOpen: (id: string) => void;
}) {
  const [when, setWhen] = useState<"upcoming" | "past">("upcoming");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [attorneys, setAttorneys] = useState<string[]>([]);
  const [range, setRange] = useState("all");
  const [now] = useState(() => new Date());

  const data = useMemo(() => {
    const limit = range === "all" ? null : Number(range);
    return rows
      .filter((r) => (when === "upcoming" ? r.end >= now : r.end < now))
      .filter((r) => statuses.length === 0 || statuses.includes(r.status))
      .filter((r) => attorneys.length === 0 || attorneys.includes(r.attorneyId))
      .filter((r) => {
        if (limit === null) return true;
        return when === "upcoming"
          ? r.startDate <= addDays(now, limit)
          : r.startDate >= addDays(now, -limit);
      });
  }, [rows, when, statuses, attorneys, range, now]);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "when", desc: false },
  ]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  const columns = useMemo<ColumnDef<ConsultationRow>[]>(
    () => [
      {
        id: "when",
        accessorFn: (r) => r.startDate.getTime(),
        header: l.columns.when,
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {format(row.original.startDate, "EEE, MMM d")}
            <span className="block text-xs text-muted-foreground">
              {format(row.original.startDate, "h:mm a")} ·{" "}
              {row.original.duration} min
            </span>
          </span>
        ),
      },
      {
        id: "name",
        accessorFn: (r) => r.name,
        header: l.columns.name,
        cell: ({ row }) => (
          <span className="font-medium whitespace-nowrap">
            {row.original.name}
          </span>
        ),
      },
      {
        id: "area",
        accessorFn: (r) =>
          r.lead ? practiceAreaLabel(r.lead.practiceArea) : "",
        header: l.columns.area,
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: "attorney",
        accessorFn: (r) => userName(r.attorneyId),
        header: l.columns.attorney,
        cell: ({ row }) => (
          <UserChip
            userId={row.original.attorneyId}
            fallback=""
            className="whitespace-nowrap"
          />
        ),
      },
      {
        id: "type",
        accessorFn: (r) => meetingTypeLabels[r.type],
        header: l.columns.type,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: "status",
        accessorFn: (r) => r.status,
        header: l.columns.status,
        cell: ({ row }) => (
          <StatusBadge tone={consultationTones[row.original.status]}>
            {consultationStatusLabels[row.original.status]}
          </StatusBadge>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{l.columns.actions}</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              aria-label={`${l.open} ${row.original.name}`}
              onClick={() => onOpen(row.original.id)}
            >
              {l.open}
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [onOpen],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getRowId: (r) => r.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  function switchTab(next: "upcoming" | "past") {
    setWhen(next);
    // Upcoming reads forward from today; past reads backward.
    setSorting([{ id: "when", desc: next === "past" }]);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }

  const statusCounts = new Map<string, number>();
  const attorneyCounts = new Map<string, number>();
  for (const r of rows.filter((r) =>
    when === "upcoming" ? r.end >= now : r.end < now,
  )) {
    statusCounts.set(r.status, (statusCounts.get(r.status) ?? 0) + 1);
    attorneyCounts.set(
      r.attorneyId,
      (attorneyCounts.get(r.attorneyId) ?? 0) + 1,
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs
          value={when}
          onValueChange={(v) => switchTab(v as "upcoming" | "past")}
        >
          <TabsList>
            <TabsTrigger value="upcoming" className="px-3">
              {l.upcoming}
            </TabsTrigger>
            <TabsTrigger value="past" className="px-3">
              {l.past}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <FacetedFilter
          title={l.status}
          options={consultationStatusOptions}
          selected={statuses}
          counts={statusCounts}
          onChange={setStatuses}
        />
        <FacetedFilter
          title={l.attorney}
          options={attorneyOptions}
          selected={attorneys}
          counts={attorneyCounts}
          onChange={setAttorneys}
        />
        <Select
          items={l.ranges}
          value={range}
          onValueChange={(v) => setRange(v as string)}
        >
          <SelectTrigger aria-label={l.range} size="sm" className="h-8 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {l.ranges.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(header.index === 0 && "pl-4")}
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
                  className="h-32 text-center text-muted-foreground"
                >
                  {l.empty}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell, i) => (
                    <TableCell key={cell.id} className={cn(i === 0 && "pl-4")}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm tabular-nums">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <TipButton
            variant="outline"
            size="icon"
            className="border-input"
            aria-label="Previous page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </TipButton>
          <TipButton
            variant="outline"
            size="icon"
            className="border-input"
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </TipButton>
        </div>
      )}
    </div>
  );
}
