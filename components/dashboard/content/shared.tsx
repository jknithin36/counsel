"use client";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { editorCopy } from "@/lib/content/dashboard-admin";
import { currentUser } from "@/lib/data/leads";
import { useDemoStore } from "@/lib/data/store";
import type { ContentOverrides, ContentSection } from "@/lib/data/types";

/** Saves a content section as the signed-in user and confirms it. */
export function publish(
  section: ContentSection,
  patch: Partial<ContentOverrides>,
  name: string,
) {
  useDemoStore.getState().setContent(section, patch, currentUser().name);
  toast.add({ title: editorCopy.saved(name) });
}

export function usePublished(section: ContentSection) {
  return useDemoStore((s) => s.contentOverrides.published?.[section]);
}

/** "Jane Doe" → "jane-doe". */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A right-hand sheet for editing one item; Done applies it to the draft. */
export function EditorSheet({
  open,
  onOpenChange,
  title,
  description,
  onDone,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Returns false to keep the sheet open (e.g. invalid input). */
  onDone: () => boolean | undefined;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (onDone() !== false) onOpenChange(false);
          }}
        >
          <SheetHeader className="border-b p-5 pr-12">
            <SheetTitle className="font-serif text-[26px] leading-tight font-normal">
              {title}
            </SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
            {children}
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => onOpenChange(false)}
            >
              {editorCopy.cancel}
            </Button>
            <Button type="submit" size="sm" className="h-8">
              {editorCopy.done}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/** A Select over a short list of value/label options. */
export function ChoiceSelect({
  id,
  value,
  onChange,
  options,
  className,
  disabled,
  "aria-label": ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      disabled={disabled}
      onValueChange={(v) => onChange(String(v))}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className={className ?? "h-9 w-full"}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** Asks before removing an item from a draft list. */
export function ConfirmDelete({
  name,
  onCancel,
  onConfirm,
}: {
  /** The item's name; null keeps the dialog closed. */
  name: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const c = editorCopy.confirmDelete;
  return (
    <AlertDialog
      open={name !== null}
      onOpenChange={(open) => !open && onCancel()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{c.title(name ?? "")}</AlertDialogTitle>
          <AlertDialogDescription>{c.body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm">{c.cancel}</AlertDialogCancel>
          <AlertDialogAction
            size="sm"
            variant="destructive"
            onClick={onConfirm}
          >
            {c.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
