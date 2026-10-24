"use client";

import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { mattersPage as copy } from "@/lib/content/dashboard-practice";
import { practiceAreas } from "@/lib/content/practice-areas";
import {
  feeTypeLabels,
  matterStatusLabels,
  practiceAreaLabel,
} from "@/lib/data/labels";
import { downloadMatterCsv } from "@/lib/data/matter-export";
import { changeStage, closeMatter } from "@/lib/data/matters";
import { attorneyUsers } from "@/lib/data/seed/users";
import { userName } from "@/lib/data/selectors";
import { matterStages, stageLabel } from "@/lib/data/stages";
import { useDemoStore } from "@/lib/data/store";
import type { Client, Matter } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDemoStatus } from "../demo-data-provider";
import { FacetedFilter } from "../faceted-filter";
import { UserChip } from "../leads/lead-badges";
import { PageHeader } from "../page-header";
import { StatusBadge } from "../status-badge";
import { TipButton } from "../tip-button";
import { useUrlFilters } from "../use-url-filters";
import { DeadlineBadge } from "./matter-bits";
import { MatterDialog } from "./matter-dialog";

const facets = ["status", "area", "attorney", "fee"] as const;
type Facet = (typeof facets)[number];
const filterConfig = { facets, scalars: { view: "all" } };

const facetOptions: Record<Facet, { value: string; label: string }[]> = {
  status: Object.entries(matterStatusLabels).map(([value, label]) => ({
    value,
    label,
  })),
  area: practiceAreas.map((a) => ({ value: a.slug, label: a.title })),
  attorney: attorneyUsers.map((u) => ({ value: u.id, label: u.name })),
  fee: Object.entries(feeTypeLabels).map(([value, label]) => ({
    value,
    label,
  })),
};

const facetValue = (m: Matter, key: Facet) =>
  ({
    status: m.status,
    area: m.practiceArea,
    attorney: m.leadAttorneyId,
    fee: m.feeType,
  })[key];

type Row = Matter & { client?: Client };

