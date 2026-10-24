"use client";

import {
  Call02Icon,
  Copy01Icon,
  Delete02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { getAttorney } from "@/lib/content/attorneys";
import { leadDetail as copy } from "@/lib/content/dashboard-leads";
import { suggestedAttorney } from "@/lib/data/attorneys";
import { conflictQuery, runConflictCheck } from "@/lib/data/conflicts";
import { cancelConsultation, scheduledFor } from "@/lib/data/consultations";
import { meetingTypeLabels, sourceLabels } from "@/lib/data/labels";
import { addNote, deleteNote } from "@/lib/data/leads";
import { userName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { Lead } from "@/lib/data/types";
import { formatDate, initials, timeAgo } from "@/lib/format";
import { SectionCard } from "../section-card";
import { StatusBadge } from "../status-badge";
import { TipButton } from "../tip-button";
import { AttorneySelect } from "./attorney-select";
import { changeAssignee } from "./lead-actions-menu";
import { UrgencyBadge } from "./lead-badges";

/** A label/value row inside a card. */
function Item({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-full" : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

const muted = (text: string) => (
  <span className="text-muted-foreground">{text}</span>
);

export function IntakeCard({ lead }: { lead: Lead }) {
  const i = copy.intake;
  const preferred = lead.preferredAttorney
    ? getAttorney(lead.preferredAttorney)?.name
    : undefined;
  return (
    <SectionCard title={i.title}>
      <dl className="grid gap-5 sm:grid-cols-2">
        <Item label={i.description} wide>
          <p className="leading-relaxed whitespace-pre-line">
            {lead.description}
          </p>
        </Item>
        <Item label={i.incidentDate}>
          {lead.incidentDate
            ? format(new Date(lead.incidentDate), "MMM d, yyyy")
            : muted(i.none)}
        </Item>
        <Item label={i.urgency}>
          <UrgencyBadge value={lead.urgency} />
        </Item>
        <Item label={i.otherParty}>{lead.opposingParty || muted(i.none)}</Item>
        <Item label={i.meeting}>{meetingTypeLabels[lead.meetingType]}</Item>
        <Item label={i.times}>
          {lead.preferredTimes.length > 0
            ? lead.preferredTimes.join(", ")
            : muted(i.none)}
        </Item>
        <Item label={i.language}>{lead.language}</Item>
        <Item label={i.attorney}>{preferred ?? muted(i.noPreference)}</Item>
      </dl>
    </SectionCard>
  );
}

export function ConflictCard({ lead }: { lead: Lead }) {
  const c = copy.conflict;
  const result = lead.conflictCheck;

  function run() {
    const outcome = runConflictCheck(lead.id);
    if (outcome) toast.add({ title: c.done(outcome.matches.length) });
  }

  return (
    <SectionCard
      title={c.title}
      description={c.description(conflictQuery(lead).join(" and "))}
      action={
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-input"
          onClick={run}
        >
          {result ? c.rerun : c.run}
        </Button>
      }
    >
      <div id="conflict-check" className="scroll-mt-24">
        {!result ? (
          <p className="text-sm text-muted-foreground">{c.never}</p>
        ) : (
          <div className="flex flex-col gap-3" aria-live="polite">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={result.matches.length ? "amber" : "green"}>
                {result.matches.length ? c.potential : c.clear}
              </StatusBadge>
              <span className="text-xs text-muted-foreground">
                {c.lastRun(timeAgo(result.checkedAt))}
              </span>
            </div>
            {result.matches.length > 0 && (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-3">{c.columns.name}</TableHead>
                      <TableHead>{c.columns.relationship}</TableHead>
                      <TableHead className="pr-3">{c.columns.matter}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.matches.map((m) => (
                      <TableRow key={`${m.name}-${m.relationship}-${m.href}`}>
                        <TableCell className="pl-3 font-medium">
                          {m.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground capitalize">
                          {m.relationship}
                        </TableCell>
                        <TableCell className="pr-3">
                          <Link
                            href={m.href}
                            className="underline-offset-4 hover:underline"
                          >
                            {m.matterId ? (
                              <>
                                <span className="tabular-nums">
                                  {m.matterId}
                                </span>
                                <span className="block max-w-56 truncate text-xs text-muted-foreground">
                                  {m.matterTitle}
                                </span>
                              </>
                            ) : (
                              `${c.lead} ${m.leadId}`
                            )}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

export function NotesCard({ lead }: { lead: Lead }) {
  const n = copy.notes;
  const userId = useDemoStore((s) => s.session?.userId);
  const [draft, setDraft] = useState("");

  function add(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    addNote(lead.id, draft);
    setDraft("");
    toast.add({ title: n.added });
  }

  return (
    <SectionCard title={n.title}>
      <form onSubmit={add} className="flex flex-col gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={n.placeholder}
          aria-label={n.placeholder}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add(e);
          }}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            className="h-8"
            disabled={!draft.trim()}
          >
            {n.add}
          </Button>
        </div>
      </form>
      {lead.notes.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{n.empty}</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y">
          {lead.notes.map((note) => (
            <li key={note.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar size="sm" aria-hidden="true">
                <AvatarFallback className="text-[10px]">
                  {initials(note.author)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{note.author}</span>{" "}
                  <span className="text-xs text-muted-foreground">
                    · {timeAgo(note.createdAt)}
                  </span>
                </p>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-line">
                  {note.body}
                </p>
              </div>
              {note.authorId && note.authorId === userId && (
                <TipButton
                  variant="ghost"
                  size="icon-sm"
                  aria-label={n.delete}
                  onClick={() => {
                    deleteNote(lead.id, note.id);
                    toast.add({ title: n.deleted });
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
  );
}

export function LeadActivityCard({ lead }: { lead: Lead }) {
  const events = [...lead.activity].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  return (
    <SectionCard title={copy.activity.title}>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.activity.empty}</p>
      ) : (
        <ol className="flex flex-col">
          {events.map((event, i) => (
            <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < events.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-3 left-[3px] h-full w-px bg-border"
                />
              )}
              <span
                aria-hidden="true"
                className="relative mt-1.5 size-[7px] shrink-0 rounded-full bg-foreground"
              />
              <div className="min-w-0">
                <p className="text-sm leading-snug">{event.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                  {formatDate(event.createdAt, true)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}

function CopyButton({ value, what }: { value: string; what: string }) {
  const c = copy.contact;
  return (
    <TipButton
      variant="ghost"
      size="icon-sm"
      aria-label={c.copy(what.toLowerCase())}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.add({ title: c.copied(what) });
        } catch {}
      }}
    >
      <HugeiconsIcon icon={Copy01Icon} />
    </TipButton>
  );
}

export function ContactCard({ lead }: { lead: Lead }) {
  const c = copy.contact;
  return (
    <SectionCard title={c.title}>
      <dl className="flex flex-col gap-4">
        {lead.phone && (
          <div>
            <dt className="text-xs text-muted-foreground">{c.phone}</dt>
            <dd className="mt-1 flex items-center justify-between gap-2">
              <a
                href={`tel:${lead.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-2 text-sm tabular-nums underline-offset-4 hover:underline"
              >
                <HugeiconsIcon
                  icon={Call02Icon}
                  className="size-4 text-muted-foreground"
                />
                {lead.phone}
              </a>
              <CopyButton value={lead.phone} what={c.phone} />
            </dd>
          </div>
        )}
        {lead.email && (
          <div>
            <dt className="text-xs text-muted-foreground">{c.email}</dt>
            <dd className="mt-1 flex items-center justify-between gap-2">
              <a
                href={`mailto:${lead.email}`}
                className="flex min-w-0 items-center gap-2 text-sm underline-offset-4 hover:underline"
              >
                <HugeiconsIcon
                  icon={Mail01Icon}
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="truncate">{lead.email}</span>
              </a>
              <CopyButton value={lead.email} what={c.email} />
            </dd>
          </div>
        )}
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <div>
            <dt className="text-xs text-muted-foreground">{c.preferred}</dt>
            <dd className="mt-1">
              <StatusBadge>{c.methods[lead.preferredContact]}</StatusBadge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{c.language}</dt>
            <dd className="mt-1 text-sm">{lead.language}</dd>
          </div>
        </div>
      </dl>
    </SectionCard>
  );
}

export function AssignmentCard({ lead }: { lead: Lead }) {
  const a = copy.assignment;
  const suggested = suggestedAttorney(lead.practiceArea);
  return (
    <SectionCard title={a.title}>
      <div className="flex flex-col gap-2">
        <AttorneySelect
          aria-label={a.label}
          area={lead.practiceArea}
          value={lead.assignedAttorney}
          onChange={(id) => changeAssignee(lead, id)}
          allowUnassigned
        />
        {lead.assignedAttorney !== suggested.id && (
          <p className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            {a.suggested(suggested.name)}
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => changeAssignee(lead, suggested.id)}
            >
              {a.useSuggested}
            </Button>
          </p>
        )}
      </div>
    </SectionCard>
  );
}

export function ConsultationCard({
  lead,
  onSchedule,
}: {
  lead: Lead;
  onSchedule: () => void;
}) {
  const c = copy.consultation;
  const consultations = useDemoStore((s) => s.consultations);
  const booked = scheduledFor(consultations, lead.id);
  return (
    <SectionCard title={c.title}>
      {booked ? (
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-medium tabular-nums">
              {format(new Date(booked.start), "EEE, MMM d · h:mm a")}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {c.with(userName(booked.attorneyId))} ·{" "}
              {meetingTypeLabels[booked.type]} · {booked.duration} min
            </p>
            {booked.notes && (
              <p className="mt-2 text-sm text-muted-foreground">
                {booked.notes}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-input"
              onClick={onSchedule}
            >
              {c.reschedule}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => {
                cancelConsultation(booked.id);
                toast.add({ title: c.cancelled });
              }}
            >
              {c.cancel}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{c.none}</p>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-input"
            onClick={onSchedule}
          >
            {c.schedule}
          </Button>
        </div>
      )}
    </SectionCard>
  );
}

export function SourceCard({ lead }: { lead: Lead }) {
  const s = copy.source;
  return (
    <SectionCard title={s.title}>
      <dl className="grid grid-cols-2 gap-4">
        <Item label={s.source}>{sourceLabels[lead.source]}</Item>
        <Item label={s.reference}>
          <span className="tabular-nums">{lead.id}</span>
        </Item>
        {lead.referralSource && (
          <Item label={s.referral} wide>
            {lead.referralSource}
          </Item>
        )}
        <Item label={s.submitted} wide>
          <span className="tabular-nums">
            {formatDate(lead.createdAt, true)}
          </span>
        </Item>
      </dl>
    </SectionCard>
  );
}
