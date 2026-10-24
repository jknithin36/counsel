"use client";

import {
  Add01Icon,
  Delete02Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { contentPage, editorCopy } from "@/lib/content/dashboard-admin";
import type { PracticeAreaSlug } from "@/lib/content/practice-areas";
import type { CaseResult } from "@/lib/content/results";
import {
  useAllAttorneys,
  usePracticeAreas,
  useResults,
} from "@/lib/site-content";
import { EditorCard, IconAction, SortableList, useDirty } from "../editor-kit";
import { StatusBadge } from "../status-badge";
import {
  ChoiceSelect,
  ConfirmDelete,
  EditorSheet,
  newId,
  publish,
  usePublished,
} from "./shared";

const copy = contentPage.results;
const s = copy.sheet;

export function ResultsEditor() {
  const id = useId();
  const live = useResults();
  const areas = usePracticeAreas();
  const published = usePublished("results");
  const [items, setItems] = useState(live.items);
  const [disclaimer, setDisclaimer] = useState(live.disclaimer);
  const dirty = useDirty({ items, disclaimer }, live);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<CaseResult | null>(null);
  const areaTitle = (slug: string) =>
    areas.find((a) => a.slug === slug)?.title ?? slug;
  const disclaimerError = disclaimer.trim() ? "" : editorCopy.required;

  return (
    <>
      <EditorCard
        title={copy.title}
        description={copy.description}
        published={published}
        dirty={dirty}
        canSave={!disclaimerError}
        onDiscard={() => {
          setItems(live.items);
          setDisclaimer(live.disclaimer);
        }}
        onSave={() =>
          publish(
            "results",
            { results: items, resultsDisclaimer: disclaimer.trim() },
            copy.savedName,
          )
        }
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setEditing("new")}
          >
            <HugeiconsIcon
              icon={Add01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {copy.add}
          </Button>
        }
      >
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            {copy.empty}
          </p>
        ) : (
          <SortableList
            items={items}
            getId={(r) => r.id}
            getLabel={(r) => `${r.amount} ${r.type}`}
            onReorder={setItems}
            renderItem={(r) => (
              <>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                    <span className="tabular-nums">{r.amount}</span>
                    <span className="font-normal text-muted-foreground">
                      {r.type}
                    </span>
                    {r.featured && <StatusBadge>{copy.featured}</StatusBadge>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {areaTitle(r.area)} · {r.year} · {r.summary}
                  </p>
                </div>
                <IconAction
                  label={editorCopy.edit(`${r.amount} ${r.type}`)}
                  icon={PencilEdit02Icon}
                  onClick={() => setEditing(r.id)}
                />
                <IconAction
                  label={editorCopy.remove(`${r.amount} ${r.type}`)}
                  icon={Delete02Icon}
                  onClick={() => setDeleting(r)}
                />
              </>
            )}
          />
        )}

        <Field data-invalid={Boolean(disclaimerError) || undefined}>
          <FieldLabel htmlFor={`${id}-disclaimer`}>
            {copy.disclaimer}
          </FieldLabel>
          <Textarea
            id={`${id}-disclaimer`}
            rows={2}
            value={disclaimer}
            aria-invalid={Boolean(disclaimerError) || undefined}
            onChange={(e) => setDisclaimer(e.target.value)}
          />
          {disclaimerError ? (
            <FieldError>{disclaimerError}</FieldError>
          ) : (
            <FieldDescription>{copy.disclaimerHint}</FieldDescription>
          )}
        </Field>
      </EditorCard>

      <ConfirmDelete
        name={deleting && `${deleting.amount} ${deleting.type}`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          setItems((list) => list.filter((x) => x.id !== deleting?.id));
          setDeleting(null);
        }}
      />

      {editing && (
        <ResultSheet
          key={editing}
          result={items.find((r) => r.id === editing)}
          onOpenChange={(open) => !open && setEditing(null)}
          onDone={(result) =>
            setItems((list) =>
              list.some((r) => r.id === result.id)
                ? list.map((r) => (r.id === result.id ? result : r))
                : [result, ...list],
            )
          }
        />
      )}
    </>
  );
}

