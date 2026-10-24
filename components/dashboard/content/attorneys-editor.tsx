"use client";

import {
  Add01Icon,
  Delete02Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useId, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { contentPage, editorCopy } from "@/lib/content/dashboard-admin";
import {
  type PracticeAreaSlug,
  practiceAreas,
} from "@/lib/content/practice-areas";
import type { SiteAttorney } from "@/lib/data/types";
import { initials } from "@/lib/format";
import { useAllAttorneys } from "@/lib/site-content";
import {
  EditorCard,
  IconAction,
  ListRepeater,
  SortableList,
  useDirty,
} from "../editor-kit";
import { StatusBadge } from "../status-badge";
import {
  ConfirmDelete,
  EditorSheet,
  publish,
  slugify,
  usePublished,
} from "./shared";

const copy = contentPage.attorneys;
const s = copy.sheet;

/** Downscales an image file to a JPEG data URL that fits in storage. */
async function toPortrait(file: File, max = 600) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const blank = (): SiteAttorney => ({
  slug: "",
  name: "",
  title: "Associate",
  practiceAreas: [],
  languages: ["English"],
  bio: "",
  longBio: [],
  focusAreas: [],
  education: [],
  admissions: [],
  memberships: [],
  notableResults: [],
  quote: "",
  email: "",
  yearsOfExperience: 1,
  visible: true,
});

export function AttorneysEditor() {
  const live = useAllAttorneys();
  const published = usePublished("attorneys");
  const [draft, setDraft] = useState(live);
  const dirty = useDirty(draft, live);
  // The index being edited, or "new".
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [deleting, setDeleting] = useState<SiteAttorney | null>(null);

  const patch = (slug: string, change: Partial<SiteAttorney>) =>
    setDraft((list) =>
      list.map((a) => (a.slug === slug ? { ...a, ...change } : a)),
    );

  return (
    <>
      <EditorCard
        title={copy.title}
        description={copy.description}
        published={published}
        dirty={dirty}
        onDiscard={() => setDraft(live)}
        onSave={() =>
          publish("attorneys", { attorneys: draft }, copy.savedName)
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
        {draft.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            {copy.empty}
          </p>
        ) : (
          <SortableList
            items={draft}
            getId={(a) => a.slug}
            getLabel={(a) => a.name}
            onReorder={setDraft}
            renderItem={(a, i) => (
              <>
                <Avatar className="size-9 rounded-md after:rounded-md">
                  {a.image && (
                    <AvatarImage
                      src={a.image}
                      alt=""
                      className="rounded-md object-cover"
                    />
                  )}
                  <AvatarFallback className="rounded-md text-xs">
                    {initials(a.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                    <span className="truncate">{a.name}</span>
                    {!a.visible && (
                      <StatusBadge>{copy.hiddenBadge}</StatusBadge>
                    )}
                    {a.featured && <StatusBadge>{copy.featured}</StatusBadge>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.title}
                  </p>
                </div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: the switch renders inside the label */}
                <label className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                  <Switch
                    size="sm"
                    checked={a.visible}
                    onCheckedChange={(visible) => patch(a.slug, { visible })}
                    aria-label={`${copy.visible}: ${a.name}`}
                  />
                  {copy.visible}
                </label>
                <IconAction
                  label={editorCopy.edit(a.name)}
                  icon={PencilEdit02Icon}
                  onClick={() => setEditing(i)}
                />
                <IconAction
                  label={editorCopy.remove(a.name)}
                  icon={Delete02Icon}
                  onClick={() => setDeleting(a)}
                />
              </>
            )}
          />
        )}
      </EditorCard>

      <AttorneySheet
        key={String(editing)}
        attorney={typeof editing === "number" ? draft[editing] : undefined}
        open={editing !== null}
        taken={draft.filter((_, i) => i !== editing).map((a) => a.slug)}
        onOpenChange={(open) => !open && setEditing(null)}
        onDone={(attorney) =>
          setDraft((list) =>
            editing === "new"
              ? [...list, attorney]
              : list.map((a, i) => (i === editing ? attorney : a)),
          )
        }
      />

      <ConfirmDelete
        name={deleting?.name ?? null}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          setDraft((list) => list.filter((a) => a !== deleting));
          setDeleting(null);
        }}
      />
    </>
  );
}

