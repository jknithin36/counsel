"use client";

import { useId } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { StaffRole } from "@/lib/auth/roles";
import { editorCopy, settingsPage } from "@/lib/content/dashboard-admin";
import { nextInvoiceNumber } from "@/lib/data/billing";
import { paymentMethodLabels } from "@/lib/data/labels";
import { useDemoStore } from "@/lib/data/store";
import type { PaymentMethod } from "@/lib/data/types";
import { ChoiceSelect } from "../content/shared";
import { EditorCard } from "../editor-kit";
import { useRestriction, useSettingsDraft } from "./shared";

const copy = settingsPage.billing;
const roles = settingsPage.team.roles;
const methods = Object.keys(paymentMethodLabels) as PaymentMethod[];

export function BillingSettings() {
  const id = useId();
  const s = useSettingsDraft("billing", settingsPage.savedName.billing);
  const restricted = useRestriction("billingSettings");
  const invoices = useDemoStore((st) => st.invoices);
  const { draft, patch } = s;
  const errors = {
    prefix: /^[A-Z]{2,6}$/.test(draft.prefix) ? "" : copy.prefixError,
    trustName: draft.trustName.trim() ? "" : editorCopy.required,
    methods: methods.some((m) => draft.methods[m]) ? "" : copy.methodsError,
  };

  return (
    <EditorCard
      kind="settings"
      title={copy.title}
      description={copy.description}
      published={s.published}
      dirty={s.dirty}
      canSave={!errors.prefix && !errors.trustName && !errors.methods}
      disabledReason={restricted}
      onDiscard={s.discard}
      onSave={() => s.save({ ...draft, trustName: draft.trustName.trim() })}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${id}-terms`}>{copy.terms}</FieldLabel>
          <ChoiceSelect
            id={`${id}-terms`}
            value={String(draft.terms)}
            disabled={Boolean(restricted)}
            onChange={(v) => patch({ terms: Number(v) as 15 | 30 })}
            options={copy.termsOptions}
          />
        </Field>
        <Field data-invalid={Boolean(errors.prefix) || undefined}>
          <FieldLabel htmlFor={`${id}-prefix`}>{copy.prefix}</FieldLabel>
          <Input
            id={`${id}-prefix`}
            value={draft.prefix}
            maxLength={6}
            aria-invalid={Boolean(errors.prefix) || undefined}
            onChange={(e) =>
              patch({
                prefix: e.target.value.toUpperCase().replace(/[^A-Z]/g, ""),
              })
            }
          />
          {errors.prefix ? (
            <FieldError>{errors.prefix}</FieldError>
          ) : (
            <FieldDescription>
              {copy.prefixHint(
                nextInvoiceNumber(invoices, undefined, draft.prefix),
              )}
            </FieldDescription>
          )}
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">{copy.rates}</legend>
        <p className="mb-2 text-xs text-muted-foreground">{copy.ratesHint}</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {roles.map((r) => (
            <Field key={r.value}>
              <FieldLabel htmlFor={`${id}-rate-${r.value}`} className="text-xs">
                {r.label}
              </FieldLabel>
              <Input
                id={`${id}-rate-${r.value}`}
                type="number"
                inputMode="decimal"
                min={0}
                step={5}
                className="tabular-nums"
                value={draft.rates[r.value as StaffRole]}
                onChange={(e) =>
                  patch({
                    rates: {
                      ...draft.rates,
                      [r.value]: Math.max(0, Number(e.target.value)),
                    },
                  })
                }
              />
            </Field>
          ))}
        </div>
      </fieldset>

      <Field data-invalid={Boolean(errors.trustName) || undefined}>
        <FieldLabel htmlFor={`${id}-trust`}>{copy.trustName}</FieldLabel>
        <Input
          id={`${id}-trust`}
          value={draft.trustName}
          aria-invalid={Boolean(errors.trustName) || undefined}
          onChange={(e) => patch({ trustName: e.target.value })}
        />
        <FieldError>{errors.trustName || undefined}</FieldError>
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">{copy.methods}</legend>
        <ul className="flex flex-col divide-y rounded-md border">
          {methods.map((m) => (
            <li key={m}>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: the switch renders inside the label */}
              <label className="flex items-center justify-between gap-4 px-3 py-3 text-sm">
                {paymentMethodLabels[m]}
                <Switch
                  checked={draft.methods[m]}
                  onCheckedChange={(on) =>
                    patch({ methods: { ...draft.methods, [m]: on } })
                  }
                />
              </label>
            </li>
          ))}
        </ul>
        {errors.methods && (
          <p className="text-sm text-destructive">{errors.methods}</p>
        )}
      </fieldset>
    </EditorCard>
  );
}
