"use client";

import { addDays, format } from "date-fns";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { documentsPage } from "@/lib/content/dashboard-office";
import { requestDocument, uploadDocument } from "@/lib/data/documents";
import { documentCategoryLabels } from "@/lib/data/labels";
import { useDemoStore } from "@/lib/data/store";
import type { DocumentCategory } from "@/lib/data/types";

const c = documentsPage.dialog;
const categories = (
  Object.keys(documentCategoryLabels) as DocumentCategory[]
).map((value) => ({
  value,
  label: documentCategoryLabels[value],
}));

/** Open matters as Select items, "M-2026-0142 · Delgado v. …". */
function useMatterItems() {
  const matters = useDemoStore((s) => s.matters);
  return useMemo(
    () =>
      matters
        .filter((m) => m.status !== "closed")
        .map((m) => ({ value: m.id, label: `${m.id} · ${m.title}` })),
    [matters],
  );
}

function MatterField({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string;
  value: string | null;
  onChange: (id: string) => void;
  invalid: boolean;
}) {
  const items = useMatterItems();
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{c.matter}</FieldLabel>
      <Select
        items={items}
        value={value}
        onValueChange={(v) => onChange(v as string)}
      >
        <SelectTrigger id={id} className="h-9 w-full">
          <SelectValue placeholder={c.matterPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError>{invalid ? c.errors.matter : undefined}</FieldError>
    </Field>
  );
}

function CategoryField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: DocumentCategory;
  onChange: (v: DocumentCategory) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{c.category}</FieldLabel>
      <Select
        items={categories}
        value={value}
        onValueChange={(v) => onChange(v as DocumentCategory)}
      >
        <SelectTrigger id={id} className="h-9 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function Footer({
  formId,
  submit,
  onCancel,
}: {
  formId: string;
  submit: string;
  onCancel: () => void;
}) {
  return (
    <DialogFooter>
      <Button variant="outline" size="sm" className="h-9" onClick={onCancel}>
        {c.cancel}
      </Button>
      <Button type="submit" form={formId} size="sm" className="h-9">
        {submit}
      </Button>
    </DialogFooter>
  );
}

/** Ask the client for a document; with no `matterId`, pick the matter. */
export function RequestDocumentDialog({
  open,
  onOpenChange,
  matterId: fixedMatter,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId?: string;
}) {
  const ids = useId();
  const [matterId, setMatterId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [due, setDue] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("other");
  const [submitted, setSubmitted] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when opened
  useEffect(() => {
    if (!open) return;
    setMatterId(fixedMatter ?? null);
    setName("");
    setNote("");
    setDue(format(addDays(new Date(), 7), "yyyy-MM-dd"));
    setCategory("other");
    setSubmitted(false);
  }, [open]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!matterId || !name.trim()) return;
    requestDocument(matterId, {
      name,
      note,
      category,
      dueAt: due ? new Date(`${due}T17:00:00`).toISOString() : undefined,
    });
    toast.add({ title: documentsPage.toasts.requested(name.trim()) });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">
            {c.requestTitle}
          </DialogTitle>
          <DialogDescription>{c.requestDescription}</DialogDescription>
        </DialogHeader>
        <form id={`${ids}-form`} className="grid gap-4" onSubmit={save}>
          {!fixedMatter && (
            <MatterField
              id={`${ids}-matter`}
              value={matterId}
              onChange={setMatterId}
              invalid={submitted && !matterId}
            />
          )}
          <Field data-invalid={(submitted && !name.trim()) || undefined}>
            <FieldLabel htmlFor={`${ids}-name`}>{c.name}</FieldLabel>
            <Input
              id={`${ids}-name`}
              className="h-9"
              placeholder={c.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FieldError>
              {submitted && !name.trim() ? c.errors.name : undefined}
            </FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-note`}>{c.note}</FieldLabel>
            <Textarea
              id={`${ids}-note`}
              rows={3}
              placeholder={c.notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${ids}-due`}>{c.due}</FieldLabel>
              <Input
                id={`${ids}-due`}
                type="date"
                className="h-9"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </Field>
            <CategoryField
              id={`${ids}-cat`}
              value={category}
              onChange={setCategory}
            />
          </div>
        </form>
        <Footer
          formId={`${ids}-form`}
          submit={c.send}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

/** Pick a matter and a file; only the file's name, type and size are kept. */
export function UploadDocumentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ids = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [matterId, setMatterId] = useState<string | null>(null);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [category, setCategory] = useState<DocumentCategory>("other");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMatterId(null);
    setFile(null);
    setCategory("other");
    setSubmitted(false);
  }, [open]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!matterId || !file) return;
    uploadDocument(matterId, file, category);
    toast.add({ title: documentsPage.toasts.uploaded(file.name) });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">
            {c.uploadTitle}
          </DialogTitle>
          <DialogDescription>{c.uploadDescription}</DialogDescription>
        </DialogHeader>
        <form id={`${ids}-form`} className="grid gap-4" onSubmit={save}>
          <MatterField
            id={`${ids}-matter`}
            value={matterId}
            onChange={setMatterId}
            invalid={submitted && !matterId}
          />
          <Field data-invalid={(submitted && !file) || undefined}>
            <FieldLabel htmlFor={`${ids}-file`}>{c.file}</FieldLabel>
            <div className="flex items-center gap-3">
              <Button
                id={`${ids}-file`}
                type="button"
                variant="outline"
                size="sm"
                className="h-9 border-input"
                onClick={() => fileInput.current?.click()}
              >
                {c.chooseFile}
              </Button>
              <span className="min-w-0 truncate text-sm text-muted-foreground">
                {file?.name}
              </span>
            </div>
            <input
              ref={fileInput}
              type="file"
              className="sr-only"
              tabIndex={-1}
              aria-label={c.file}
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) setFile({ name: picked.name, size: picked.size });
                e.target.value = "";
              }}
            />
            <FieldError>
              {submitted && !file ? c.errors.file : undefined}
            </FieldError>
          </Field>
          <CategoryField
            id={`${ids}-cat`}
            value={category}
            onChange={setCategory}
          />
        </form>
        <Footer
          formId={`${ids}-form`}
          submit={c.upload}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
