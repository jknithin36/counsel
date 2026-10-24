"use client";

import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
  Download04Icon,
  Search01Icon,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { leadStatus, leadStatuses, urgencies } from "@/lib/config/lead-status";
import { leadsPage as copy } from "@/lib/content/dashboard-leads";
import { practiceAreas } from "@/lib/content/practice-areas";
import { practiceAreaLabel, sourceLabels } from "@/lib/data/labels";
import { downloadLeadsCsv } from "@/lib/data/lead-export";
import { assignLead, setLeadStatus } from "@/lib/data/leads";
import { attorneyUsers } from "@/lib/data/seed/users";
import { leadName, userName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { Lead, LeadStatus } from "@/lib/data/types";
import { formatDate, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDemoStatus } from "../demo-data-provider";
import { FacetedFilter } from "../faceted-filter";
import { PageHeader } from "../page-header";
import { TipButton } from "../tip-button";
import { DeleteLeadsDialog } from "./delete-dialog";
import {
  AttorneyRadioItems,
  LeadActionsMenu,
  StatusRadioItems,
} from "./lead-actions-menu";
import { LeadStatusBadge, UrgencyBadge, UserChip } from "./lead-badges";
import { useNewLead } from "./new-lead-dialog";
import { ScheduleDialog } from "./schedule-dialog";
import {
  baseFilter,
  type FacetKey,
  facetFilter,
  facetValue,
  UNASSIGNED,
  useLeadFilters,
} from "./use-lead-filters";

const statusOrder = Object.fromEntries(
  leadStatuses.map((s, i) => [s.value, i]),
);
const urgencyOrder = Object.fromEntries(urgencies.map((u, i) => [u.value, i]));
const NONE = "none";

const facetOptions: Record<FacetKey, { value: string; label: string }[]> = {
  status: leadStatuses.map((s) => ({ value: s.value, label: s.label })),
  area: [
    ...practiceAreas.map((a) => ({ value: a.slug, label: a.title })),
    { value: "general-inquiry", label: practiceAreaLabel("general-inquiry") },
    { value: "not-sure", label: practiceAreaLabel("not-sure") },
  ],
  source: Object.entries(sourceLabels).map(([value, label]) => ({
    value,
    label,
  })),
  attorney: [
    { value: UNASSIGNED, label: copy.unassigned },
    ...attorneyUsers.map((u) => ({ value: u.id, label: u.name })),
  ],
  urgency: urgencies.map((u) => ({ value: u.value, label: u.label })),
};

/** Sort button for a column header. */
function SortHeader({
  label,
  sorted,
  onClick,
  className,
}: {
  label: string;
  sorted: false | "asc" | "desc";
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn("-ml-2.5 h-8 px-2.5 font-medium", className)}
    >
      {label}
      <HugeiconsIcon
        icon={
          sorted === "asc"
            ? ArrowUp01Icon
            : sorted === "desc"
              ? ArrowDown01Icon
              : ArrowUpDownIcon
        }
        className={cn("size-3.5", !sorted && "text-muted-foreground/60")}
      />
    </Button>
  );
}

