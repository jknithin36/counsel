"use client";

import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
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
  DropdownMenuSeparator,
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
import { clientsPage as copy } from "@/lib/content/dashboard-office";
import { practiceAreas } from "@/lib/content/practice-areas";
import { inviteToPortal, setClientArchived } from "@/lib/data/clients";
import { attorneyUsers } from "@/lib/data/seed/users";
import { userName } from "@/lib/data/selectors";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDemoStatus } from "../demo-data-provider";
import { FacetedFilter } from "../faceted-filter";
import { UserChip } from "../leads/lead-badges";
import { PageHeader } from "../page-header";
import { StatusBadge } from "../status-badge";
import { TipButton } from "../tip-button";
import { useUrlFilters } from "../use-url-filters";
import {
  ClientAvatar,
  type ClientRow,
  PortalBadge,
  useClientRows,
} from "./client-bits";
import { ClientDialog } from "./client-dialog";

const facets = ["area", "attorney", "language", "balance"] as const;
type Facet = (typeof facets)[number];
const filterConfig = { facets, scalars: { view: "all" } };
const c = copy.columns;

const facetOptions: Record<Facet, { value: string; label: string }[]> = {
  area: practiceAreas.map((a) => ({ value: a.slug, label: a.title })),
  attorney: attorneyUsers.map((u) => ({ value: u.id, label: u.name })),
  language: [
    { value: "English", label: "English" },
    { value: "Spanish", label: "Spanish" },
  ],
  balance: copy.balanceOptions,
};

/** A client can match several values (e.g. matters in two areas). */
function facetValues(c: ClientRow, key: Facet): string[] {
  switch (key) {
    case "area":
      return c.matterList.map((m) => m.practiceArea);
    case "attorney":
      return c.matterList.map((m) => m.leadAttorneyId);
    case "language":
      return [c.language];
    case "balance":
      return [c.balance > 0 ? "due" : "clear"];
  }
}

function matchesFacets(
  c: ClientRow,
  filters: Record<Facet, string[]>,
  skip?: Facet,
) {
  return facets.every(
    (key) =>
      key === skip ||
      filters[key].length === 0 ||
      facetValues(c, key).some((v) => filters[key].includes(v)),
  );
}

/** Opens the client's message thread (their first open matter). */
export function messageClient(
  row: Pick<ClientRow, "matterList">,
  push: (href: string) => void,
) {
  const matter =
    row.matterList.find((m) => m.status !== "closed") ?? row.matterList[0];
  if (!matter) {
    toast.add({ title: copy.noThread });
    return;
  }
  push(`/dashboard/messages?thread=${matter.id}`);
}

export function invite(client: { id: string; email: string; name: string }) {
  inviteToPortal(client.id);
  toast.add({ title: copy.invited(client.email || client.name) });
}