function SortHeader({
  label,
  sorted,
  onClick,
}: {
  label: string;
  sorted: false | "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="-ml-2.5 h-8 px-2.5 font-medium"
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

function RowActions({ matter, client }: { matter: Matter; client?: Client }) {
  const a = copy.actions;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <TipButton
            variant="ghost"
            size="icon"
            aria-label={copy.rowActions(matter.title)}
          />
        }
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          render={<Link href={`/dashboard/matters/${matter.id}`} />}
        >
          {a.open}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{a.stage}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuRadioGroup
              value={matter.stage}
              onValueChange={(v) => {
                changeStage(matter.id, v as string);
                toast.add({
                  title: a.staged(
                    matter.id,
                    stageLabel(matter.practiceArea, v as string),
                  ),
                });
              }}
            >
              {matterStages[matter.practiceArea].map((s) => (
                <DropdownMenuRadioItem key={s.key} value={s.key} closeOnClick>
                  {s.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem
          disabled={matter.status === "closed"}
          onClick={() => {
            closeMatter(matter.id);
            toast.add({ title: a.closed(matter.id) });
          }}
        >
          {a.close}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            downloadMatterCsv(matter, client);
            toast.add({ title: a.exported(matter.id) });
          }}
        >
          {a.export}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MattersPage() {
  const status = useDemoStatus();
  const router = useRouter();
  const matters = useDemoStore((s) => s.matters);
  const clients = useDemoStore((s) => s.clients);
  const userId = useDemoStore((s) => s.session?.userId);
  const { filters, setParams, active, reset } = useUrlFilters(filterConfig);
  const [search, setSearch] = useState(filters.q);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "deadline", desc: false },
  ]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [now] = useState(() => new Date());

  useEffect(() => {
    if (search === filters.q) return;
    const t = setTimeout(() => setParams({ q: search }), 250);
    return () => clearTimeout(t);
  }, [search, filters.q, setParams]);
  useEffect(() => setSearch(filters.q), [filters.q]);
  const filterKey = JSON.stringify(filters);
  // biome-ignore lint/correctness/useExhaustiveDependencies: filterKey stands in for filters
  useEffect(() => setPagination((p) => ({ ...p, pageIndex: 0 })), [filterKey]);

  const withClients = useMemo<Row[]>(
    () =>
      matters.map((m) => ({
        ...m,
        client: clients.find((c) => c.id === m.clientId),
      })),
    [matters, clients],
  );

  const base = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return withClients.filter((m) => {
      if (filters.view === "mine" && !m.team.includes(userId ?? ""))
        return false;
      if (
        ["open", "pending", "closed"].includes(filters.view) &&
        m.status !== filters.view
      )
        return false;
      if (
        q &&
        !`${m.id} ${m.title} ${m.client?.name ?? ""}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [withClients, filters, userId]);

  const rows = useMemo(
    () =>
      base.filter((m) =>
        facets.every(
          (key) =>
            filters[key].length === 0 ||
            filters[key].includes(facetValue(m, key)),
        ),
      ),
    [base, filters],
  );

  const counts = useMemo(() => {
    const result = {} as Record<Facet, Map<string, number>>;
    for (const key of facets) {
      const map = new Map<string, number>();
      for (const m of base.filter((x) =>
        facets.every(
          (k) =>
            k === key ||
            filters[k].length === 0 ||
            filters[k].includes(facetValue(x, k)),
        ),
      )) {
        const v = facetValue(m, key);
        map.set(v, (map.get(v) ?? 0) + 1);
      }
      result[key] = map;
    }
    return result;
  }, [base, filters]);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: "matter",
        accessorFn: (m) => m.title.toLowerCase(),
        header: ({ column }) => (
          <SortHeader
            label={copy.columns.matter}
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting()}
          />
        ),
        cell: ({ row }) => (
          <div className="min-w-48 max-w-72">
            <span className="block text-xs text-muted-foreground tabular-nums">
              {row.original.id}
            </span>
            <Link
              href={`/dashboard/matters/${row.original.id}`}
              className="block truncate text-sm font-medium underline-offset-4 hover:underline"
            >
              {row.original.title}
            </Link>
          </div>
        ),
      },
      {
        id: "client",
        accessorFn: (m) => m.client?.name ?? "",
        header: ({ column }) => (
          <SortHeader
            label={copy.columns.client}
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting()}
          />
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{getValue<string>()}</span>
        ),
      },
      {
        id: "area",
        accessorFn: (m) => practiceAreaLabel(m.practiceArea),
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
        id: "stage",
        accessorFn: (m) =>
          matterStages[m.practiceArea].findIndex((s) => s.key === m.stage),
        header: copy.columns.stage,
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <StatusBadge>
              {stageLabel(row.original.practiceArea, row.original.stage)}
            </StatusBadge>
            {row.original.status !== "open" && (
              <span className="text-xs text-muted-foreground">
                {matterStatusLabels[row.original.status]}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "attorney",
        accessorFn: (m) => userName(m.leadAttorneyId),
        header: ({ column }) => (
          <SortHeader
            label={copy.columns.attorney}
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting()}
          />
        ),
        cell: ({ row }) => (
          <UserChip
            userId={row.original.leadAttorneyId}
            fallback=""
            className="whitespace-nowrap"
          />
        ),
      },
      {
        id: "deadline",
        accessorFn: (m) =>
          m.status === "closed" || !m.nextDeadline
            ? "9999"
            : m.nextDeadline.date,
        header: ({ column }) => (
          <SortHeader
            label={copy.columns.deadline}
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting()}
          />
        ),
        cell: ({ row }) => {
          const d = row.original.nextDeadline;
          if (!d || row.original.status === "closed")
            return (
              <span className="text-muted-foreground">{copy.noDeadline}</span>
            );
          return (
            <div className="flex flex-col items-start gap-1 whitespace-nowrap">
              <span className="tabular-nums">{formatDate(d.date)}</span>
              <DeadlineBadge date={d.date} now={now} />
            </div>
          );
        },
      },
      {
        id: "opened",
        accessorFn: (m) => m.openedAt,
        header: ({ column }) => (
          <SortHeader
            label={copy.columns.opened}
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting()}
          />
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-muted-foreground tabular-nums">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{copy.columns.actions}</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions matter={row.original} client={row.original.client} />
          </div>
        ),
        enableSorting: false,
      },
    ],
    [now],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (m) => m.id,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  function openRow(event: React.MouseEvent<HTMLElement>, id: string) {
    const target = event.target as HTMLElement;
    if (!event.currentTarget.contains(target)) return;
    if (target.closest("a, button")) return;
    router.push(`/dashboard/matters/${id}`);
  }

  const open = matters.filter((m) => m.status === "open").length;
  const pending = matters.filter((m) => m.status === "pending").length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title={copy.title}
        description={status === "ready" ? copy.subtitle(open, pending) : " "}
        actions={
          <Button size="sm" className="h-9" onClick={() => setDialogOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} />
            {copy.newMatter}
          </Button>
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
          {facets.map((key) => (
            <FacetedFilter
              key={key}
              title={copy.filters[key]}
              options={facetOptions[key]}
              selected={filters[key]}
              counts={counts[key]}
              onChange={(values) => setParams({ [key]: values })}
            />
          ))}
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
                      <Skeleton className="h-9 w-full" />
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 h-8 border-input"
                      onClick={() => reset(true)}
                    >
                      {copy.emptyReset}
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={(e) => openRow(e, row.original.id)}
                  >
                    {row.getVisibleCells().map((cell, i) => (
                      <TableCell
                        key={cell.id}
                        className={cn(i === 0 && "pl-4")}
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
            {rows.length === 0 ? 0 : pageIndex * pageSize + 1}–
            {Math.min(rows.length, (pageIndex + 1) * pageSize)} of {rows.length}
          </p>
          <div className="flex gap-1">
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
        </div>
      </div>

      <MatterDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
