"use client";

import { useId, useState } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { contentPage, editorCopy } from "@/lib/content/dashboard-admin";
import { useAnnouncement } from "@/lib/site-content";
import { EditorCard, useDirty } from "../editor-kit";
import { publish, usePublished } from "./shared";

const copy = contentPage.announcement;

export function AnnouncementEditor() {
  const id = useId();
  const live = useAnnouncement();
  const published = usePublished("announcement");
  const [draft, setDraft] = useState(live);
  const dirty = useDirty(draft, live);
  const set = (patch: Partial<typeof draft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const errors = {
    message: draft.enabled && !draft.message.trim() ? editorCopy.required : "",
    href:
      draft.linkLabel.trim() && !draft.linkHref.trim()
        ? editorCopy.required
        : "",
  };

  return (
    <EditorCard
      title={copy.title}
      description={copy.description}
      published={published}
      dirty={dirty}
      canSave={!errors.message && !errors.href}
      onDiscard={() => setDraft(live)}
      onSave={() =>
        publish(
          "announcement",
          {
            announcement: {
              ...draft,
              message: draft.message.trim(),
              linkLabel: draft.linkLabel.trim(),
              linkHref: draft.linkHref.trim(),
            },
          },
          copy.savedName,
        )
      }
    >
      <Field orientation="horizontal">
        <Switch
          id={`${id}-enabled`}
          checked={draft.enabled}
          onCheckedChange={(enabled) => set({ enabled })}
        />
        <FieldLabel htmlFor={`${id}-enabled`}>{copy.enabled}</FieldLabel>
      </Field>

      <Field data-invalid={Boolean(errors.message) || undefined}>
        <FieldLabel htmlFor={`${id}-message`}>{copy.message}</FieldLabel>
        <Input
          id={`${id}-message`}
          value={draft.message}
          maxLength={120}
          aria-invalid={Boolean(errors.message) || undefined}
          onChange={(e) => set({ message: e.target.value })}
        />
        <FieldError>{errors.message || undefined}</FieldError>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${id}-label`}>{copy.linkLabel}</FieldLabel>
          <Input
            id={`${id}-label`}
            value={draft.linkLabel}
            maxLength={40}
            onChange={(e) => set({ linkLabel: e.target.value })}
          />
        </Field>
        <Field data-invalid={Boolean(errors.href) || undefined}>
          <FieldLabel htmlFor={`${id}-href`}>{copy.linkHref}</FieldLabel>
          <Input
            id={`${id}-href`}
            value={draft.linkHref}
            aria-invalid={Boolean(errors.href) || undefined}
            onChange={(e) => set({ linkHref: e.target.value })}
          />
          {errors.href ? (
            <FieldError>{errors.href}</FieldError>
          ) : (
            <FieldDescription>{copy.linkHint}</FieldDescription>
          )}
        </Field>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {copy.preview}
        </p>
        {draft.enabled ? (
          <div className="flex min-h-9 flex-wrap items-center justify-center gap-x-2 rounded-md bg-[#111] px-4 py-2 text-center text-[13px] text-white">
            <span>{draft.message || "…"}</span>
            {draft.linkLabel && (
              <span className="font-semibold underline underline-offset-4">
                {draft.linkLabel}
              </span>
            )}
          </div>
        ) : (
          <p className="rounded-md border border-dashed px-4 py-2 text-center text-sm text-muted-foreground">
            {copy.hidden}
          </p>
        )}
      </div>
    </EditorCard>
  );
}
