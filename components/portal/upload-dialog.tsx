"use client";

import { Upload04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { uploadDialog as copy, documentsPage } from "@/lib/content/portal";
import { uploadPortalDocument } from "@/lib/data/portal";
import type { DocumentCategory } from "@/lib/data/types";
import { ChoiceSelect } from "../dashboard/content/shared";

const size = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** Upload a new document, or fulfil one the firm requested. */
export function UploadDialog({
  requestId,
  requestName,
  trigger,
}: {
  requestId?: string;
  /** The requested document's name, shown as the dialog title. */
  requestName?: string;
  trigger?: React.ReactElement;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("medical");
  const inputRef = useRef<HTMLInputElement>(null);

  function change(next: boolean) {
    setOpen(next);
    if (!next) {
      setFile(null);
      setComment("");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    uploadPortalDocument({
      file: { name: file.name, size: file.size },
      requestId,
      category,
      comment,
    });
    toast.add({ title: copy.done, description: copy.doneDetail });
    change(false);
  }

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogTrigger render={trigger ?? <Button size="sm" className="h-8" />}>
        {!requestId && (
          <HugeiconsIcon
            icon={Upload04Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
        )}
        {requestId ? documentsPage.requested.action : documentsPage.upload}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form className="flex flex-col gap-5" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{requestName ?? copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          {!requestId && (
            <Field>
              <FieldLabel htmlFor={`${id}-type`}>{copy.type}</FieldLabel>
              <ChoiceSelect
                id={`${id}-type`}
                value={category}
                onChange={(v) => setCategory(v as DocumentCategory)}
                options={copy.types}
              />
            </Field>
          )}
          <button
            type="button"
            className="flex min-h-28 w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed px-4 text-center hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            onClick={() => inputRef.current?.click()}
          >
            <HugeiconsIcon
              icon={Upload04Icon}
              strokeWidth={1.5}
              className="size-5 text-muted-foreground"
            />
            <span className="text-sm font-medium">
              {file ? file.name : copy.choose}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {file ? `${size(file.size)} · ${copy.replace}` : copy.accepted}
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            tabIndex={-1}
            aria-label={copy.choose}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Field>
            <FieldLabel htmlFor={`${id}-comment`}>{copy.comment}</FieldLabel>
            <Textarea
              id={`${id}-comment`}
              rows={3}
              value={comment}
              placeholder={copy.commentPlaceholder}
              onChange={(e) => setComment(e.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => change(false)}
            >
              {copy.cancel}
            </Button>
            <Button type="submit" size="sm" className="h-8" disabled={!file}>
              {copy.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
