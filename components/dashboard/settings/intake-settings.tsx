"use client";

import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { editorCopy, settingsPage } from "@/lib/content/dashboard-admin";
import { practiceAreas } from "@/lib/content/practice-areas";
import { attorneyUsers } from "@/lib/data/seed/users";
import type { Consultation } from "@/lib/data/types";
import { ChoiceSelect } from "../content/shared";
import { EditorCard } from "../editor-kit";
import { timeOptions, useSettingsDraft } from "./shared";

const copy = settingsPage.intake;
const lengths: Consultation["duration"][] = [30, 45, 60];
const NONE = "none";

export function IntakeSettings() {
  const id = useId();
  const s = useSettingsDraft("intake", settingsPage.savedName.intake);
  const { draft, patch } = s;
  const errors = {
    durations: draft.durations.length ? "" : copy.durationsError,
    slots: draft.slotEnd > draft.slotStart ? "" : copy.slotError,
    thankYou: draft.thankYouMessage.trim() ? "" : editorCopy.required,
  };

  return (
    <EditorCard
      kind="settings"
      title={copy.title}
      description={copy.description}
      published={s.published}
      dirty={s.dirty}
      canSave={!errors.durations && !errors.slots && !errors.thankYou}
      onDiscard={s.discard}
      onSave={() =>
        s.save({ ...draft, thankYouMessage: draft.thankYouMessage.trim() })
      }
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">{copy.areas}</legend>
        <p className="-mt-1 text-xs text-muted-foreground">{copy.areasHint}</p>
        <div className="flex flex-col divide-y rounded-md border">
          {practiceAreas.map((area) => (
            <div
              key={area.slug}
              className="grid gap-2 px-3 py-2.5 sm:grid-cols-[1fr_14rem] sm:items-center"
            >
              {/* biome-ignore lint/a11y/noLabelWithoutControl: the switch renders inside the label */}
              <label className="flex items-center gap-3 text-sm">
                <Switch
                  checked={draft.areas[area.slug] !== false}
                  onCheckedChange={(on) =>
                    patch({ areas: { ...draft.areas, [area.slug]: on } })
                  }
                />
                {area.title}
              </label>
              <ChoiceSelect
                aria-label={`${copy.autoAssign}: ${area.title}`}
                className="h-8 w-full"
                value={draft.autoAssign[area.slug] ?? NONE}
                onChange={(v) =>
                  patch({
                    autoAssign: {
                      ...draft.autoAssign,
                      [area.slug]: v === NONE ? undefined : v,
                    },
                  })
                }
                options={[
                  { value: NONE, label: copy.noAutoAssign },
                  ...attorneyUsers.map((u) => ({ value: u.id, label: u.name })),
                ]}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{copy.autoAssignHint}</p>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">{copy.durations}</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {lengths.map((n) => (
            // biome-ignore lint/a11y/noLabelWithoutControl: the checkbox renders inside the label
            <label key={n} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={draft.durations.includes(n)}
                onCheckedChange={(on) =>
                  patch({
                    durations: lengths.filter((x) =>
                      x === n ? on : draft.durations.includes(x),
                    ),
                  })
                }
              />
              {copy.minutes(n)}
            </label>
          ))}
        </div>
        {errors.durations && (
          <p className="text-sm text-destructive">{errors.durations}</p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">{copy.slots}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${id}-start`} className="text-xs">
              {copy.slotStart}
            </FieldLabel>
            <ChoiceSelect
              id={`${id}-start`}
              value={draft.slotStart}
              onChange={(slotStart) => patch({ slotStart })}
              options={timeOptions}
            />
          </Field>
          <Field data-invalid={Boolean(errors.slots) || undefined}>
            <FieldLabel htmlFor={`${id}-end`} className="text-xs">
              {copy.slotEnd}
            </FieldLabel>
            <ChoiceSelect
              id={`${id}-end`}
              value={draft.slotEnd}
              onChange={(slotEnd) => patch({ slotEnd })}
              options={timeOptions}
            />
            <FieldError>{errors.slots || undefined}</FieldError>
          </Field>
        </div>
      </fieldset>

      <Field data-invalid={Boolean(errors.thankYou) || undefined}>
        <FieldLabel htmlFor={`${id}-thanks`}>{copy.thankYou}</FieldLabel>
        <Textarea
          id={`${id}-thanks`}
          rows={3}
          value={draft.thankYouMessage}
          aria-invalid={Boolean(errors.thankYou) || undefined}
          onChange={(e) => patch({ thankYouMessage: e.target.value })}
        />
        {errors.thankYou ? (
          <FieldError>{errors.thankYou}</FieldError>
        ) : (
          <FieldDescription>{copy.thankYouHint}</FieldDescription>
        )}
      </Field>
    </EditorCard>
  );
}
