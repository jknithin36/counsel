import { z } from "zod";
import { consultation } from "@/lib/content/consultation";

const e = consultation.errors;

export const practiceAreaOptions = [
  "personal-injury",
  "family-law",
  "estate-planning",
  "business-law",
  "criminal-defense",
  "not-sure",
] as const;

/** One schema per step; the full form is their merge. */
export const stepSchemas = [
  z.object({
    practiceArea: z.enum(practiceAreaOptions, { error: e.practiceArea }),
  }),
  z.object({
    description: z
      .string()
      .trim()
      .min(30, e.descriptionMin)
      .max(2000, e.descriptionMax),
    incidentDate: z.string().optional(),
    urgency: z.enum(["urgent", "soon", "researching"], { error: e.urgency }),
    opposingParty: z.string().trim().max(200).optional(),
  }),
  z.object({
    firstName: z.string().trim().min(1, e.firstName).max(80),
    lastName: z.string().trim().min(1, e.lastName).max(80),
    email: z.email(e.email),
    phone: z
      .string()
      .refine((v) => v.replace(/\D/g, "").length === 10, e.phone),
    preferredContact: z.enum(["phone", "email", "text"], {
      error: e.preferredContact,
    }),
    language: z.enum(["English", "Spanish"], { error: e.language }),
  }),
  z.object({
    meetingType: z.enum(["in_person", "phone", "video"], {
      error: e.meetingType,
    }),
    preferredTimes: z.array(z.string()).min(1, e.preferredTimes),
    preferredAttorney: z.string().optional(),
    source: z.enum(["website", "phone", "referral", "google", "social"], {
      error: e.source,
    }),
  }),
  z.object({
    consent: z.literal(true, { error: e.consent }),
  }),
] as const;

export const consultationSchema = stepSchemas[0]
  .extend(stepSchemas[1].shape)
  .extend(stepSchemas[2].shape)
  .extend(stepSchemas[3].shape)
  .extend(stepSchemas[4].shape);

export type ConsultationValues = z.infer<typeof consultationSchema>;

/** Field names per step, for step-by-step validation. */
export const stepFields = stepSchemas.map(
  (schema) => Object.keys(schema.shape) as (keyof ConsultationValues)[],
);

export { formatPhone } from "@/lib/format";
