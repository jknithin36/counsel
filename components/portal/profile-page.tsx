"use client";

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
import { toast } from "@/components/ui/toast";
import { profilePage as copy } from "@/lib/content/portal";
import { updatePortalProfile } from "@/lib/data/portal";
import type { Client } from "@/lib/data/types";
import { formatPhone } from "@/lib/format";
import { ChoiceSelect } from "../dashboard/content/shared";
import { EditorCard, useDirty } from "../dashboard/editor-kit";
import { SectionCard } from "../dashboard/section-card";
import { PortalPage } from "./shared";
import { usePortal } from "./use-portal";

function save(patch: Partial<Client>) {
  updatePortalProfile(patch);
  toast.add({ title: copy.saved });
}

function ContactCard({ client }: { client: Client }) {
  const id = useId();
  const c = copy.contact;
  const live = {
    email: client.email,
    phone: client.phone,
    address: client.address,
    preferredContact: client.preferredContact ?? "email",
    language: client.language,
  };
  const [draft, setDraft] = useState(live);
  const dirty = useDirty(draft, live);
  const set = (patch: Partial<typeof draft>) =>
    setDraft((d) => ({ ...d, ...patch }));
  const emailError = /^\S+@\S+\.\S+$/.test(draft.email.trim())
    ? ""
    : c.invalidEmail;

  return (
    <EditorCard
      kind="settings"
      title={c.title}
      description={c.description}
      dirty={dirty}
      canSave={!emailError}
      onDiscard={() => setDraft(live)}
      onSave={() => save({ ...draft, email: draft.email.trim() })}
    >
      <Field>
        <FieldLabel htmlFor={`${id}-name`}>{c.name}</FieldLabel>
        <Input id={`${id}-name`} value={client.name} readOnly disabled />
        <FieldDescription>{c.nameHint}</FieldDescription>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(emailError) || undefined}>
          <FieldLabel htmlFor={`${id}-email`}>{c.email}</FieldLabel>
          <Input
            id={`${id}-email`}
            type="email"
            value={draft.email}
            aria-invalid={Boolean(emailError) || undefined}
            onChange={(e) => set({ email: e.target.value })}
          />
          <FieldError>{emailError || undefined}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-phone`}>{c.phone}</FieldLabel>
          <Input
            id={`${id}-phone`}
            type="tel"
            inputMode="tel"
            value={draft.phone}
            onChange={(e) => set({ phone: formatPhone(e.target.value) })}
          />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor={`${id}-address`}>{c.address}</FieldLabel>
        <Input
          id={`${id}-address`}
          value={draft.address}
          onChange={(e) => set({ address: e.target.value })}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${id}-preferred`}>{c.preferred}</FieldLabel>
          <ChoiceSelect
            id={`${id}-preferred`}
            value={draft.preferredContact}
            onChange={(v) =>
              set({
                preferredContact: v as NonNullable<Client["preferredContact"]>,
              })
            }
            options={c.preferredOptions}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-language`}>{c.language}</FieldLabel>
          <ChoiceSelect
            id={`${id}-language`}
            value={draft.language}
            onChange={(v) => set({ language: v as Client["language"] })}
            options={c.languages}
          />
        </Field>
      </div>
    </EditorCard>
  );
}

function NotificationsCard({ client }: { client: Client }) {
  const n = copy.notifications;
  const live = {
    notificationEmail: client.notificationEmail ?? true,
    notificationText: client.notificationText ?? false,
  };
  const [draft, setDraft] = useState(live);
  const dirty = useDirty(draft, live);
  const rows = [
    { key: "notificationEmail", label: n.email },
    { key: "notificationText", label: n.text },
  ] as const;

  return (
    <EditorCard
      kind="settings"
      title={n.title}
      description={n.description}
      dirty={dirty}
      onDiscard={() => setDraft(live)}
      onSave={() => save(draft)}
    >
      <ul className="flex flex-col divide-y rounded-md border">
        {rows.map((row) => (
          <li key={row.key}>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: the switch renders inside the label */}
            <label className="flex items-center justify-between gap-4 px-3 py-3 text-sm">
              {row.label}
              <Switch
                checked={draft[row.key]}
                onCheckedChange={(on) =>
                  setDraft((d) => ({ ...d, [row.key]: on }))
                }
              />
            </label>
          </li>
        ))}
      </ul>
    </EditorCard>
  );
}

export function ProfilePage() {
  const { client, user } = usePortal();
  const p = copy.password;
  return (
    <PortalPage title={copy.title} description={copy.subtitle}>
      {client && user && (
        <div className="flex max-w-3xl flex-col gap-4">
          <ContactCard client={client} />
          <NotificationsCard client={client} />
          <SectionCard title={p.title} description={p.description}>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => toast.add({ title: p.disabled })}
            >
              {p.action}
            </Button>
          </SectionCard>
        </div>
      )}
    </PortalPage>
  );
}
