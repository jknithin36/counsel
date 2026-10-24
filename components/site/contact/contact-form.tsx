"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { formatPhone } from "@/components/site/consultation/schema";
import {
  describedBy,
  Field,
  inputClass,
  textareaClass,
} from "@/components/site/forms/fields";
import { Button } from "@/components/ui/button";
import { contactPage as c } from "@/lib/content/pages";
import { createLead } from "@/lib/data/leads";

const schema = z.object({
  name: z.string().trim().min(2, c.errors.name).max(120),
  email: z.email(c.errors.email),
  phone: z.string().refine((v) => {
    const digits = v.replace(/\D/g, "").length;
    return digits === 0 || digits === 10;
  }, c.errors.phone),
  message: z.string().trim().min(10, c.errors.message).max(2000),
  consent: z.literal(true, { error: c.errors.consent }),
});

type Input = z.input<typeof schema>;
type Values = z.output<typeof schema>;

export function ContactForm() {
  const [sentRef, setSentRef] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Input, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  async function onSubmit(values: Values) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const [firstName, ...rest] = values.name.split(/\s+/);
    const lead = createLead({
      practiceArea: "general-inquiry",
      firstName,
      lastName: rest.join(" "),
      email: values.email,
      phone: values.phone,
      preferredContact: values.phone ? "phone" : "email",
      language: "English",
      description: values.message,
      urgency: "soon",
      preferredTimes: [],
      meetingType: "phone",
      source: "website",
      consent: values.consent,
    });
    reset();
    setSentRef(lead.id);
  }

  if (sentRef) {
    return (
      <output className="block rounded-[10px] border border-border p-8">
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          strokeWidth={1.5}
          className="size-10 text-[#1f7a45]"
        />
        <h3 className="mt-5 text-[28px] text-[#111]">{c.success.title}</h3>
        <p className="mt-3 text-[17px] leading-[1.6] text-[#3a3a3a]">
          {c.success.body(sentRef)}
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setSentRef(null)}
        >
          {c.success.another}
        </Button>
      </output>
    );
  }

  const invalid = (name: keyof Input) => Boolean(errors[name]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Field id="name" label={c.fields.name} error={errors.name?.message}>
        <input
          id="name"
          className={inputClass}
          autoComplete="name"
          aria-invalid={invalid("name")}
          aria-describedby={describedBy("name")}
          {...register("name")}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="email" label={c.fields.email} error={errors.email?.message}>
          <input
            id="email"
            type="email"
            className={inputClass}
            autoComplete="email"
            aria-invalid={invalid("email")}
            aria-describedby={describedBy("email")}
            {...register("email")}
          />
        </Field>
        <Field id="phone" label={c.fields.phone} error={errors.phone?.message}>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                className={inputClass}
                autoComplete="tel-national"
                aria-invalid={invalid("phone")}
                aria-describedby={describedBy("phone")}
                ref={field.ref}
                name={field.name}
                value={field.value ?? ""}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(formatPhone(e.target.value))}
              />
            )}
          />
        </Field>
      </div>
      <Field
        id="message"
        label={c.fields.message}
        error={errors.message?.message}
      >
        <textarea
          id="message"
          rows={6}
          className={textareaClass}
          aria-invalid={invalid("message")}
          aria-describedby={describedBy("message")}
          {...register("message")}
        />
      </Field>
      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-[1.6] text-[#3a3a3a]">
          <input
            id="consent"
            type="checkbox"
            className="mt-1 size-5 shrink-0 accent-[#111]"
            aria-invalid={invalid("consent")}
            aria-describedby="consent-error"
            {...register("consent")}
          />
          {c.fields.consent}
        </label>
        <p
          id="consent-error"
          className="mt-1.5 min-h-5 pl-8 text-[13px] leading-5 text-[#b42318]"
        >
          {errors.consent?.message}
        </p>
      </div>
      <div>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? c.sending : c.submit}
        </Button>
      </div>
    </form>
  );
}
