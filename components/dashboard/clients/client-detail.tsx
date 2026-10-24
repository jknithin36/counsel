"use client";

import {
  Call02Icon,
  Copy01Icon,
  Delete02Icon,
  Mail01Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import {
  notFound,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  clientDialog,
  clientDetail as copy,
} from "@/lib/content/dashboard-office";
import {
  addClientNote,
  deleteClientNote,
  setClientArchived,
} from "@/lib/data/clients";
import {
  matterStatusLabels,
  paymentMethodLabels,
  practiceAreaLabel,
} from "@/lib/data/labels";
import { invoiceBalance, OPEN_STATUSES } from "@/lib/data/selectors";
import { stageLabel } from "@/lib/data/stages";
import { useDemoStore } from "@/lib/data/store";
import { formatDate, formatMoney, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { InvoicesTable } from "../billing/invoices-table";
import { useDemoStatus } from "../demo-data-provider";
import { DocumentsTable } from "../documents/documents-table";
import { UserChip } from "../leads/lead-badges";
import { matterStatusTones } from "../matters/matter-bits";
import { MatterDialog } from "../matters/matter-dialog";
import { PageSkeleton } from "../page-skeleton";
import { SectionCard } from "../section-card";
import { StatusBadge } from "../status-badge";
import { TipButton } from "../tip-button";
import { ClientAvatar, PortalBadge, useClientRows } from "./client-bits";
import { ClientDialog } from "./client-dialog";
import { invite, messageClient } from "./clients-page";

const tabValues = copy.tabs.map((t) => t.value);

function CopyButton({ value, what }: { value: string; what: string }) {
  return (
    <TipButton
      variant="ghost"
      size="icon-sm"
      aria-label={copy.copy(what.toLowerCase())}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.add({ title: copy.copied(what) });
        } catch {}
      }}
    >
      <HugeiconsIcon icon={Copy01Icon} />
    </TipButton>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

export function ClientDetail({ id }: { id: string }) {
  const status = useDemoStatus();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const row = useClientRows().find((c) => c.id === id);
  const documents = useDemoStore((s) => s.documents);
  const invoices = useDemoStore((s) => s.invoices);
  const payments = useDemoStore((s) => s.payments);
  const activity = useDemoStore((s) => s.activityLog);
  const userId = useDemoStore((s) => s.session?.userId);
  const [editOpen, setEditOpen] = useState(false);
  const [matterOpen, setMatterOpen] = useState(false);
  const [note, setNote] = useState("");

  const requested = params.get("tab") ?? "overview";
  const tab = tabValues.includes(requested) ? requested : "overview";
  const setTab = (next: string) => {
    const qs = new URLSearchParams(params.toString());
    if (next === "overview") qs.delete("tab");
    else qs.set("tab", next);
    const q = qs.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  if (status !== "ready") return <PageSkeleton />;
  if (!row) notFound();

  const o = copy.overview;
  const matterIds = new Set(row.matterList.map((m) => m.id));
  const docs = documents
    .filter((d) => matterIds.has(d.matterId))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const mine = invoices
    .filter((i) => i.clientId === row.id)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  const open = mine.filter((i) => OPEN_STATUSES.includes(i.status));
  const paid = payments
    .filter((p) => p.clientId === row.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const recent = activity
    .filter(
      (e) =>
        e.href &&
        (e.href.includes(`/clients/${row.id}`) ||
          [...matterIds].some((m) => e.href?.includes(m)) ||
          mine.some((i) => e.href?.includes(i.id)) ||
          (row.leadId && e.href.includes(row.leadId))),
    )
    .slice(0, 6);
  const appointments = row.matterList.flatMap((m) =>
    m.nextAppointment && new Date(m.nextAppointment.start) > new Date()
      ? [{ matter: m, ...m.nextAppointment }]
      : [],
  );

  function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() || !row) return;
    addClientNote(row.id, note);
    setNote("");
    toast.add({ title: copy.notes.added });
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <ClientAvatar name={row.name} size="lg" className="mt-1" />
          <div className="min-w-0">
            <h1 className="text-[32px] leading-tight">{row.name}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <PortalBadge status={row.portalStatus} />
              <StatusBadge>{row.language}</StatusBadge>
              {row.archived && <StatusBadge>{copy.archive}d</StatusBadge>}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {row.phone && (
                <span className="flex items-center gap-1">
                  <a
                    href={`tel:${row.phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-1.5 tabular-nums underline-offset-4 hover:underline"
                  >
                    <HugeiconsIcon
                      icon={Call02Icon}
                      className="size-4 text-muted-foreground"
                    />
                    {row.phone}
                  </a>
                  <CopyButton value={row.phone} what={o.phone} />
                </span>
              )}
              {row.email && (
                <span className="flex min-w-0 items-center gap-1">
                  <a
                    href={`mailto:${row.email}`}
                    className="flex min-w-0 items-center gap-1.5 underline-offset-4 hover:underline"
                  >
                    <HugeiconsIcon
                      icon={Mail01Icon}
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    <span className="truncate">{row.email}</span>
                  </a>
                  <CopyButton value={row.email} what={o.email} />
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-input"
            onClick={() => messageClient(row, router.push)}
          >
            {copy.message}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-input"
            onClick={() => setMatterOpen(true)}
          >
            {copy.newMatter}
          </Button>
          <Button
            size="sm"
            className="h-9"
            disabled={row.portalStatus === "active"}
            onClick={() => invite(row)}
          >
            {row.portalStatus === "invited" ? copy.resend : copy.invite}
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
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                {copy.edit}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setClientArchived(row.id, !row.archived)}
              >
                {row.archived ? copy.restore : copy.archive}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
          <div className="grid items-start gap-4 lg:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
              <SectionCard title={o.matters}>
                {row.matterList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{o.noMatters}</p>
                ) : (
                  <ul className="flex flex-col divide-y">
                    {row.matterList.map((m) => (
                      <li
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <span className="block text-xs text-muted-foreground tabular-nums">
                            {m.id}
                          </span>
                          <Link
                            href={`/dashboard/matters/${m.id}`}
                            className="font-medium underline-offset-4 hover:underline"
                          >
                            {m.title}
                          </Link>
                        </div>
                        <div className="flex gap-1.5">
                          <StatusBadge>
                            {stageLabel(m.practiceArea, m.stage)}
                          </StatusBadge>
                          <StatusBadge tone={matterStatusTones[m.status]}>
                            {matterStatusLabels[m.status]}
                          </StatusBadge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
              <SectionCard title={o.activity}>
                {recent.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {o.noActivity}
                  </p>
                ) : (
                  <ol className="flex flex-col gap-3">
                    {recent.map((e) => (
                      <li key={e.id} className="text-sm">
                        <Link
                          href={e.href ?? "#"}
                          className="underline-offset-4 hover:underline"
                        >
                          {e.message}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          {timeAgo(e.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </SectionCard>
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <SectionCard title={o.contact}>
                <dl className="flex flex-col divide-y">
                  <Row label={o.address}>{row.address}</Row>
                  <Row label={o.preferred}>
                    {row.preferredContact
                      ? clientDialog.methods[row.preferredContact]
                      : "—"}
                  </Row>
                  <Row label={o.language}>{row.language}</Row>
                  <Row label={o.since}>
                    <span className="tabular-nums">
                      {formatDate(row.since)}
                    </span>
                  </Row>
                  <Row label={o.balance}>
                    <span
                      className={cn(
                        "tabular-nums",
                        row.overdue && "text-[#A23B3B]",
                      )}
                    >
                      {formatMoney(row.balance, true)}
                    </span>
                  </Row>
                  <Row label={o.trust}>
                    <span className="tabular-nums">
                      {formatMoney(row.trustBalance, true)}
                    </span>
                  </Row>
                </dl>
              </SectionCard>
              <SectionCard title={o.invoices}>
                {open.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {o.noInvoices}
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y text-sm">
                    {open.map((inv) => (
                      <li
                        key={inv.id}
                        className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                      >
                        <Link
                          href={`/dashboard/billing/invoices/${inv.id}`}
                          className="tabular-nums underline-offset-4 hover:underline"
                        >
                          {inv.id}
                          <span className="block text-xs text-muted-foreground">
                            Due {formatDate(inv.dueAt)}
                          </span>
                        </Link>
                        <span
                          className={cn(
                            "tabular-nums",
                            inv.status === "overdue" && "text-[#A23B3B]",
                          )}
                        >
                          {formatMoney(invoiceBalance(inv, payments), true)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
              <SectionCard title={o.appointments}>
                {appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {o.noAppointments}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2 text-sm">
                    {appointments.map((a) => (
                      <li key={a.matter.id}>
                        <span className="tabular-nums">
                          {formatDate(a.start, true)}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {a.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matters">
          <SectionCard title={copy.tabs[1].label} contentClassName="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">
                    {copy.matters.columns.matter}
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {copy.matters.columns.area}
                  </TableHead>
                  <TableHead>{copy.matters.columns.stage}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {copy.matters.columns.attorney}
                  </TableHead>
                  <TableHead className="pr-4">
                    {copy.matters.columns.opened}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {row.matterList.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-4">
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {m.id}
                      </span>
                      <Link
                        href={`/dashboard/matters/${m.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {m.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {practiceAreaLabel(m.practiceArea)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <StatusBadge>
                          {stageLabel(m.practiceArea, m.stage)}
                        </StatusBadge>
                        <StatusBadge tone={matterStatusTones[m.status]}>
                          {matterStatusLabels[m.status]}
                        </StatusBadge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <UserChip userId={m.leadAttorneyId} fallback="—" />
                    </TableCell>
                    <TableCell className="pr-4 whitespace-nowrap text-muted-foreground tabular-nums">
                      {formatDate(m.openedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>

        <TabsContent value="documents">
          <SectionCard title={copy.tabs[2].label} contentClassName="px-0">
            <DocumentsTable documents={docs} showMatter />
          </SectionCard>
        </TabsContent>

        <TabsContent value="billing">
          <div className="grid items-start gap-4 lg:grid-cols-3">
            <SectionCard
              title={copy.billing.invoices}
              className="lg:col-span-2"
              contentClassName="px-0"
            >
              <InvoicesTable invoices={mine} showClient={false} />
            </SectionCard>
            <div className="flex flex-col gap-4">
              <SectionCard title={copy.billing.trust}>
                <p className="font-serif text-[32px] leading-none tabular-nums">
                  {formatMoney(row.trustBalance, true)}
                </p>
              </SectionCard>
              <SectionCard title={copy.billing.payments}>
                {paid.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {copy.billing.noPayments}
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y text-sm">
                    {paid.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                      >
                        <span>
                          {p.invoiceId}
                          <span className="block text-xs text-muted-foreground tabular-nums">
                            {formatDate(p.date)} ·{" "}
                            {paymentMethodLabels[p.method]}
                          </span>
                        </span>
                        <span className="tabular-nums">
                          {formatMoney(p.amount, true)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <SectionCard title={copy.tabs[4].label}>
            <form onSubmit={addNote} className="flex flex-col gap-2">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={copy.notes.placeholder}
                aria-label={copy.notes.placeholder}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  className="h-8"
                  disabled={!note.trim()}
                >
                  {copy.notes.add}
                </Button>
              </div>
            </form>
            {(row.notes ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {copy.notes.empty}
              </p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y">
                {(row.notes ?? []).map((n) => (
                  <li
                    key={n.id}
                    className="flex gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{n.author}</span>{" "}
                        <span className="text-xs text-muted-foreground">
                          · {timeAgo(n.createdAt)}
                        </span>
                      </p>
                      <p className="mt-1 text-sm leading-relaxed whitespace-pre-line">
                        {n.body}
                      </p>
                    </div>
                    {n.authorId === userId && (
                      <TipButton
                        variant="ghost"
                        size="icon-sm"
                        aria-label={copy.notes.delete}
                        onClick={() => {
                          deleteClientNote(row.id, n.id);
                          toast.add({ title: copy.notes.deleted });
                        }}
                      >
                        <HugeiconsIcon icon={Delete02Icon} />
                      </TipButton>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      <ClientDialog open={editOpen} onOpenChange={setEditOpen} client={row} />
      <MatterDialog
        open={matterOpen}
        onOpenChange={setMatterOpen}
        clientId={row.id}
      />
    </div>
  );
}
