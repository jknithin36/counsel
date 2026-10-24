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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { contentPage, editorCopy } from "@/lib/content/dashboard-admin";
import { type FaqCategory, faqCategories } from "@/lib/content/faq";
import type { SiteFaq } from "@/lib/data/types";
import { useFaqs } from "@/lib/site-content";
import { EditorCard, IconAction, SortableList, useDirty } from "../editor-kit";
import { StatusBadge } from "../status-badge";
import {
  ChoiceSelect,
  ConfirmDelete,
  newId,
  publish,
  usePublished,
} from "./shared";

const copy = contentPage.faqs;
const d = copy.dialog;
const groupOf = (f: SiteFaq): FaqCategory => f.category ?? "general";

export function FaqEditor() {
  const live = useFaqs();
  const published = usePublished("faqs");
  const [draft, setDraft] = useState(live);
  const dirty = useDirty(draft, live);
  // An existing question, or a new one in a group.
  const [editing, setEditing] = useState<SiteFaq | FaqCategory | null>(null);
  const [deleting, setDeleting] = useState<SiteFaq | null>(null);

  /** Keeps the list ordered by group, as the FAQ page shows it. */
  const replaceGroup = (group: FaqCategory, items: SiteFaq[]) =>
    setDraft((list) =>
      faqCategories.flatMap((c) =>
        c.key === group ? items : list.filter((f) => groupOf(f) === c.key),
      ),
    );

  function save(faq: SiteFaq) {
    setDraft((list) => {
      const others = list.filter((f) => f.id !== faq.id);
      const exists = others.length !== list.length;
      const next = exists
        ? list.map((f) => (f.id === faq.id ? faq : f))
        : [...list, faq];
      // Moving a question to another group puts it at the end of that group.
      return faqCategories.flatMap((c) =>
        next.filter((f) => groupOf(f) === c.key),
      );
    });
  }

  return (
    <>
      <EditorCard
        title={copy.title}
        description={copy.description}
        published={published}
        dirty={dirty}
        onDiscard={() => setDraft(live)}
        onSave={() => publish("faqs", { faqs: draft }, copy.savedName)}
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setEditing("general")}
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
        {faqCategories.map((group) => {
          const items = draft.filter((f) => groupOf(f) === group.key);
          return (
            <section key={group.key} aria-labelledby={`faq-${group.key}`}>
              <div className="flex items-center justify-between gap-2 border-b pb-2">
                <h3
                  id={`faq-${group.key}`}
                  className="font-sans text-sm font-semibold"
                >
                  {group.label}
                  <span className="ml-2 font-normal text-muted-foreground tabular-nums">
                    {items.length}
                  </span>
                </h3>
                <IconAction
                  label={copy.addTo(group.label)}
                  icon={Add01Icon}
                  onClick={() => setEditing(group.key)}
                />
              </div>
              {items.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  {copy.emptyGroup}
                </p>
              ) : (
                <SortableList
                  items={items}
                  getId={(f) => f.id}
                  getLabel={(f) => f.question}
                  onReorder={(next) => replaceGroup(group.key, next)}
                  renderItem={(f) => (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-sm font-medium">
                          <span className="truncate">{f.question}</span>
                          {f.home && <StatusBadge>{copy.home}</StatusBadge>}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {f.answer}
                        </p>
                      </div>
                      <IconAction
                        label={editorCopy.edit(f.question)}
                        icon={PencilEdit02Icon}
                        onClick={() => setEditing(f)}
                      />
                      <IconAction
                        label={editorCopy.remove(f.question)}
                        icon={Delete02Icon}
                        onClick={() => setDeleting(f)}
                      />
                    </>
                  )}
                />
              )}
            </section>
          );
        })}
      </EditorCard>

      <ConfirmDelete
        name={deleting?.question ?? null}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          setDraft((list) => list.filter((f) => f.id !== deleting?.id));
          setDeleting(null);
        }}
      />

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {editing !== null && (
            <FaqForm
              key={typeof editing === "string" ? editing : editing.id}
              faq={typeof editing === "string" ? undefined : editing}
              group={typeof editing === "string" ? editing : groupOf(editing)}
              onCancel={() => setEditing(null)}
              onDone={(faq) => {
                save(faq);
                setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function FaqForm({
  faq,
  group,
  onCancel,
  onDone,
}: {
  faq?: SiteFaq;
  group: FaqCategory;
  onCancel: () => void;
  onDone: (faq: SiteFaq) => void;
}) {
  const id = useId();
  const [f, setF] = useState<SiteFaq>(
    () =>
      faq ?? { id: newId("faq"), question: "", answer: "", category: group },
  );
  const [submitted, setSubmitted] = useState(false);
  const set = (patch: Partial<SiteFaq>) => setF((x) => ({ ...x, ...patch }));
  const errors = {
    question: f.question.trim() ? "" : editorCopy.required,
    answer: f.answer.trim() ? "" : editorCopy.required,
  };
  const show = (m: string) => (submitted && m ? m : undefined);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        // Keep the outer content form from saving.
        e.stopPropagation();
        setSubmitted(true);
        if (errors.question || errors.answer) return;
        onDone({ ...f, question: f.question.trim(), answer: f.answer.trim() });
      }}
    >
      <DialogHeader>
        <DialogTitle>{faq ? d.editTitle : d.newTitle}</DialogTitle>
      </DialogHeader>
      <Field>
        <FieldLabel htmlFor={`${id}-group`}>{d.category}</FieldLabel>
        <ChoiceSelect
          id={`${id}-group`}
          value={f.category ?? "general"}
          onChange={(category) => set({ category: category as FaqCategory })}
          options={faqCategories.map((c) => ({ value: c.key, label: c.label }))}
        />
      </Field>
      <Field data-invalid={Boolean(show(errors.question)) || undefined}>
        <FieldLabel htmlFor={`${id}-q`}>{d.question}</FieldLabel>
        <Input
          id={`${id}-q`}
          value={f.question}
          aria-invalid={Boolean(show(errors.question)) || undefined}
          onChange={(e) => set({ question: e.target.value })}
        />
        <FieldError>{show(errors.question)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(show(errors.answer)) || undefined}>
        <FieldLabel htmlFor={`${id}-a`}>{d.answer}</FieldLabel>
        <Textarea
          id={`${id}-a`}
          rows={5}
          value={f.answer}
          aria-invalid={Boolean(show(errors.answer)) || undefined}
          onChange={(e) => set({ answer: e.target.value })}
        />
        <FieldError>{show(errors.answer)}</FieldError>
      </Field>
      <Field orientation="horizontal">
        <Switch
          id={`${id}-home`}
          checked={Boolean(f.home)}
          onCheckedChange={(home) => set({ home })}
        />
        <FieldLabel htmlFor={`${id}-home`}>{d.home}</FieldLabel>
      </Field>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={onCancel}
        >
          {editorCopy.cancel}
        </Button>
        <Button type="submit" size="sm" className="h-8">
          {editorCopy.done}
        </Button>
      </DialogFooter>
    </form>
  );
}
