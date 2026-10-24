"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { type StaffRole, staffRoleLabels } from "@/lib/auth/roles";
import { switchDemoRole, useSession } from "@/lib/auth/session";
import { dashboardNavItems } from "@/lib/config/dashboard-nav";
import { profilePage as copy, editorCopy } from "@/lib/content/dashboard-admin";
import { useDemoStore } from "@/lib/data/store";
import type { Profile } from "@/lib/data/types";
import { formatPhone } from "@/lib/format";
import { ChoiceSelect } from "../content/shared";
import { useDemoStatus } from "../demo-data-provider";
import { EditorCard, useDirty } from "../editor-kit";
import { PageHeader } from "../page-header";
import { PageSkeleton } from "../page-skeleton";
import { useProfile } from "../preferences";
import { SectionCard } from "../section-card";

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const roleOptions = (Object.keys(staffRoleLabels) as StaffRole[]).map(
  (value) => ({ value, label: staffRoleLabels[value] }),
);

export function ProfilePage() {
  const status = useDemoStatus();
  const { user, session } = useSession();
  if (status !== "ready" || !user || !session) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={copy.title} description={copy.subtitle} />
      <div className="flex max-w-3xl flex-col gap-4">
        <DetailsCard />
        <PasswordCard />
        <PreferencesCard />
        {demoMode && <DemoRoleCard />}
      </div>
    </div>
  );
}

/** Saves a slice of the signed-in user's profile. */
function useProfileDraft<K extends keyof Profile>(keys: K[]) {
  const profile = useProfile();
  const pick = () =>
    Object.fromEntries(keys.map((k) => [k, profile[k] ?? ""])) as Pick<
      Profile,
      K
    >;
  const live = pick();
  const [draft, setDraft] = useState(live);
  const dirty = useDirty(draft, live);
  return {
    draft,
    patch: (change: Partial<Pick<Profile, K>>) =>
      setDraft((d) => ({ ...d, ...change })),
    dirty,
    discard: () => setDraft(live),
    save: () => {
      if (!profile.userId) return;
      useDemoStore.getState().setProfile(profile.userId, draft);
      toast.add({ title: editorCopy.saved(copy.savedName) });
    },
  };
}

function DetailsCard() {
  const id = useId();
  const { user, session } = useSession();
  const d = copy.details;
  const s = useProfileDraft(["title", "phone", "signature"]);
  if (!user || !session) return null;

  return (
    <EditorCard
      kind="settings"
      title={d.title}
      description={d.description}
      dirty={s.dirty}
      onDiscard={s.discard}
      onSave={s.save}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${id}-name`}>{d.name}</FieldLabel>
          <Input id={`${id}-name`} value={user.name} readOnly disabled />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-email`}>{d.email}</FieldLabel>
          <Input id={`${id}-email`} value={user.email} readOnly disabled />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor={`${id}-role`}>{d.role}</FieldLabel>
        <Input
          id={`${id}-role`}
          value={staffRoleLabels[session.role as StaffRole] ?? user.title}
          readOnly
          disabled
          className="sm:max-w-xs"
        />
        <FieldDescription>{d.readOnly}</FieldDescription>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${id}-title`}>{d.jobTitle}</FieldLabel>
          <Input
            id={`${id}-title`}
            value={s.draft.title ?? ""}
            onChange={(e) => s.patch({ title: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-phone`}>{d.phone}</FieldLabel>
          <Input
            id={`${id}-phone`}
            type="tel"
            inputMode="tel"
            value={s.draft.phone ?? ""}
            onChange={(e) => s.patch({ phone: formatPhone(e.target.value) })}
          />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor={`${id}-signature`}>{d.signature}</FieldLabel>
        <Textarea
          id={`${id}-signature`}
          rows={4}
          value={s.draft.signature ?? ""}
          onChange={(e) => s.patch({ signature: e.target.value })}
        />
        <FieldDescription>{d.signatureHint}</FieldDescription>
      </Field>
    </EditorCard>
  );
}

function PasswordCard() {
  const id = useId();
  const p = copy.password;
  return (
    <SectionCard title={p.title} description={p.description}>
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          toast.add({ title: p.disabled });
        }}
      >
        <Field className="sm:max-w-sm">
          <FieldLabel htmlFor={`${id}-current`}>{p.current}</FieldLabel>
          <Input
            id={`${id}-current`}
            type="password"
            autoComplete="current-password"
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${id}-next`}>{p.next}</FieldLabel>
            <Input
              id={`${id}-next`}
              type="password"
              autoComplete="new-password"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-confirm`}>{p.confirm}</FieldLabel>
            <Input
              id={`${id}-confirm`}
              type="password"
              autoComplete="new-password"
            />
          </Field>
        </div>
        <div>
          <Button type="submit" variant="outline" size="sm" className="h-8">
            {p.submit}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

function PreferencesCard() {
  const id = useId();
  const p = copy.preferences;
  const s = useProfileDraft(["defaultTab", "dateFormat", "compact"]);
  return (
    <EditorCard
      kind="settings"
      title={p.title}
      description={p.description}
      dirty={s.dirty}
      onDiscard={s.discard}
      onSave={s.save}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${id}-tab`}>{p.defaultTab}</FieldLabel>
          <ChoiceSelect
            id={`${id}-tab`}
            value={s.draft.defaultTab}
            onChange={(defaultTab) => s.patch({ defaultTab })}
            options={dashboardNavItems.map((item) => ({
              value: item.href,
              label: item.title,
            }))}
          />
          <FieldDescription>{p.defaultTabHint}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-date`}>{p.dateFormat}</FieldLabel>
          <ChoiceSelect
            id={`${id}-date`}
            value={s.draft.dateFormat}
            onChange={(v) =>
              s.patch({ dateFormat: v as Profile["dateFormat"] })
            }
            options={p.dateFormats}
          />
        </Field>
      </div>
      <Field orientation="horizontal">
        <Switch
          id={`${id}-compact`}
          checked={s.draft.compact}
          onCheckedChange={(compact) => s.patch({ compact })}
        />
        <div className="flex flex-col gap-0.5">
          <FieldLabel htmlFor={`${id}-compact`}>{p.compact}</FieldLabel>
          <FieldDescription>{p.compactHint}</FieldDescription>
        </div>
      </Field>
    </EditorCard>
  );
}

function DemoRoleCard() {
  const id = useId();
  const r = copy.demoRole;
  const role = useDemoStore((s) => s.session?.role);
  return (
    <SectionCard title={r.title} description={r.description}>
      <Field className="sm:max-w-xs">
        <FieldLabel htmlFor={`${id}-role`}>{r.label}</FieldLabel>
        <ChoiceSelect
          id={`${id}-role`}
          value={role ?? "owner"}
          onChange={(v) => {
            switchDemoRole(v as StaffRole);
            toast.add({ title: r.changed(staffRoleLabels[v as StaffRole]) });
          }}
          options={roleOptions}
        />
      </Field>
    </SectionCard>
  );
}
