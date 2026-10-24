"use client";

import { addMinutes, format, isSameDay, setHours, setMinutes } from "date-fns";
import { meetingTypeLabels } from "./labels";
import { getLead, logLeadEvent, uid, updateLead } from "./leads";
import { findDemoUser } from "./seed/users";
import { leadName } from "./selectors";
import { useDemoStore } from "./store";
import type { Consultation, MeetingType } from "./types";

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** 30-minute slots between two "HH:mm" times (inclusive), as "HH:mm". */
export function slotsBetween(start: string, end: string) {
  const slots: string[] = [];
  for (let t = toMinutes(start); t <= toMinutes(end); t += 30)
    slots.push(
      `${String(Math.floor(t / 60)).padStart(2, "0")}:${t % 60 ? "30" : "00"}`,
    );
  return slots;
}

/** Bookable slots from Settings › Intake (8:00–17:30 by default). */
export function bookableSlots() {
  const intake = useDemoStore.getState().settings.intake;
  return slotsBetween(intake?.slotStart ?? "08:00", intake?.slotEnd ?? "17:30");
}

export function slotLabel(slot: string) {
  const [h, m] = slot.split(":").map(Number);
  return format(setMinutes(setHours(new Date(), h), m), "h:mm a");
}

export function slotDate(day: Date, slot: string) {
  const [h, m] = slot.split(":").map(Number);
  const date = new Date(day);
  date.setHours(h, m, 0, 0);
  return date;
}

/** The lead's upcoming scheduled consultation, if any. */
export function scheduledFor(consultations: Consultation[], leadId: string) {
  return consultations.find(
    (c) => c.leadId === leadId && c.status === "scheduled",
  );
}

/**
 * Slots the attorney has free on `day` for a meeting of `duration` minutes.
 * Ignores `exceptId` (the consultation being rescheduled) and past times.
 */
export function freeSlots(
  consultations: Consultation[],
  attorneyId: string,
  day: Date,
  duration: number,
  exceptId?: string,
  now = new Date(),
) {
  const booked = consultations.filter(
    (c) =>
      c.attorneyId === attorneyId &&
      c.status === "scheduled" &&
      c.id !== exceptId &&
      isSameDay(new Date(c.start), day),
  );
  return bookableSlots().filter((slot) => {
    const start = slotDate(day, slot);
    const end = addMinutes(start, duration);
    if (start <= now) return false;
    return booked.every((c) => {
      const cStart = new Date(c.start);
      const cEnd = addMinutes(cStart, c.duration);
      return end <= cStart || start >= cEnd;
    });
  });
}

export type ScheduleInput = {
  leadId: string;
  attorneyId: string;
  start: Date;
  duration: Consultation["duration"];
  type: MeetingType;
  notes: string;
};

/** Books (or moves) the lead's consultation and updates its status. */
export function scheduleConsultation(input: ScheduleInput) {
  const lead = getLead(input.leadId);
  if (!lead) return;
  const { consultations, mutate } = useDemoStore.getState();
  const existing = scheduledFor(consultations, input.leadId);
  const consultation: Consultation = {
    id: existing?.id ?? `CON-${uid().slice(0, 6).toUpperCase()}`,
    leadId: input.leadId,
    attorneyId: input.attorneyId,
    start: input.start.toISOString(),
    duration: input.duration,
    type: input.type,
    status: "scheduled",
    notes: input.notes,
  };
  mutate((data) => ({
    consultations: existing
      ? data.consultations.map((c) => (c.id === existing.id ? consultation : c))
      : [...data.consultations, consultation],
  }));
  updateLead(input.leadId, {
    status: "consultation_scheduled",
    assignedAttorney: lead.assignedAttorney ?? input.attorneyId,
  });
  const when = format(input.start, "MMM d 'at' h:mm a");
  const attorney = findDemoUser(input.attorneyId)?.name ?? "";
  const verb = existing ? "rescheduled" : "booked";
  logLeadEvent(
    input.leadId,
    {
      type: "consultation",
      message: `Consultation ${verb} for ${when} with ${attorney} (${meetingTypeLabels[input.type].toLowerCase()})`,
    },
    {
      type: "consultation_booked",
      message: `Consultation ${verb} with ${leadName(lead)} for ${format(input.start, "MMM d")}`,
    },
  );
}

/** Cancels the consultation and moves the lead back to Contacted. */
export function cancelConsultation(consultationId: string) {
  const { consultations, mutate } = useDemoStore.getState();
  const consultation = consultations.find((c) => c.id === consultationId);
  if (!consultation) return;
  const lead = getLead(consultation.leadId);
  mutate((data) => ({
    consultations: data.consultations.map((c) =>
      c.id === consultationId ? { ...c, status: "cancelled" } : c,
    ),
  }));
  if (!lead) return;
  if (lead.status === "consultation_scheduled")
    updateLead(lead.id, { status: "contacted" });
  logLeadEvent(
    lead.id,
    {
      type: "consultation",
      message: `Consultation on ${format(new Date(consultation.start), "MMM d")} cancelled`,
    },
    {
      type: "consultation_cancelled",
      message: `Consultation with ${leadName(lead)} cancelled`,
    },
  );
}

/** Marks a consultation completed or as a no-show. */
export function setConsultationStatus(
  consultationId: string,
  status: "completed" | "no_show",
) {
  const { consultations, mutate } = useDemoStore.getState();
  const consultation = consultations.find((c) => c.id === consultationId);
  if (!consultation) return;
  mutate((data) => ({
    consultations: data.consultations.map((c) =>
      c.id === consultationId ? { ...c, status } : c,
    ),
  }));
  const lead = getLead(consultation.leadId);
  if (!lead) return;
  const label = status === "completed" ? "completed" : "marked as a no-show";
  logLeadEvent(
    lead.id,
    {
      type: "consultation",
      message: `Consultation on ${format(new Date(consultation.start), "MMM d")} ${label}`,
    },
    {
      type: "consultation_updated",
      message: `Consultation with ${leadName(lead)} ${label}`,
    },
  );
}

export function updateConsultationNotes(consultationId: string, notes: string) {
  useDemoStore.getState().mutate((data) => ({
    consultations: data.consultations.map((c) =>
      c.id === consultationId ? { ...c, notes } : c,
    ),
  }));
}
