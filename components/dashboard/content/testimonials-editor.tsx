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
import {
  defaultTestimonials,
  defaultTestimonialsDisclaimer,
} from "@/lib/config/defaults";
import { contentPage, editorCopy } from "@/lib/content/dashboard-admin";
import { useDemoStore } from "@/lib/data/store";
import type { SiteTestimonial } from "@/lib/data/types";
import { useAllAttorneys } from "@/lib/site-content";
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

const copy = contentPage.testimonials;
const s = copy.sheet;
const NONE = "none";

/** Every testimonial, hidden ones included (the site hook drops them). */
function useAllTestimonials() {
  const items =
    useDemoStore((st) => st.contentOverrides.testimonials) ??
    defaultTestimonials;
  const disclaimer =
    useDemoStore((st) => st.contentOverrides.testimonialsDisclaimer) ??
    defaultTestimonialsDisclaimer;
  return { items, disclaimer };
}

export function TestimonialsEditor() {
  const id = useId();
  const live = useAllTestimonials();
  const published = usePublished("testimonials");
  const [items, setItems] = useState(live.items);
  const [disclaimer, setDisclaimer] = useState(live.disclaimer);
  const dirty = useDirty({ items, disclaimer }, live);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<SiteTestimonial | null>(null);
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
            "testimonials",
            {
              testimonials: items,
              testimonialsDisclaimer: disclaimer.trim(),
            },
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
            getId={(t) => t.id}
            getLabel={(t) => t.name}
            onReorder={setItems}
            renderItem={(t) => (
              <>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                    {t.name}
                    <span className="font-normal text-muted-foreground">
                      {t.context}
                    </span>
                    {!t.visible && (
                      <StatusBadge>{copy.hiddenBadge}</StatusBadge>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    “{t.quote}”
                  </p>
                </div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: the switch renders inside the label */}
                <label className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                  <Switch
                    size="sm"
                    checked={t.visible}
                    aria-label={`${copy.visible}: ${t.name}`}
                    onCheckedChange={(visible) =>
                      setItems((list) =>
                        list.map((x) =>
                          x.id === t.id ? { ...x, visible } : x,
                        ),
                      )
                    }
                  />
                  {copy.visible}
                </label>
                <IconAction
                  label={editorCopy.edit(t.name)}
                  icon={PencilEdit02Icon}
                  onClick={() => setEditing(t.id)}
                />
                <IconAction
                  label={editorCopy.remove(t.name)}
                  icon={Delete02Icon}
                  onClick={() => setDeleting(t)}
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
        name={deleting?.name ?? null}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          setItems((list) => list.filter((x) => x.id !== deleting?.id));
          setDeleting(null);
        }}
      />

      {editing && (
        <TestimonialSheet
          key={editing}
          testimonial={items.find((t) => t.id === editing)}
          onOpenChange={(open) => !open && setEditing(null)}
          onDone={(t) =>
            setItems((list) =>
              list.some((x) => x.id === t.id)
                ? list.map((x) => (x.id === t.id ? t : x))
                : [...list, t],
            )
          }
        />
      )}
    </>
  );
}

function TestimonialSheet({
  testimonial,
  onOpenChange,
  onDone,
}: {
  testimonial?: SiteTestimonial;
  onOpenChange: (open: boolean) => void;
  onDone: (t: SiteTestimonial) => void;
}) {
  const id = useId();
  const attorneys = useAllAttorneys();
  const [t, setT] = useState<SiteTestimonial>(
    () =>
      testimonial ?? {
        id: newId("t"),
        quote: "",
        name: "",
        context: "",
        attorney: "",
        visible: true,
      },
  );
  const [submitted, setSubmitted] = useState(false);
  const set = (patch: Partial<SiteTestimonial>) =>
    setT((x) => ({ ...x, ...patch }));
  const errors = {
    quote: t.quote.trim() ? "" : editorCopy.required,
    name: t.name.trim() ? "" : editorCopy.required,
  };
  const show = (m: string) => (submitted && m ? m : undefined);

  return (
    <EditorSheet
      open
      onOpenChange={onOpenChange}
      title={testimonial ? s.editTitle : s.newTitle}
      description={s.description}
      onDone={() => {
        setSubmitted(true);
        if (errors.quote || errors.name) return false;
        onDone({
          ...t,
          quote: t.quote.trim(),
          name: t.name.trim(),
          context: t.context.trim(),
        });
      }}
    >
      <Field data-invalid={Boolean(show(errors.quote)) || undefined}>
        <FieldLabel htmlFor={`${id}-quote`}>{s.quote}</FieldLabel>
        <Textarea
          id={`${id}-quote`}
          rows={5}
          value={t.quote}
          aria-invalid={Boolean(show(errors.quote)) || undefined}
          onChange={(e) => set({ quote: e.target.value })}
        />
        <FieldError>{show(errors.quote)}</FieldError>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(show(errors.name)) || undefined}>
          <FieldLabel htmlFor={`${id}-name`}>{s.name}</FieldLabel>
          <Input
            id={`${id}-name`}
            value={t.name}
            aria-invalid={Boolean(show(errors.name)) || undefined}
            onChange={(e) => set({ name: e.target.value })}
          />
          {show(errors.name) ? (
            <FieldError>{show(errors.name)}</FieldError>
          ) : (
            <FieldDescription>{s.nameHint}</FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-context`}>{s.context}</FieldLabel>
          <Input
            id={`${id}-context`}
            value={t.context}
            onChange={(e) => set({ context: e.target.value })}
          />
          <FieldDescription>{s.contextHint}</FieldDescription>
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor={`${id}-attorney`}>{s.attorney}</FieldLabel>
        <ChoiceSelect
          id={`${id}-attorney`}
          value={t.attorney || NONE}
          onChange={(v) => set({ attorney: v === NONE ? "" : v })}
          options={[
            { value: NONE, label: s.noAttorney },
            ...attorneys.map((a) => ({ value: a.slug, label: a.name })),
          ]}
        />
      </Field>
      <Field orientation="horizontal">
        <Switch
          id={`${id}-visible`}
          checked={t.visible}
          onCheckedChange={(visible) => set({ visible })}
        />
        <FieldLabel htmlFor={`${id}-visible`}>{s.visible}</FieldLabel>
      </Field>
    </EditorSheet>
  );
}
