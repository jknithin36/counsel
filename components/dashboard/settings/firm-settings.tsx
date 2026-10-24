"use client";

import { useId, useState } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { editorCopy, settingsPage } from "@/lib/content/dashboard-admin";
import { currentUser } from "@/lib/data/leads";
import { useDemoStore } from "@/lib/data/store";
import type { FirmProfile } from "@/lib/data/types";
import { formatPhone } from "@/lib/format";
import { useFirm } from "@/lib/site-content";
import { ChoiceSelect } from "../content/shared";
import { EditorCard, useDirty } from "../editor-kit";
import { useRestriction } from "./shared";

const copy = settingsPage.firm;

/** Firm details; saved as a content override so the public site follows. */
export function FirmSettings() {
  const id = useId();
  const live = useFirm();
  const published = useDemoStore((s) => s.contentOverrides.published?.firm);
  const restricted = useRestriction("editFirm");
  const [draft, setDraft] = useState(live);
  const [languages, setLanguages] = useState(live.languages.join(", "));
  const value: FirmProfile = {
    ...draft,
    languages: languages
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean),
  };
  const dirty = useDirty(value, live);
  const set = (patch: Partial<FirmProfile>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const errors: Partial<Record<keyof FirmProfile, string>> = {
    name: draft.name.trim() ? "" : editorCopy.required,
    legalName: draft.legalName.trim() ? "" : editorCopy.required,
    monogram: draft.monogram.trim() ? "" : editorCopy.required,
    phone:
      draft.phone.replace(/\D/g, "").length === 10 ? "" : copy.invalidPhone,
    email: /^\S+@\S+\.\S+$/.test(draft.email.trim()) ? "" : copy.invalidEmail,
    line1: draft.line1.trim() ? "" : editorCopy.required,
    city: draft.city.trim() ? "" : editorCopy.required,
  };
  const valid = Object.values(errors).every((e) => !e);

  const text = (
    field: Exclude<keyof FirmProfile, "languages">,
    props: React.ComponentProps<typeof Input> = {},
    hint?: string,
  ) => {
    const error = errors[field];
    return (
      <Field data-invalid={Boolean(error) || undefined}>
        <FieldLabel htmlFor={`${id}-${field}`}>{copy[field]}</FieldLabel>
        <Input
          id={`${id}-${field}`}
          value={draft[field]}
          aria-invalid={Boolean(error) || undefined}
          onChange={(e) =>
            set({
              [field]:
                field === "phone"
                  ? formatPhone(e.target.value)
                  : e.target.value,
            })
          }
          {...props}
        />
        {error ? (
          <FieldError>{error}</FieldError>
        ) : (
          hint && <FieldDescription>{hint}</FieldDescription>
        )}
      </Field>
    );
  };

  return (
    <EditorCard
      title={copy.title}
      description={copy.description}
      published={published}
      dirty={dirty}
      canSave={valid}
      disabledReason={restricted}
      onDiscard={() => {
        setDraft(live);
        setLanguages(live.languages.join(", "));
      }}
      onSave={() => {
        useDemoStore.getState().setContent(
          "firm",
          {
            firm: {
              ...value,
              name: value.name.trim(),
              legalName: value.legalName.trim(),
              email: value.email.trim(),
            },
          },
          currentUser().name,
        );
        toast.add({ title: editorCopy.saved(settingsPage.savedName.firm) });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {text("name")}
        {text("legalName")}
      </div>
      <div className="grid gap-5 sm:grid-cols-[8rem_1fr_1fr]">
        {text("monogram", { maxLength: 3 }, copy.monogramHint)}
        {text("phone", { type: "tel", inputMode: "tel" })}
        {text("email", { type: "email" })}
      </div>
      {text("line1")}
      <div className="grid gap-5 sm:grid-cols-[1fr_6rem_8rem]">
        {text("city")}
        {text("region", { maxLength: 2 })}
        {text("postalCode", { inputMode: "numeric", maxLength: 10 })}
      </div>
      {text("hours")}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${id}-languages`}>{copy.languages}</FieldLabel>
          <Input
            id={`${id}-languages`}
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
          />
          <FieldDescription>{copy.languagesHint}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-tz`}>{copy.timeZone}</FieldLabel>
          <ChoiceSelect
            id={`${id}-tz`}
            value={draft.timeZone}
            disabled={Boolean(restricted)}
            onChange={(timeZone) => set({ timeZone })}
            options={copy.timeZones}
          />
        </Field>
      </div>
    </EditorCard>
  );
}
