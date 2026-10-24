"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createContext, useContext, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
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
import { urgencies } from "@/lib/config/lead-status";
import { newLeadDialog as copy } from "@/lib/content/dashboard-leads";
import { practiceAreas } from "@/lib/content/practice-areas";
import { practiceAreaLabel, sourceLabels } from "@/lib/data/labels";
import { createIntakeLead } from "@/lib/data/leads";
import { leadName } from "@/lib/data/selectors";
import type { LeadSource, Urgency } from "@/lib/data/types";
import { formatPhone } from "@/lib/format";
import { AttorneySelect } from "./attorney-select";

const e = copy.errors;
const areaValues = [
  ...practiceAreas.map((a) => a.slug),
  "general-inquiry",
] as const;
const sources = Object.keys(sourceLabels) as LeadSource[];

const schema = z
  .object({
    firstName: z.string().trim().min(1, e.firstName),
    lastName: z.string().trim().min(1, e.lastName),
    phone: z
      .string()
      .trim()
      .refine((v) => v === "" || v.replace(/\D/g, "").length === 10, e.phone),
    email: z.union([z.literal(""), z.email(e.email)]),
    practiceArea: z.enum(areaValues, { error: e.area }),
    source: z.enum(sources as [LeadSource, ...LeadSource[]]),
    urgency: z.enum(["urgent", "soon", "researching"]),
    description: z.string().trim().min(10, e.description),
    assignedAttorney: z.string().optional(),
  })
  .refine((v) => v.phone !== "" || v.email !== "", {
    message: e.contact,
    path: ["phone"],
  });

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

const OpenContext = createContext<() => void>(() => {});

/** Opens the New lead dialog from anywhere in the dashboard. */
export function useNewLead() {
  return useContext(OpenContext);
}

export function NewLeadProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <OpenContext value={() => setOpen(true)}>
      {children}
      <NewLeadDialog open={open} onOpenChange={setOpen} />
    </OpenContext>
  );
}

const defaults: FormInput = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  practiceArea: undefined as unknown as FormInput["practiceArea"],
  source: "phone",
  urgency: "soon",
  description: "",
  assignedAttorney: undefined,
};

function NewLeadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const ids = useId();
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const area = watch("practiceArea");

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) reset(defaults);
  }

  const onSubmit = handleSubmit((values) => {
    const lead = createIntakeLead({
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      email: values.email,
      practiceArea: values.practiceArea,
      source: values.source,
      urgency: values.urgency as Urgency,
      description: values.description,
      assignedAttorney: values.assignedAttorney,
      preferredContact: values.phone ? "phone" : "email",
      language: "English",
      preferredTimes: [],
      meetingType: "phone",
      consent: true,
    });
    close(false);
    toast.add({
      title: copy.done(leadName(lead)),
      actionProps: {
        children: copy.view,
        onClick: () => router.push(`/dashboard/leads/${lead.id}`),
      },
    });
  });

  const field = (name: keyof FormInput) => ({
    id: `${ids}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${ids}-${name}-error` : undefined,
  });
  const error = (name: keyof FormInput) => (
    <FieldError id={`${ids}-${name}-error`}>{errors[name]?.message}</FieldError>
  );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">
            {copy.title}
          </DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <form
          id={`${ids}-form`}
          noValidate
          onSubmit={onSubmit}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field data-invalid={Boolean(errors.firstName) || undefined}>
            <FieldLabel htmlFor={`${ids}-firstName`}>
              {copy.firstName}
            </FieldLabel>
            <Input
              className="h-9"
              autoComplete="off"
              {...field("firstName")}
              {...register("firstName")}
            />
            {error("firstName")}
          </Field>
          <Field data-invalid={Boolean(errors.lastName) || undefined}>
            <FieldLabel htmlFor={`${ids}-lastName`}>{copy.lastName}</FieldLabel>
            <Input
              className="h-9"
              autoComplete="off"
              {...field("lastName")}
              {...register("lastName")}
            />
            {error("lastName")}
          </Field>
          <Field data-invalid={Boolean(errors.phone) || undefined}>
            <FieldLabel htmlFor={`${ids}-phone`}>{copy.phone}</FieldLabel>
            <Controller
              control={control}
              name="phone"
              render={({ field: f }) => (
                <Input
                  className="h-9"
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  {...field("phone")}
                  value={f.value}
                  onBlur={f.onBlur}
                  ref={f.ref}
                  onChange={(ev) => f.onChange(formatPhone(ev.target.value))}
                />
              )}
            />
            {error("phone")}
          </Field>
          <Field data-invalid={Boolean(errors.email) || undefined}>
            <FieldLabel htmlFor={`${ids}-email`}>{copy.email}</FieldLabel>
            <Input
              className="h-9"
              type="email"
              autoComplete="off"
              {...field("email")}
              {...register("email")}
            />
            {error("email")}
          </Field>

          <Field data-invalid={Boolean(errors.practiceArea) || undefined}>
            <FieldLabel htmlFor={`${ids}-practiceArea`}>{copy.area}</FieldLabel>
            <Controller
              control={control}
              name="practiceArea"
              render={({ field: f }) => (
                <Select
                  items={areaValues.map((v) => ({
                    value: v,
                    label: practiceAreaLabel(v),
                  }))}
                  value={f.value ?? null}
                  onValueChange={(v) => f.onChange(v)}
                >
                  <SelectTrigger
                    className="h-9 w-full"
                    {...field("practiceArea")}
                  >
                    <SelectValue placeholder={copy.areaPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {areaValues.map((v) => (
                      <SelectItem key={v} value={v}>
                        {practiceAreaLabel(v)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {error("practiceArea")}
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-source`}>{copy.source}</FieldLabel>
            <Controller
              control={control}
              name="source"
              render={({ field: f }) => (
                <Select
                  items={sources.map((v) => ({
                    value: v,
                    label: sourceLabels[v],
                  }))}
                  value={f.value}
                  onValueChange={(v) => f.onChange(v)}
                >
                  <SelectTrigger className="h-9 w-full" id={`${ids}-source`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((v) => (
                      <SelectItem key={v} value={v}>
                        {sourceLabels[v]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-urgency`}>{copy.urgency}</FieldLabel>
            <Controller
              control={control}
              name="urgency"
              render={({ field: f }) => (
                <Select
                  items={urgencies}
                  value={f.value}
                  onValueChange={(v) => f.onChange(v)}
                >
                  <SelectTrigger className="h-9 w-full" id={`${ids}-urgency`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencies.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-assignedAttorney`}>
              {copy.attorney}
            </FieldLabel>
            <Controller
              control={control}
              name="assignedAttorney"
              render={({ field: f }) => (
                <AttorneySelect
                  id={`${ids}-assignedAttorney`}
                  area={area ?? ""}
                  value={f.value}
                  onChange={f.onChange}
                  allowUnassigned
                  placeholder={copy.attorneyNone}
                />
              )}
            />
          </Field>
          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(errors.description) || undefined}
          >
            <FieldLabel htmlFor={`${ids}-description`}>
              {copy.description_}
            </FieldLabel>
            <Textarea
              rows={4}
              placeholder={copy.descriptionPlaceholder}
              {...field("description")}
              {...register("description")}
            />
            {error("description")}
          </Field>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => close(false)}
          >
            {copy.cancel}
          </Button>
          <Button type="submit" form={`${ids}-form`} size="sm" className="h-9">
            {copy.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
