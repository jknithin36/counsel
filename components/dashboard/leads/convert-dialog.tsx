"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
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
import { toast } from "@/components/ui/toast";
import { convertDialog as copy } from "@/lib/content/dashboard-leads";
import {
  type PracticeAreaSlug,
  practiceAreas,
} from "@/lib/content/practice-areas";
import { suggestedAttorney } from "@/lib/data/attorneys";
import { convertLeadToClient, suggestedMatterTitle } from "@/lib/data/clients";
import { leadName } from "@/lib/data/selectors";
import type { Lead } from "@/lib/data/types";
import { AttorneySelect } from "./attorney-select";

const areaItems = practiceAreas.map((a) => ({ value: a.slug, label: a.title }));
const isArea = (slug: string): slug is PracticeAreaSlug =>
  areaItems.some((a) => a.value === slug);

/** Creates a client + matter from the lead and marks it retained. */
export function ConvertDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const ids = useId();
  const [area, setArea] = useState<PracticeAreaSlug>("personal-injury");
  const [title, setTitle] = useState("");
  const [attorneyId, setAttorneyId] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: prefill each time it opens
  useEffect(() => {
    if (!open) return;
    const start = isArea(lead.practiceArea)
      ? lead.practiceArea
      : "business-law";
    setArea(start);
    setTitle(suggestedMatterTitle(lead, start));
    setAttorneyId(lead.assignedAttorney ?? suggestedAttorney(start).id);
    setSubmitted(false);
  }, [open]);

  const errors = {
    title: title.trim() ? undefined : copy.errors.title,
    attorney: attorneyId ? undefined : copy.errors.attorney,
  };
  const show = (m?: string) => (submitted ? m : undefined);

  function changeArea(next: PracticeAreaSlug) {
    // Keep a custom title; replace one we suggested for the old area.
    if (title === suggestedMatterTitle(lead, area))
      setTitle(suggestedMatterTitle(lead, next));
    setArea(next);
  }

  function save() {
    setSubmitted(true);
    if (errors.title || !attorneyId) return;
    const matterId = convertLeadToClient({
      leadId: lead.id,
      matterTitle: title,
      practiceArea: area,
      leadAttorneyId: attorneyId,
    });
    if (!matterId) return;
    onOpenChange(false);
    toast.add({
      title: copy.done(matterId),
      actionProps: {
        children: copy.openMatter,
        onClick: () => router.push(`/dashboard/matters/${matterId}`),
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">
            {copy.title}
          </DialogTitle>
          <DialogDescription>
            {copy.description(leadName(lead))}
          </DialogDescription>
        </DialogHeader>
        <form
          id={`${ids}-form`}
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <Field>
            <FieldLabel htmlFor={`${ids}-area`}>{copy.area}</FieldLabel>
            <Select
              items={areaItems}
              value={area}
              onValueChange={(v) => v && changeArea(v as PracticeAreaSlug)}
            >
              <SelectTrigger id={`${ids}-area`} className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {areaItems.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field data-invalid={Boolean(show(errors.title)) || undefined}>
            <FieldLabel htmlFor={`${ids}-title`}>{copy.matterTitle}</FieldLabel>
            <Input
              id={`${ids}-title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={Boolean(show(errors.title)) || undefined}
              className="h-9"
            />
            <FieldError>{show(errors.title)}</FieldError>
          </Field>
          <Field data-invalid={Boolean(show(errors.attorney)) || undefined}>
            <FieldLabel htmlFor={`${ids}-attorney`}>{copy.attorney}</FieldLabel>
            <AttorneySelect
              id={`${ids}-attorney`}
              area={area}
              value={attorneyId}
              onChange={setAttorneyId}
              invalid={Boolean(show(errors.attorney))}
            />
            <FieldError>{show(errors.attorney)}</FieldError>
          </Field>
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => onOpenChange(false)}
          >
            {copy.cancel}
          </Button>
          <Button type="submit" form={`${ids}-form`} size="sm" className="h-9">
            {copy.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
