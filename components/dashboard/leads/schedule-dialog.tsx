"use client";

import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format, isBefore, startOfDay } from "date-fns";
import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { scheduleDialog as copy } from "@/lib/content/dashboard-leads";
import { suggestedAttorney } from "@/lib/data/attorneys";
import {
  freeSlots,
  scheduleConsultation,
  scheduledFor,
  slotDate,
  slotLabel,
} from "@/lib/data/consultations";
import { meetingTypeLabels, practiceAreaLabel } from "@/lib/data/labels";
import { leadName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type { Consultation, Lead, MeetingType } from "@/lib/data/types";
import { useSettings } from "@/lib/site-content";
import { AttorneySelect } from "./attorney-select";

const types: MeetingType[] = ["video", "phone", "in_person"];

/**
 * Books a consultation for the lead, or moves the one already booked.
 * Without a `lead`, the dialog starts with a lead picker.
 */
export function ScheduleDialog({
  lead: fixedLead,
  open,
  onOpenChange,
}: {
  lead?: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const consultations = useDemoStore((s) => s.consultations);
  const leads = useDemoStore((s) => s.leads);
  const { durations } = useSettings("intake");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const lead = fixedLead ?? leads.find((l) => l.id === pickedId);
  const existing = lead ? scheduledFor(consultations, lead.id) : undefined;
  const ids = useId();
  const pickable = useMemo(
    () =>
      leads
        .filter((l) => l.status !== "retained" && l.status !== "not_a_fit")
        .map((l) => ({
          value: l.id,
          label: `${leadName(l)} · ${practiceAreaLabel(l.practiceArea)}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [leads],
  );

  const [attorneyId, setAttorneyId] = useState<string | undefined>();
  const [day, setDay] = useState<Date | undefined>();
  const [slot, setSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState<Consultation["duration"]>(30);
  const [type, setType] = useState<MeetingType>("video");
  const [notes, setNotes] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // A fresh pick each time the picker version opens.
  useEffect(() => {
    if (open && !fixedLead) setPickedId(null);
  }, [open, fixedLead]);

  // Start from the booked consultation (or sensible defaults) each time
  // the dialog opens or a different lead is picked.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on open or lead change
  useEffect(() => {
    if (!open || !lead) return;
    setAttorneyId(
      existing?.attorneyId ??
        lead.assignedAttorney ??
        suggestedAttorney(lead.practiceArea).id,
    );
    setDay(existing ? new Date(existing.start) : undefined);
    setSlot(existing ? format(new Date(existing.start), "HH:mm") : null);
    setDuration(existing?.duration ?? 30);
    setType(existing?.type ?? lead.meetingType);
    setNotes(existing?.notes ?? "");
    setSubmitted(false);
  }, [open, lead?.id]);

  const slots = useMemo(
    () =>
      attorneyId && day
        ? freeSlots(consultations, attorneyId, day, duration, existing?.id)
        : [],
    [consultations, attorneyId, day, duration, existing?.id],
  );
  const slotValid = slot !== null && slots.includes(slot);

  const errors = {
    lead: !lead ? copy.errors.lead : undefined,
    attorney: !attorneyId ? copy.errors.attorney : undefined,
    date: !day ? copy.errors.date : undefined,
    time: !slotValid ? copy.errors.time : undefined,
  };

  function save() {
    setSubmitted(true);
    if (!lead || !attorneyId || !day || !slot || !slotValid) return;
    const start = slotDate(day, slot);
    scheduleConsultation({
      leadId: lead.id,
      attorneyId,
      start,
      duration,
      type,
      notes: notes.trim(),
    });
    toast.add({
      title: copy.done(leadName(lead), format(start, "MMM d 'at' h:mm a")),
    });
    onOpenChange(false);
  }

  const show = (message?: string) => (submitted ? message : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">
            {existing ? copy.rescheduleTitle : copy.title}
          </DialogTitle>
          <DialogDescription>
            {lead ? copy.description(leadName(lead)) : copy.pickDescription}
          </DialogDescription>
        </DialogHeader>

        <form
          id={`${ids}-form`}
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          {!fixedLead && (
            <Field data-invalid={Boolean(show(errors.lead)) || undefined}>
              <FieldLabel htmlFor={`${ids}-lead`}>{copy.lead}</FieldLabel>
              <Select
                items={pickable}
                value={pickedId}
                onValueChange={(v) => setPickedId(v as string)}
              >
                <SelectTrigger
                  id={`${ids}-lead`}
                  aria-invalid={Boolean(show(errors.lead)) || undefined}
                  className="h-9 w-full"
                >
                  <SelectValue placeholder={copy.pickLead} />
                </SelectTrigger>
                <SelectContent>
                  {pickable.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{show(errors.lead)}</FieldError>
            </Field>
          )}

          <Field data-invalid={Boolean(show(errors.attorney)) || undefined}>
            <FieldLabel htmlFor={`${ids}-attorney`}>{copy.attorney}</FieldLabel>
            <AttorneySelect
              id={`${ids}-attorney`}
              area={lead?.practiceArea ?? ""}
              value={attorneyId}
              onChange={setAttorneyId}
              invalid={Boolean(show(errors.attorney))}
            />
            <FieldError>{show(errors.attorney)}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(show(errors.date)) || undefined}>
              <FieldLabel htmlFor={`${ids}-date`}>{copy.date}</FieldLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      id={`${ids}-date`}
                      variant="outline"
                      aria-invalid={Boolean(show(errors.date)) || undefined}
                      className="h-9 w-full justify-start border-input px-2.5 text-sm font-normal"
                    />
                  }
                >
                  <HugeiconsIcon
                    icon={Calendar03Icon}
                    className="text-muted-foreground"
                  />
                  {day ? (
                    format(day, "EEE, MMM d")
                  ) : (
                    <span className="text-muted-foreground">
                      {copy.pickDate}
                    </span>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={day}
                    onSelect={(date) => {
                      setDay(date);
                      setCalendarOpen(false);
                    }}
                    disabled={[
                      (date) => isBefore(date, startOfDay(new Date())),
                      { dayOfWeek: [0, 6] },
                    ]}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FieldError>{show(errors.date)}</FieldError>
            </Field>

            <Field data-invalid={Boolean(show(errors.time)) || undefined}>
              <FieldLabel htmlFor={`${ids}-time`}>{copy.time}</FieldLabel>
              <Select
                items={slots.map((s) => ({ value: s, label: slotLabel(s) }))}
                value={slotValid ? slot : null}
                onValueChange={(v) => setSlot(v as string)}
                disabled={!day || slots.length === 0}
              >
                <SelectTrigger
                  id={`${ids}-time`}
                  aria-invalid={Boolean(show(errors.time)) || undefined}
                  className="h-9 w-full"
                >
                  <SelectValue
                    placeholder={
                      day && slots.length === 0 ? copy.noSlots : copy.pickTime
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {slots.map((s) => (
                    <SelectItem key={s} value={s}>
                      {slotLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{show(errors.time)}</FieldError>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor={`${ids}-duration`}>{copy.duration}</FieldLabel>
            <Select
              items={durations.map((d) => ({
                value: String(d),
                label: copy.minutes(d),
              }))}
              value={String(duration)}
              onValueChange={(v) =>
                setDuration(Number(v) as Consultation["duration"])
              }
            >
              <SelectTrigger id={`${ids}-duration`} className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durations.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {copy.minutes(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel id={`${ids}-type`}>{copy.type}</FieldLabel>
            <RadioGroup
              aria-labelledby={`${ids}-type`}
              value={type}
              onValueChange={(v) => setType(v as MeetingType)}
              className="flex flex-wrap gap-x-5 gap-y-2"
            >
              {types.map((t) => (
                // biome-ignore lint/a11y/noLabelWithoutControl: the radio renders inside the label
                <label key={t} className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value={t} />
                  {meetingTypeLabels[t]}
                </label>
              ))}
            </RadioGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor={`${ids}-notes`}>{copy.notes}</FieldLabel>
            <Textarea
              id={`${ids}-notes`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={copy.notesPlaceholder}
              rows={3}
            />
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
            {existing ? copy.saveReschedule : copy.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
