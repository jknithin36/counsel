"use client";

import { PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { useId, useState } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contentPage, editorCopy } from "@/lib/content/dashboard-admin";
import type { PracticeArea } from "@/lib/content/practice-areas";
import { usePracticeAreas } from "@/lib/site-content";
import {
  EditorCard,
  IconAction,
  PairRepeater,
  SortableList,
  useDirty,
} from "../editor-kit";
import { EditorSheet, publish, usePublished } from "./shared";

const copy = contentPage.practiceAreas;
const s = copy.sheet;

export function PracticeAreasEditor() {
  const live = usePracticeAreas();
  const published = usePublished("practiceAreas");
  const [draft, setDraft] = useState(live);
  const dirty = useDirty(draft, live);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <>
      <EditorCard
        title={copy.title}
        description={copy.description}
        published={published}
        dirty={dirty}
        onDiscard={() => setDraft(live)}
        onSave={() =>
          publish("practiceAreas", { practiceAreas: draft }, copy.savedName)
        }
      >
        <SortableList
          items={draft}
          getId={(a) => a.slug}
          getLabel={(a) => a.title}
          onReorder={setDraft}
          renderItem={(a) => (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {copy.counts(a.commonCases.length, a.faqs.length)}
                </p>
              </div>
              <IconAction
                label={editorCopy.edit(a.title)}
                icon={PencilEdit02Icon}
                onClick={() => setEditing(a.slug)}
              />
            </>
          )}
        />
      </EditorCard>

      {editing && (
        <AreaSheet
          key={editing}
          area={draft.find((a) => a.slug === editing) as PracticeArea}
          onOpenChange={(open) => !open && setEditing(null)}
          onDone={(area) =>
            setDraft((list) =>
              list.map((a) => (a.slug === area.slug ? area : a)),
            )
          }
        />
      )}
    </>
  );
}

function AreaSheet({
  area,
  onOpenChange,
  onDone,
}: {
  area: PracticeArea;
  onOpenChange: (open: boolean) => void;
  onDone: (area: PracticeArea) => void;
}) {
  const id = useId();
  const [a, setA] = useState(area);
  const [submitted, setSubmitted] = useState(false);
  const set = (patch: Partial<PracticeArea>) =>
    setA((x) => ({ ...x, ...patch }));
  const errors = {
    title: a.title.trim() ? "" : editorCopy.required,
    summary: a.summary.trim() ? "" : editorCopy.required,
    intro: a.intro.trim() ? "" : editorCopy.required,
  };
  const show = (m: string) => (submitted && m ? m : undefined);

  const text = (
    field: "title" | "summary" | "navDescription" | "intro" | "whatToExpect",
    label: string,
    rows?: number,
  ) => {
    const error =
      field in errors ? show(errors[field as keyof typeof errors]) : undefined;
    const props = {
      id: `${id}-${field}`,
      value: a[field],
      "aria-invalid": Boolean(error) || undefined,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => set({ [field]: e.target.value }),
    };
    return (
      <Field data-invalid={Boolean(error) || undefined}>
        <FieldLabel htmlFor={props.id}>{label}</FieldLabel>
        {rows ? <Textarea rows={rows} {...props} /> : <Input {...props} />}
        <FieldError>{error}</FieldError>
      </Field>
    );
  };

  return (
    <EditorSheet
      open
      onOpenChange={onOpenChange}
      title={s.title}
      description={s.description}
      onDone={() => {
        setSubmitted(true);
        if (Object.values(errors).some(Boolean)) return false;
        onDone({
          ...a,
          commonCases: a.commonCases.filter((c) => c.title.trim()),
          howWeHelp: a.howWeHelp.filter((c) => c.title.trim()),
          faqs: a.faqs.filter((f) => f.question.trim()),
        });
      }}
    >
      {text("title", s.name)}
      {text("navDescription", s.navDescription)}
      {text("summary", s.summary, 3)}
      {text("intro", s.intro, 4)}
      <PairRepeater
        label={s.commonCases}
        items={a.commonCases}
        keys={["title", "body"]}
        labels={[s.itemTitle, s.itemBody]}
        onChange={(commonCases) => set({ commonCases })}
      />
      <PairRepeater
        label={s.howWeHelp}
        items={a.howWeHelp}
        keys={["title", "body"]}
        labels={[s.itemTitle, s.itemBody]}
        onChange={(howWeHelp) => set({ howWeHelp })}
      />
      {text("whatToExpect", s.whatToExpect, 4)}
      <PairRepeater
        label={s.faqs}
        items={a.faqs.map((f) => ({ question: f.question, answer: f.answer }))}
        keys={["question", "answer"]}
        labels={[s.question, s.answer]}
        onChange={(faqs) => set({ faqs })}
      />
    </EditorSheet>
  );
}
