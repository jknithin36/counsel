"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { firm } from "@/lib/config/firm";
import { conflictsPage as copy } from "@/lib/content/dashboard-practice";
import {
  nameTokens,
  saveConflictCheck,
  searchConflicts,
} from "@/lib/data/conflicts";
import { currentUser } from "@/lib/data/leads";
import { userName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { ConflictResult, MatchStrength } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { useDemoStatus } from "../demo-data-provider";
import { UserChip } from "../leads/lead-badges";
import { PageHeader } from "../page-header";
import { PageSkeleton } from "../page-skeleton";
import { SectionCard } from "../section-card";
import { StatusBadge, type Tone } from "../status-badge";

type Check = {
  query: string;
  related: string[];
  includeClosed: boolean;
  includeLeads: boolean;
  results: ConflictResult[];
  checkedAt: string;
  checkedBy: string;
  savedId?: string;
};

const strengthTone: Record<MatchStrength, Tone> = {
  exact: "red",
  strong: "amber",
  possible: "neutral",
};

/** The name with its matching words highlighted. */
function Highlighted({ name, matched }: { name: string; matched: string[] }) {
  const set = new Set(matched);
  let at = 0;
  const parts = name.split(/(\s+)/).map((text) => {
    const part = { text, at, hit: set.has(nameTokens(text)[0] ?? "") };
    at += text.length;
    return part;
  });
  return (
    <>
      {parts.map((part) =>
        part.hit ? (
          <mark
            key={part.at}
            className="rounded-sm bg-[#FBF1DE] px-0.5 text-foreground"
          >
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
}

export function ConflictsPage() {
  const status = useDemoStatus();
  const ids = useId();
  const history = useDemoStore((s) => s.conflictChecks);
  const [name, setName] = useState("");
  const [related, setRelated] = useState("");
  const [includeClosed, setIncludeClosed] = useState(true);
  const [includeLeads, setIncludeLeads] = useState(true);
  const [error, setError] = useState(false);
  const [check, setCheck] = useState<Check | null>(null);
  const [printOpen, setPrintOpen] = useState(false);

  if (status !== "ready") return <PageSkeleton />;

  function run(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError(true);
      return;
    }
    setError(false);
    const relatedNames = related
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    const results = searchConflicts(useDemoStore.getState(), {
      names: [name, ...relatedNames],
      includeClosed,
      includeLeads,
    });
    setCheck({
      query: name.trim(),
      related: relatedNames,
      includeClosed,
      includeLeads,
      results,
      checkedAt: new Date().toISOString(),
      checkedBy: currentUser().id,
    });
  }

  function save() {
    if (!check) return;
    const { savedId: _, checkedAt: _a, checkedBy: _b, ...rest } = check;
    const saved = saveConflictCheck(rest);
    setCheck({ ...check, savedId: saved.id, checkedAt: saved.checkedAt });
    toast.add({ title: copy.results.saved });
  }

  const r = copy.results;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader title={copy.title} description={copy.subtitle} />

      <SectionCard title={copy.search.title}>
        <form onSubmit={run} className="flex flex-col gap-4">
          <Field data-invalid={error || undefined}>
            <FieldLabel htmlFor={`${ids}-name`}>{copy.search.name}</FieldLabel>
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={`${ids}-name`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={copy.search.namePlaceholder}
                aria-invalid={error || undefined}
                className="h-12 pl-10 text-base md:text-base"
                autoComplete="off"
              />
            </div>
            <FieldError>{error ? copy.search.required : undefined}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-related`}>
              {copy.search.related}
            </FieldLabel>
            <Input
              id={`${ids}-related`}
              value={related}
              onChange={(e) => setRelated(e.target.value)}
              placeholder={copy.search.relatedPlaceholder}
              className="h-9"
              autoComplete="off"
            />
          </Field>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: the switch renders inside the label */}
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={includeClosed}
                onCheckedChange={setIncludeClosed}
              />
              {copy.search.includeClosed}
            </label>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: the switch renders inside the label */}
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={includeLeads}
                onCheckedChange={setIncludeLeads}
              />
              {copy.search.includeLeads}
            </label>
            <Button type="submit" size="sm" className="h-9 sm:ml-auto">
              {copy.search.run}
            </Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title={r.title}
        action={
          check && (
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-input"
                onClick={() => setPrintOpen(true)}
              >
                {r.print}
              </Button>
              <Button
                size="sm"
                className="h-8"
                disabled={Boolean(check.savedId)}
                onClick={save}
              >
                {r.save}
              </Button>
            </div>
          )
        }
      >
        {!check ? (
          <p className="text-sm text-muted-foreground">{r.idle}</p>
        ) : (
          <div className="flex flex-col gap-4" aria-live="polite">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {check.results.length === 0 ? (
                <StatusBadge tone="green">{r.clear}</StatusBadge>
              ) : (
                <span className="font-medium">
                  {r.summary(check.results.length, check.query)}
                </span>
              )}
              <span className="text-xs text-muted-foreground tabular-nums">
                {r.checked(formatDate(check.checkedAt, true))}
              </span>
            </div>
            {check.results.length > 0 && (
              <ResultsTable results={check.results} />
            )}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={copy.history.title}
        description={copy.history.description}
        contentClassName="px-0"
      >
        {history.length === 0 ? (
          <p className="px-4 text-sm text-muted-foreground">
            {copy.history.empty}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">
                  {copy.history.columns.query}
                </TableHead>
                <TableHead>{copy.history.columns.results}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {copy.history.columns.by}
                </TableHead>
                <TableHead className="pr-4">
                  {copy.history.columns.date}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((saved) => (
                <TableRow
                  key={saved.id}
                  data-state={
                    check?.savedId === saved.id ? "selected" : undefined
                  }
                >
                  <TableCell className="pl-4">
                    <button
                      type="button"
                      className="text-left font-medium underline-offset-4 hover:underline"
                      onClick={() => {
                        setCheck({ ...saved, savedId: saved.id });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {saved.query}
                      {saved.related.length > 0 && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          + {saved.related.join(", ")}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    {saved.results.length === 0 ? (
                      <StatusBadge tone="green">
                        {copy.history.none}
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="amber">
                        {saved.results.length}
                      </StatusBadge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {userName(saved.checkedBy)}
                  </TableCell>
                  <TableCell className="pr-4 whitespace-nowrap text-muted-foreground tabular-nums">
                    {formatDate(saved.checkedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      {check && (
        <Dialog open={printOpen} onOpenChange={setPrintOpen}>
          <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
            <div data-print-area className="flex flex-col gap-5">
              <DialogHeader>
                <DialogTitle className="text-[26px]">
                  {copy.report.title}
                </DialogTitle>
              </DialogHeader>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {copy.report.query}
                  </dt>
                  <dd className="mt-0.5">
                    {[check.query, ...check.related].join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {copy.report.options}
                  </dt>
                  <dd className="mt-0.5">
                    {check.includeClosed
                      ? copy.report.closedYes
                      : copy.report.closedNo}{" "}
                    ·{" "}
                    {check.includeLeads
                      ? copy.report.leadsYes
                      : copy.report.leadsNo}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {copy.report.checkedBy}
                  </dt>
                  <dd className="mt-0.5">{userName(check.checkedBy)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {copy.report.date}
                  </dt>
                  <dd className="mt-0.5 tabular-nums">
                    {formatDate(check.checkedAt, true)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">
                    {copy.report.firm}
                  </dt>
                  <dd className="mt-0.5">{firm.legalName}</dd>
                </div>
              </dl>
              {check.results.length === 0 ? (
                <p className="text-sm">{copy.report.none}</p>
              ) : (
                <ResultsTable results={check.results} plain />
              )}
              <p className="text-xs text-muted-foreground">
                {copy.report.disclaimer}
              </p>
            </div>
            <DialogFooter className="print:hidden">
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => setPrintOpen(false)}
              >
                {copy.report.close}
              </Button>
              <Button size="sm" className="h-9" onClick={() => window.print()}>
                {copy.report.print}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ResultsTable({
  results,
  plain = false,
}: {
  results: ConflictResult[];
  plain?: boolean;
}) {
  const r = copy.results;
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-3">{r.columns.name}</TableHead>
            <TableHead>{r.columns.relationship}</TableHead>
            <TableHead>{r.columns.record}</TableHead>
            <TableHead>{r.columns.status}</TableHead>
            <TableHead>{r.columns.attorney}</TableHead>
            <TableHead className="pr-3">{r.columns.strength}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((m) => (
            <TableRow key={`${m.name}-${m.relationship}-${m.href}`}>
              <TableCell className="pl-3 font-medium whitespace-nowrap">
                <Highlighted name={m.name} matched={m.matched} />
              </TableCell>
              <TableCell>
                <StatusBadge>{r.relationship[m.relationship]}</StatusBadge>
              </TableCell>
              <TableCell className="min-w-44">
                {plain ? (
                  <span>
                    {m.matterId
                      ? `${m.matterId} · ${m.matterTitle}`
                      : `${r.lead} ${m.leadId}`}
                  </span>
                ) : (
                  <Link
                    href={m.href}
                    className="underline-offset-4 hover:underline"
                  >
                    <span className="tabular-nums">
                      {m.matterId ?? `${r.lead} ${m.leadId}`}
                    </span>
                    {m.matterTitle && (
                      <span className="block max-w-60 truncate text-xs text-muted-foreground">
                        {m.matterTitle}
                      </span>
                    )}
                  </Link>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {m.status}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {plain ? (
                  m.leadAttorneyId ? (
                    userName(m.leadAttorneyId)
                  ) : (
                    "—"
                  )
                ) : (
                  <UserChip userId={m.leadAttorneyId} fallback="—" />
                )}
              </TableCell>
              <TableCell className="pr-3">
                <StatusBadge tone={strengthTone[m.strength]}>
                  {r.strength[m.strength]}
                </StatusBadge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