function AttorneySheet({
  attorney,
  open,
  taken,
  onOpenChange,
  onDone,
}: {
  attorney?: SiteAttorney;
  open: boolean;
  taken: string[];
  onOpenChange: (open: boolean) => void;
  onDone: (attorney: SiteAttorney) => void;
}) {
  const id = useId();
  const isNew = !attorney;
  const fileRef = useRef<HTMLInputElement>(null);
  const [a, setA] = useState<SiteAttorney>(() => attorney ?? blank());
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [languages, setLanguages] = useState(a.languages.join(", "));
  const [longBio, setLongBio] = useState(a.longBio.join("\n\n"));
  const [photoError, setPhotoError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const set = (patch: Partial<SiteAttorney>) =>
    setA((x) => ({ ...x, ...patch }));

  const errors = {
    name: a.name.trim() ? "" : editorCopy.required,
    slug: !a.slug
      ? editorCopy.required
      : taken.includes(a.slug)
        ? s.slugTaken
        : "",
    title: a.title.trim() ? "" : editorCopy.required,
    bio: a.bio.trim() ? "" : editorCopy.required,
  };
  const show = (m: string) => (submitted && m ? m : undefined);

  async function upload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError(s.photoError);
      return;
    }
    setPhotoError("");
    set({ image: await toPortrait(file) });
  }

  function done() {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return false;
    onDone({
      ...a,
      name: a.name.trim(),
      title: a.title.trim(),
      bio: a.bio.trim(),
      email: a.email.trim(),
      languages: languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      longBio: longBio
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
      focusAreas: a.focusAreas.map((f) => f.trim()).filter(Boolean),
      admissions: a.admissions.map((f) => f.trim()).filter(Boolean),
      memberships: a.memberships.map((f) => f.trim()).filter(Boolean),
    });
  }

  return (
    <EditorSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isNew ? s.newTitle : s.editTitle}
      description={s.description}
      onDone={done}
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-20 rounded-md after:rounded-md">
          {a.image && (
            <AvatarImage
              src={a.image}
              alt=""
              className="rounded-md object-cover"
            />
          )}
          <AvatarFallback className="rounded-md text-lg">
            {initials(a.name || "?")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{s.photo}</span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => fileRef.current?.click()}
            >
              {a.image ? s.replace : s.upload}
            </Button>
            {a.image && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => set({ image: undefined })}
              >
                {s.removePhoto}
              </Button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-label={s.upload}
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <p
            className={
              photoError
                ? "text-xs text-destructive"
                : "text-xs text-muted-foreground"
            }
          >
            {photoError || s.photoHint}
          </p>
        </div>
      </div>

      <Field data-invalid={Boolean(show(errors.name)) || undefined}>
        <FieldLabel htmlFor={`${id}-name`}>{s.name}</FieldLabel>
        <Input
          id={`${id}-name`}
          value={a.name}
          aria-invalid={Boolean(show(errors.name)) || undefined}
          onChange={(e) =>
            set({
              name: e.target.value,
              ...(slugEdited ? {} : { slug: slugify(e.target.value) }),
            })
          }
        />
        <FieldError>{show(errors.name)}</FieldError>
      </Field>

      <Field data-invalid={Boolean(show(errors.slug)) || undefined}>
        <FieldLabel htmlFor={`${id}-slug`}>{s.slug}</FieldLabel>
        <Input
          id={`${id}-slug`}
          value={a.slug}
          aria-invalid={Boolean(show(errors.slug)) || undefined}
          onChange={(e) => {
            setSlugEdited(true);
            set({ slug: slugify(e.target.value) });
          }}
        />
        {show(errors.slug) ? (
          <FieldError>{show(errors.slug)}</FieldError>
        ) : (
          <FieldDescription>{s.slugHint(a.slug)}</FieldDescription>
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(show(errors.title)) || undefined}>
          <FieldLabel htmlFor={`${id}-title`}>{s.title}</FieldLabel>
          <Input
            id={`${id}-title`}
            value={a.title}
            aria-invalid={Boolean(show(errors.title)) || undefined}
            onChange={(e) => set({ title: e.target.value })}
          />
          <FieldError>{show(errors.title)}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-years`}>{s.years}</FieldLabel>
          <Input
            id={`${id}-years`}
            type="number"
            min={0}
            max={60}
            inputMode="numeric"
            value={a.yearsOfExperience}
            onChange={(e) =>
              set({ yearsOfExperience: Math.max(0, Number(e.target.value)) })
            }
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor={`${id}-email`}>{s.email}</FieldLabel>
        <Input
          id={`${id}-email`}
          type="email"
          value={a.email}
          onChange={(e) => set({ email: e.target.value })}
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">{s.areas}</legend>
        {practiceAreas.map((area) => (
          // biome-ignore lint/a11y/noLabelWithoutControl: the checkbox renders inside the label
          <label key={area.slug} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={a.practiceAreas.includes(area.slug)}
              onCheckedChange={(checked) =>
                set({
                  practiceAreas: checked
                    ? [...a.practiceAreas, area.slug]
                    : a.practiceAreas.filter(
                        (x): x is PracticeAreaSlug => x !== area.slug,
                      ),
                })
              }
            />
            {area.title}
          </label>
        ))}
      </fieldset>

      <Field>
        <FieldLabel htmlFor={`${id}-languages`}>{s.languages}</FieldLabel>
        <Input
          id={`${id}-languages`}
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
        />
        <FieldDescription>{s.languagesHint}</FieldDescription>
      </Field>

      <Field data-invalid={Boolean(show(errors.bio)) || undefined}>
        <FieldLabel htmlFor={`${id}-bio`}>{s.bio}</FieldLabel>
        <Textarea
          id={`${id}-bio`}
          rows={3}
          value={a.bio}
          aria-invalid={Boolean(show(errors.bio)) || undefined}
          onChange={(e) => set({ bio: e.target.value })}
        />
        {show(errors.bio) ? (
          <FieldError>{show(errors.bio)}</FieldError>
        ) : (
          <FieldDescription>{s.bioHint}</FieldDescription>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor={`${id}-long`}>{s.longBio}</FieldLabel>
        <Textarea
          id={`${id}-long`}
          rows={6}
          value={longBio}
          onChange={(e) => setLongBio(e.target.value)}
        />
        <FieldDescription>{s.longBioHint}</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${id}-quote`}>{s.quote}</FieldLabel>
        <Textarea
          id={`${id}-quote`}
          rows={2}
          value={a.quote}
          onChange={(e) => set({ quote: e.target.value })}
        />
      </Field>

      <ListRepeater
        label={s.focusAreas}
        items={a.focusAreas}
        onChange={(focusAreas) => set({ focusAreas })}
      />
      <ListRepeater
        label={s.admissions}
        items={a.admissions}
        onChange={(admissions) => set({ admissions })}
      />
      <ListRepeater
        label={s.memberships}
        items={a.memberships}
        onChange={(memberships) => set({ memberships })}
      />

      <Field orientation="horizontal">
        <Switch
          id={`${id}-featured`}
          checked={Boolean(a.featured)}
          onCheckedChange={(featured) => set({ featured })}
        />
        <FieldLabel htmlFor={`${id}-featured`}>{s.featured}</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Switch
          id={`${id}-visible`}
          checked={a.visible}
          onCheckedChange={(visible) => set({ visible })}
        />
        <FieldLabel htmlFor={`${id}-visible`}>{s.visible}</FieldLabel>
      </Field>
    </EditorSheet>
  );
}