function ResultSheet({
  result,
  onOpenChange,
  onDone,
}: {
  result?: CaseResult;
  onOpenChange: (open: boolean) => void;
  onDone: (result: CaseResult) => void;
}) {
  const id = useId();
  const areas = usePracticeAreas();
  const attorneys = useAllAttorneys();
  const [r, setR] = useState<CaseResult>(
    () =>
      result ?? {
        id: newId("r"),
        amount: "",
        type: "Settlement",
        area: areas[0].slug,
        summary: "",
        year: new Date().getFullYear(),
        attorney: attorneys[0]?.slug ?? "",
      },
  );
  const [submitted, setSubmitted] = useState(false);
  const set = (patch: Partial<CaseResult>) => setR((x) => ({ ...x, ...patch }));
  const errors = {
    amount: r.amount.trim() ? "" : editorCopy.required,
    summary: r.summary.trim() ? "" : editorCopy.required,
  };
  const show = (m: string) => (submitted && m ? m : undefined);

  return (
    <EditorSheet
      open
      onOpenChange={onOpenChange}
      title={result ? s.editTitle : s.newTitle}
      description={s.description}
      onDone={() => {
        setSubmitted(true);
        if (errors.amount || errors.summary) return false;
        onDone({ ...r, amount: r.amount.trim(), summary: r.summary.trim() });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(show(errors.amount)) || undefined}>
          <FieldLabel htmlFor={`${id}-amount`}>{s.amount}</FieldLabel>
          <Input
            id={`${id}-amount`}
            value={r.amount}
            aria-invalid={Boolean(show(errors.amount)) || undefined}
            onChange={(e) => set({ amount: e.target.value })}
          />
          {show(errors.amount) ? (
            <FieldError>{show(errors.amount)}</FieldError>
          ) : (
            <FieldDescription>{s.amountHint}</FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-type`}>{s.type}</FieldLabel>
          <ChoiceSelect
            id={`${id}-type`}
            value={r.type}
            onChange={(type) => set({ type: type as CaseResult["type"] })}
            options={copy.types.map((t) => ({ value: t, label: t }))}
          />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor={`${id}-area`}>{s.area}</FieldLabel>
        <ChoiceSelect
          id={`${id}-area`}
          value={r.area}
          onChange={(area) => set({ area: area as PracticeAreaSlug })}
          options={areas.map((a) => ({ value: a.slug, label: a.title }))}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${id}-attorney`}>{s.attorney}</FieldLabel>
          <ChoiceSelect
            id={`${id}-attorney`}
            value={r.attorney}
            onChange={(attorney) => set({ attorney })}
            options={attorneys.map((a) => ({ value: a.slug, label: a.name }))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-year`}>{s.year}</FieldLabel>
          <Input
            id={`${id}-year`}
            type="number"
            inputMode="numeric"
            min={1990}
            max={2100}
            value={r.year}
            onChange={(e) => set({ year: Number(e.target.value) })}
          />
        </Field>
      </div>
      <Field data-invalid={Boolean(show(errors.summary)) || undefined}>
        <FieldLabel htmlFor={`${id}-summary`}>{s.summary}</FieldLabel>
        <Textarea
          id={`${id}-summary`}
          rows={4}
          value={r.summary}
          aria-invalid={Boolean(show(errors.summary)) || undefined}
          onChange={(e) => set({ summary: e.target.value })}
        />
        <FieldError>{show(errors.summary)}</FieldError>
      </Field>
      <Field orientation="horizontal">
        <Switch
          id={`${id}-featured`}
          checked={Boolean(r.featured)}
          onCheckedChange={(featured) => set({ featured })}
        />
        <FieldLabel htmlFor={`${id}-featured`}>{s.featured}</FieldLabel>
      </Field>
    </EditorSheet>
  );
}
