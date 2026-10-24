"use client";

import { ArrowLeft01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { isToday } from "date-fns";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { messagesPage as copy } from "@/lib/content/dashboard-office";
import { documentStatusLabels } from "@/lib/data/labels";
import { findDemoUser } from "@/lib/data/seed/users";
import { isClientAuthor, userName } from "@/lib/data/selectors";
import { stageLabel } from "@/lib/data/stages";
import { useDemoStore } from "@/lib/data/store";
import { formatDate, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ClientAvatar } from "../clients/client-bits";
import { useDemoStatus } from "../demo-data-provider";
import { PageSkeleton } from "../page-skeleton";
import { TipButton } from "../tip-button";
import { MessageThread } from "./message-thread";

/** Inbox: conversation list, thread, and (on wide screens) context. */
export function MessagesPage() {
  const status = useDemoStatus();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const threads = useDemoStore((s) => s.threads);
  const matters = useDemoStore((s) => s.matters);
  const clients = useDemoStore((s) => s.clients);
  const documents = useDemoStore((s) => s.documents);
  const userId = useDemoStore((s) => s.session?.userId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const selected = params.get("thread");

  const conversations = useMemo(
    () =>
      threads
        .map((t) => {
          const matter = matters.find((m) => m.id === t.matterId);
          const client = clients.find((c) => c.id === t.clientId);
          const last = t.messages.at(-1);
          return {
            thread: t,
            matter,
            client,
            last,
            unread: t.messages.filter(
              (m) => !m.read && isClientAuthor(m.authorId),
            ).length,
          };
        })
        .filter((c) => c.matter && c.client)
        .sort((a, b) =>
          (b.last?.sentAt ?? "").localeCompare(a.last?.sentAt ?? ""),
        ),
    [threads, matters, clients],
  );

  if (status !== "ready") return <PageSkeleton />;

  const q = query.trim().toLowerCase();
  const visible = conversations.filter((c) => {
    if (filter === "unread" && c.unread === 0) return false;
    if (filter === "mine" && !c.matter?.team.includes(userId ?? ""))
      return false;
    if (!q) return true;
    return `${c.client?.name} ${c.matter?.id} ${c.matter?.title} ${c.thread.messages.map((m) => m.body).join(" ")}`
      .toLowerCase()
      .includes(q);
  });
  const active = conversations.find((c) => c.thread.matterId === selected);

  const open = (matterId: string | null) => {
    const qs = new URLSearchParams(params.toString());
    if (matterId) qs.set("thread", matterId);
    else qs.delete("thread");
    const s = qs.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  const nextAppointment = active?.matter?.nextAppointment;
  const recentDocs = active
    ? documents
        .filter((d) => d.matterId === active.matter?.id)
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
        .slice(0, 3)
    : [];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <h1
        className={cn("text-[32px] leading-tight", active && "max-md:sr-only")}
      >
        {copy.title}
      </h1>
      <div className="grid h-[calc(100dvh-12rem)] min-h-[520px] overflow-hidden rounded-xl ring-1 ring-foreground/10 md:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr_280px]">
        {/* Conversation list */}
        <section
          aria-label={copy.title}
          className={cn(
            "flex min-h-0 flex-col border-r",
            active && "max-md:hidden",
          )}
        >
          <div className="flex flex-col gap-3 border-b p-3">
            <div className="relative">
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
            <Tabs value={filter} onValueChange={(v) => setFilter(v as string)}>
              <TabsList className="w-full">
                {copy.filters.map((f) => (
                  <TabsTrigger key={f.value} value={f.value}>
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {visible.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">
                {copy.empty}
              </li>
            )}
            {visible.map((c) => {
              const isActive = c.thread.matterId === selected;
              const sent = c.last ? new Date(c.last.sentAt) : null;
              return (
                <li key={c.thread.id}>
                  <button
                    type="button"
                    onClick={() => open(c.thread.matterId)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex w-full items-start gap-3 border-b px-3 py-3 text-left outline-none hover:bg-muted/60 focus-visible:bg-muted",
                      isActive && "bg-muted",
                    )}
                  >
                    <ClientAvatar name={c.client?.name ?? ""} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm",
                            c.unread ? "font-semibold" : "font-medium",
                          )}
                        >
                          {c.client?.name}
                        </span>
                        {sent && (
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {isToday(sent)
                              ? timeAgo(c.last?.sentAt ?? "")
                              : formatDate(c.last?.sentAt ?? "").replace(
                                  /, \d{4}$/,
                                  "",
                                )}
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {c.matter?.id}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2">
                        <span
                          className={cn(
                            "truncate text-xs",
                            c.unread
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {c.last?.internal ? `${copy.internal}: ` : ""}
                          {c.last?.body}
                        </span>
                        {c.unread > 0 && (
                          <span className="ml-auto size-2 shrink-0 rounded-full bg-[#2E5A8A]">
                            <span className="sr-only">{copy.unread}</span>
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Thread */}
        <section
          className={cn(
            "flex min-h-0 min-w-0 flex-col",
            !active && "max-md:hidden",
          )}
        >
          {active?.matter ? (
            <>
              <header className="flex items-center gap-2 border-b px-3 py-2.5 md:px-4">
                <TipButton
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label={copy.back}
                  onClick={() => open(null)}
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} />
                </TipButton>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-sans text-sm font-semibold tracking-normal">
                    {active.client?.name}
                  </h2>
                  <Link
                    href={`/dashboard/matters/${active.matter.id}`}
                    className="block truncate text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {active.matter.id} · {active.matter.title}
                  </Link>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden h-8 border-input sm:inline-flex"
                  nativeButton={false}
                  render={
                    <Link
                      href={`/dashboard/matters/${active.matter.id}?tab=messages`}
                    />
                  }
                >
                  {copy.viewMatter}
                </Button>
              </header>
              <MessageThread
                key={active.matter.id}
                matterId={active.matter.id}
                className="min-h-0 flex-1 p-3 md:p-4"
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
              <p className="font-medium">{copy.pick}</p>
              <p className="text-sm text-muted-foreground">{copy.pickHint}</p>
            </div>
          )}
        </section>

        {/* Context (desktop only) */}
        <aside className="hidden min-h-0 flex-col gap-5 overflow-y-auto border-l p-4 text-sm xl:flex">
          {active?.matter && active.client && (
            <>
              <div>
                <h3 className="font-sans text-xs font-normal tracking-normal text-muted-foreground">
                  {copy.context.client}
                </h3>
                <Link
                  href={`/dashboard/clients/${active.client.id}`}
                  className="mt-1 block font-medium underline-offset-4 hover:underline"
                >
                  {active.client.name}
                </Link>
                <a
                  href={`mailto:${active.client.email}`}
                  className="block truncate text-muted-foreground underline-offset-4 hover:underline"
                >
                  {active.client.email}
                </a>
                <a
                  href={`tel:${active.client.phone.replace(/\D/g, "")}`}
                  className="block text-muted-foreground tabular-nums underline-offset-4 hover:underline"
                >
                  {active.client.phone}
                </a>
              </div>
              <div>
                <h3 className="font-sans text-xs font-normal tracking-normal text-muted-foreground">
                  {copy.context.stage}
                </h3>
                <p className="mt-1">
                  {stageLabel(active.matter.practiceArea, active.matter.stage)}
                </p>
              </div>
              <div>
                <h3 className="font-sans text-xs font-normal tracking-normal text-muted-foreground">
                  {copy.context.team}
                </h3>
                <ul className="mt-1 flex flex-col gap-0.5">
                  {active.matter.team.map((id) => (
                    <li key={id}>
                      {userName(id)}
                      <span className="text-muted-foreground">
                        {" "}
                        · {findDemoUser(id)?.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-sans text-xs font-normal tracking-normal text-muted-foreground">
                  {copy.context.documents}
                </h3>
                {recentDocs.length === 0 ? (
                  <p className="mt-1 text-muted-foreground">
                    {copy.context.noDocuments}
                  </p>
                ) : (
                  <ul className="mt-1 flex flex-col gap-1.5">
                    {recentDocs.map((d) => (
                      <li key={d.id}>
                        <span className="block truncate">{d.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {documentStatusLabels[d.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="font-sans text-xs font-normal tracking-normal text-muted-foreground">
                  {copy.context.appointment}
                </h3>
                <p className="mt-1 tabular-nums">
                  {nextAppointment
                    ? formatDate(nextAppointment.start, true)
                    : copy.context.noAppointment}
                </p>
                {nextAppointment && (
                  <p className="text-xs text-muted-foreground">
                    {nextAppointment.label}
                  </p>
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