function RowActions({ client }: { client: ClientRow }) {
  const router = useRouter();
  const a = copy.actions;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <TipButton
            variant="ghost"
            size="icon"
            aria-label={copy.rowActions(client.name)}
          />
        }
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          render={<Link href={`/dashboard/clients/${client.id}`} />}
        >
          {a.open}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={client.portalStatus === "active"}
          onClick={() => invite(client)}
        >
          {client.portalStatus === "invited" ? a.resend : a.invite}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => messageClient(client, router.push)}>
          {a.message}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setClientArchived(client.id, !client.archived);
            toast.add({
              title: client.archived
                ? copy.restoredToast(client.name)
                : copy.archivedToast(client.name),
            });
          }}
        >
          {client.archived ? a.restore : a.archive}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ClientsPage() {
  const status = useDemoStatus();
  const router = useRouter();
  const rowsAll = useClientRows();
  const { filters, setParams, active, reset } = useUrlFilters(filterConfig);
  const [search, setSearch] = useState(filters.q);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "client", desc: false },
  ]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (search === filters.q) return;
    const t = setTimeout(() => setParams({ q: search }), 250);
    return () => clearTimeout(t);
  }, [search, filters.q, setParams]);
  useEffect(() => setSearch(filters.q), [filters.q]);
  const filterKey = JSON.stringify(filters);
  // biome-ignore lint/correctness/useExhaustiveDependencies: filterKey stands in for filters
  useEffect(() => setPagination((p) => ({ ...p, pageIndex: 0 })), [filterKey]);

  const base = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return rowsAll.filter((c) => {
      if (filters.view === "active" && !c.active) return false;
      if (filters.view === "past" && (c.active || c.archived)) return false;
      if (q) {
        const hay = `${c.name} ${c.email}`.toLowerCase();
        const phoneHit =
          digits.length >= 3 && c.phone.replace(/\D/g, "").includes(digits);
        if (!hay.includes(q) && !phoneHit) return false;
      }
      return true;
    });
  }, [rowsAll, filters]);

  const rows = useMemo(
    () => base.filter((c) => matchesFacets(c, filters)),
    [base, filters],
  );
  const counts = useMemo(() => {
    const result = {} as Record<Facet, Map<string, number>>;
    for (const key of facets) {
      const map = new Map<string, number>();
      for (const c of base.filter((x) => matchesFacets(x, filters, key)))
        for (const v of new Set(facetValues(c, key)))
          map.set(v, (map.get(v) ?? 0) + 1);
      result[key] = map;
    }
    return result;
  }, [base, filters]);

  const columns = useMemo<ColumnDef<ClientRow>[]>(
    () => [
      {
        id: "client",
        accessorFn: (r) => r.name.toLowerCase(),
        header: c.client,
        cell: ({ row }) => (
          <div className="flex min-w-52 items-center gap-3">
            <ClientAvatar name={row.original.name} />
            <div className="min-w-0">
              <Link
                href={`/dashboard/clients/${row.original.id}`}
                className="block truncate font-medium underline-offset-4 hover:underline"
              >
                {row.original.name}
              </Link>
              <span className="block truncate text-xs text-muted-foreground">
                {row.original.email}
              </span>
            </div>
            {row.original.archived && (
              <StatusBadge>{copy.archived}</StatusBadge>
            )}
          </div>
        ),
      },
      {
        id: "phone",
        accessorFn: (r) => r.phone,
        header: c.phone,
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-muted-foreground tabular-nums">
            {getValue<string>()}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: "matters",
        accessorFn: (r) => r.matterList.length,
        header: c.matters,
        cell: ({ row }) => {
          const list = row.original.matterList;
          if (list.length === 0)
            return (
              <span className="text-muted-foreground">{copy.noMatters}</span>
            );
          return (
            <span className="whitespace-nowrap tabular-nums">
              <Link
                href={`/dashboard/matters/${list[0].id}`}
                className="underline-offset-4 hover:underline"
              >
                {list[0].id}
              </Link>
              {list.length > 1 && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {copy.moreMatters(list.length - 1)}
                </span>
              )}
            </span>
          );
        },
      },
      {
        id: "attorney",
        accessorFn: (r) =>
          r.leadAttorneyId ? userName(r.leadAttorneyId) : "~",
        header: c.attorney,
        cell: ({ row }) => (
          <UserChip
            userId={row.original.leadAttorneyId}
            fallback="—"
            className="whitespace-nowrap"
          />
        ),
      },
      {
        id: "balance",
        accessorFn: (r) => r.balance,
        header: c.balance,
        cell: ({ row }) => (
          <span
            className={cn(
              "whitespace-nowrap tabular-nums",
              row.original.overdue
                ? "text-[#A23B3B]"
                : row.original.balance === 0 && "text-muted-foreground",
            )}
          >
            {formatMoney(row.original.balance, true)}
          </span>
        ),
      },
      {
        id: "portal",
        accessorFn: (r) => r.portalStatus ?? "not_invited",
        header: c.portal,
        cell: ({ row }) => <PortalBadge status={row.original.portalStatus} />,
      },
      {
        id: "since",
        accessorFn: (r) => r.since,
        header: c.since,
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-muted-foreground tabular-nums">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{c.actions}</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions client={row.original} />
          </div>
        ),
        enableSorting: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (r) => r.id,
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
    if (!event.currentTarget.contains(target) || target.closest("a, button"))
      return;
    router.push(`/dashboard/clients/${id}`);
  }

  const activeCount = rowsAll.filter((r) => r.active).length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title={copy.title}
        description={status === "ready" ? copy.subtitle(activeCount) : " "}
        actions={
          <Button size="sm" className="h-9" onClick={() => setDialogOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} />
            {copy.newClient}
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
                    className={cn(
                      "cursor-pointer",
                      row.original.archived && "opacity-60",
                    )}
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

        <div className="flex items-center justify-between gap-3 text-sm">
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

      <ClientDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