export function LeadsPage() {
  const status = useDemoStatus();
  const router = useRouter();
  const openNewLead = useNewLead();
  const leads = useDemoStore((s) => s.leads);
  const userId = useDemoStore((s) => s.session?.userId);
  const { filters, setParams, active, reset } = useLeadFilters();
  const [now] = useState(() => new Date());

  const [sorting, setSorting] = useState<SortingState>([
    { id: "received", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [search, setSearch] = useState(filters.q);
  const [scheduling, setScheduling] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState<string[]>([]);

  // Debounce typing into the URL.
  useEffect(() => {
    if (search === filters.q) return;
    const t = setTimeout(() => setParams({ q: search }), 250);
    return () => clearTimeout(t);
  }, [search, filters.q, setParams]);
  useEffect(() => setSearch(filters.q), [filters.q]);

  // Back to page one whenever the filters change.
  const filterKey = JSON.stringify(filters);
  // biome-ignore lint/correctness/useExhaustiveDependencies: filterKey stands in for filters
  useEffect(() => setPagination((p) => ({ ...p, pageIndex: 0 })), [filterKey]);

  const base = useMemo(
    () => baseFilter(leads, filters, userId, now),
    [leads, filters, userId, now],
  );
  const rows = useMemo(() => facetFilter(base, filters), [base, filters]);

  // Facet counts reflect the other filters, like shadcn's data table.
  const counts = useMemo(() => {
    const result = {} as Record<FacetKey, Map<string, number>>;
    for (const key of Object.keys(facetOptions) as FacetKey[]) {
      const others = facetFilter(base, { ...filters, [key]: [] });
      const map = new Map<string, number>();
      for (const lead of others) {
        const v = facetValue(lead, key);
        map.set(v, (map.get(v) ?? 0) + 1);
      }
      result[key] = map;
    }
    return result;
  }, [base, filters]);

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            aria-label={copy.selectAll}
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(Boolean(v))}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={copy.selectRow(leadName(row.original))}
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(Boolean(v))}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "name",
        accessorFn: (l) => `${l.lastName} ${l.firstName}`.toLowerCase(),
        header: ({ column }) => (
          <SortHeader
            label={copy.columns.name}
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting()}
          />
        ),
        cell: ({ row }) => (
          <div className="min-w-40 max-w-60">
            <Link
              href={`/dashboard/leads/${row.original.id}`}
              className="block truncate font-medium underline-offset-4 hover:underline"
            >
              {leadName(row.original)}
            </Link>
            <span className="block truncate text-xs text-muted-foreground">
              {row.original.email || row.original.phone}
            </span>
          </div>
        ),
        enableHiding: false,
      },
      {
        id: "area",
        accessorFn: (l) => practiceAreaLabel(l.practiceArea),
        header: ({ column }) => (
          <SortHeader
            label={copy.columns.area}
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting()}
          />
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (l) => statusOrder[l.status],
        header: ({ column }) => (
          <SortHeader
            label={copy.columns.status}
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting()}
          />
        ),
        cell: ({ row }) => <LeadStatusBadge status={row.original.status} />,
      },
      {
        id: "urgency",
        accessorFn: (l) => urgencyOrder[l.urgency],
        header: ({ column }) => (
          <SortHeader
            label={copy.columns.urgency}
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting()}
          />
        ),
        cell: ({ row }) => <UrgencyBadge value={row.original.urgency} />,
      },
      {
        id: "source",
        accessorFn: (l) => sourceLabels[l.source],
        header: ({ column }) => (
          <SortHeader
            label={copy.columns.source}
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting()}
          />
        ),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: "assigned",
        accessorFn: (l) =>
          l.assignedAttorney ? userName(l.assignedAttorney) : "~",
        header: ({ column }) => (
          <SortHeader
            label={copy.columns.assigned}
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting()}
          />
        ),
        cell: ({ row }) => (
          <UserChip
            userId={row.original.assignedAttorney}
            fallback={copy.unassigned}
            className="whitespace-nowrap"
          />
        ),
      },
      {
        id: "received",
        accessorFn: (l) => l.createdAt,
        header: ({ column }) => (
          <SortHeader
            label={copy.columns.received}
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting()}
          />
        ),
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="whitespace-nowrap text-muted-foreground tabular-nums" />
              }
            >
              {timeAgo(row.original.createdAt, now)}
            </TooltipTrigger>
            <TooltipContent>
              {formatDate(row.original.createdAt, true)}
            </TooltipContent>
          </Tooltip>
        ),
        sortDescFirst: true,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{copy.columns.actions}</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <LeadActionsMenu
              lead={row.original}
              onSchedule={() => setScheduling(row.original)}
              onDelete={() => setDeleting([row.original.id])}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [now],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (lead) => lead.id,
    state: { sorting, rowSelection, columnVisibility, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  const selectedIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id],
  );
  const selectedLeads = leads.filter((l) => selectedIds.includes(l.id));
  const total = leads.length;
  const fresh = leads.filter((l) => l.status === "new").length;

  function exportRows(list: Lead[]) {
    downloadLeadsCsv(list);
    toast.add({ title: copy.exportDone(list.length) });
  }

  function bulkStatus(next: LeadStatus) {
    for (const lead of selectedLeads) setLeadStatus(lead.id, next);
    toast.add({
      title: copy.bulk.done(
        selectedLeads.length,
        `Status set to ${leadStatus(next).label}`,
      ),
    });
    setRowSelection({});
  }

  function bulkAssign(id: string | undefined) {
    for (const lead of selectedLeads) assignLead(lead.id, id);
    toast.add({
      title: copy.bulk.done(
        selectedLeads.length,
        id ? `Assigned to ${userName(id)}` : "Unassigned",
      ),
    });
    setRowSelection({});
  }

  function openRow(event: React.MouseEvent<HTMLElement>, lead: Lead) {
    const target = event.target as HTMLElement;
    // React events bubble through portals: ignore clicks in this row's
    // menus and dialogs, and on the row's own controls.
    if (!event.currentTarget.contains(target)) return;
    if (target.closest("a, button, input, [role='checkbox']")) return;
    if (window.getSelection()?.toString()) return;
    router.push(`/dashboard/leads/${lead.id}`);
  }

  const { pageIndex, pageSize } = table.getState().pagination;
  const from = rows.length === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(rows.length, (pageIndex + 1) * pageSize);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={copy.title}
        description={status === "ready" ? copy.subtitle(total, fresh) : " "}
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-input"
                  />
                }
              >
                <HugeiconsIcon icon={Download04Icon} />
                {copy.export}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuItem
                  disabled={rows.length === 0}
                  onClick={() =>
                    exportRows(
                      table.getSortedRowModel().rows.map((r) => r.original),
                    )
                  }
                >
                  {copy.exportAll(rows.length)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="h-9" onClick={openNewLead}>
              <HugeiconsIcon icon={Add01Icon} />
              {copy.newLead}
            </Button>
          </>
        }
      />

      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <Tabs
          value={filters.view}
          onValueChange={(v) => setParams({ view: v as string })}
        >
          <TabsList>
            {copy.views.map((v) => (
              <TabsTrigger key={v.value} value={v.value} className="px-3">
                {v.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              data-table-search
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={copy.search}
              aria-label={copy.search}
              className="h-8 pl-8"
            />
          </div>
          {(Object.keys(facetOptions) as FacetKey[]).map((key) => (
            <FacetedFilter
              key={key}
              title={copy.filters[key]}
              options={facetOptions[key]}
              selected={filters[key]}
              counts={counts[key]}
              onChange={(values) => setParams({ [key]: values })}
            />
          ))}
          <Select
            items={copy.range.options}
            value={filters.range}
            onValueChange={(v) => setParams({ range: v as string })}
          >
            <SelectTrigger
              aria-label={copy.range.label}
              size="sm"
              className="h-8 w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {copy.range.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {active && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => reset()}
            >
              {copy.filters.reset}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto h-8 border-input font-normal"
                />
              }
            >
              <HugeiconsIcon icon={SlidersHorizontalIcon} />
              {copy.viewOptions}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{copy.toggleColumns}</DropdownMenuLabel>
                {table
                  .getAllColumns()
                  .filter((c) => c.getCanHide())
                  .map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.id}
                      checked={c.getIsVisible()}
                      onCheckedChange={(v) => c.toggleVisibility(Boolean(v))}
                    >
                      {copy.columns[c.id as keyof typeof copy.columns]}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedLeads.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
            <span className="mr-1 text-sm font-medium tabular-nums">
              {copy.bulk.selected(selectedLeads.length)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-input bg-background"
                  />
                }
              >
                {copy.bulk.assign}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52">
                <DropdownMenuRadioGroup
                  value=""
                  onValueChange={(v) =>
                    bulkAssign(v === NONE ? undefined : (v as string))
                  }
                >
                  <AttorneyRadioItems area="" />
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-input bg-background"
                  />
                }
              >
                {copy.bulk.status}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuRadioGroup
                  value=""
                  onValueChange={(v) => bulkStatus(v as LeadStatus)}
                >
                  <StatusRadioItems />
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-input bg-background"
              onClick={() => exportRows(selectedLeads)}
            >
              {copy.bulk.export}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={() => setDeleting(selectedIds)}
            >
              {copy.bulk.delete}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-8"
              onClick={() => setRowSelection({})}
            >
              {copy.bulk.clear}
            </Button>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="hover:bg-transparent">
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.id === "select" && "w-10 pl-4",
                        header.column.id === "actions" && "w-12",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {status !== "ready" ? (
                Array.from({ length: 8 }, (_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="py-3">
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-40 text-center"
                  >
                    <p className="text-muted-foreground">{copy.empty}</p>
                    {(active || filters.view !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 h-8 border-input"
                        onClick={() => reset(true)}
                      >
                        {copy.emptyReset}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    onClick={(e) => openRow(e, row.original)}
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(cell.column.id === "select" && "pl-4")}
                      >
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

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground tabular-nums">
            {copy.pagination.showing(from, to, rows.length)}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground" id="rows-per-page">
                {copy.pagination.rowsPerPage}
              </span>
              <Select
                items={[10, 20, 50].map((n) => ({
                  value: String(n),
                  label: String(n),
                }))}
                value={String(pageSize)}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger
                  size="sm"
                  className="h-8 w-18"
                  aria-labelledby="rows-per-page"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="tabular-nums">
              {copy.pagination.page(
                pageIndex + 1,
                Math.max(table.getPageCount(), 1),
              )}
            </span>
            <div className="flex gap-1">
              <TipButton
                variant="outline"
                size="icon"
                className="border-input"
                aria-label={copy.pagination.previous}
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} />
              </TipButton>
              <TipButton
                variant="outline"
                size="icon"
                className="border-input"
                aria-label={copy.pagination.next}
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} />
              </TipButton>
            </div>
          </div>
        </div>
      </div>

      {scheduling && (
        <ScheduleDialog
          lead={scheduling}
          open={Boolean(scheduling)}
          onOpenChange={(open) => !open && setScheduling(null)}
        />
      )}
      <DeleteLeadsDialog
        ids={deleting}
        open={deleting.length > 0}
        onOpenChange={(open) => !open && setDeleting([])}
        onDeleted={() => setRowSelection({})}
      />
    </div>
  );
}
