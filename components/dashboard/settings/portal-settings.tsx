"use client";

import { useId } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { editorCopy, settingsPage } from "@/lib/content/dashboard-admin";
import type { Settings } from "@/lib/data/types";
import { ChoiceSelect } from "../content/shared";
import { EditorCard } from "../editor-kit";
import { useSettingsDraft } from "./shared";

const copy = settingsPage.portal;
type Feature = keyof typeof copy.features;
const features = Object.keys(copy.features) as Feature[];

export function PortalSettings() {
  const id = useId();
  const s = useSettingsDraft("portal", settingsPage.savedName.portal);
  const { draft, patch } = s;
  const welcomeError = draft.welcome.trim() ? "" : editorCopy.required;

  return (
    <EditorCard
      kind="settings"
      title={copy.title}
      description={copy.description}
      published={s.published}
      dirty={s.dirty}
      canSave={!welcomeError}
      onDiscard={s.discard}
      onSave={() => s.save({ ...draft, welcome: draft.welcome.trim() })}
    >
      <ul className="flex flex-col divide-y rounded-md border">
        {features.map((key) => (
          <li key={key}>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: the switch renders inside the label */}
            <label className="flex items-center justify-between gap-4 px-3 py-3 text-sm">
              {copy.features[key]}
              <Switch
                checked={draft[key]}
                onCheckedChange={(on) => patch({ [key]: on })}
              />
            </label>
          </li>
        ))}
      </ul>
      <Field data-invalid={Boolean(welcomeError) || undefined}>
        <FieldLabel htmlFor={`${id}-welcome`}>{copy.welcome}</FieldLabel>
        <Textarea
          id={`${id}-welcome`}
          rows={3}
          value={draft.welcome}
          aria-invalid={Boolean(welcomeError) || undefined}
          onChange={(e) => patch({ welcome: e.target.value })}
        />
        <FieldError>{welcomeError || undefined}</FieldError>
      </Field>
      <Field className="sm:max-w-xs">
        <FieldLabel htmlFor={`${id}-reminder`}>{copy.reminder}</FieldLabel>
        <ChoiceSelect
          id={`${id}-reminder`}
          value={draft.reminder}
          onChange={(v) =>
            patch({ reminder: v as Settings["portal"]["reminder"] })
          }
          options={copy.reminders}
        />
      </Field>
    </EditorCard>
  );
}
