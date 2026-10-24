"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase01Icon,
  Car01Icon,
  File02Icon,
  HelpCircleIcon,
  JusticeScale01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import {
  ChoiceFieldset,
  describedBy,
  Field,
  hiddenInputClass,
  inputClass,
  optionTileClass,
  textareaClass,
} from "@/components/site/forms/fields";
import { Button } from "@/components/ui/button";
import { attorneys, getAttorney } from "@/lib/content/attorneys";
import { consultation as c } from "@/lib/content/consultation";
import {
  getPracticeArea,
  type PracticeAreaSlug,
} from "@/lib/content/practice-areas";
import { createLead } from "@/lib/data/leads";
import { useSettings } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import {
  type ConsultationValues,
  consultationSchema,
  formatPhone,
  practiceAreaOptions,
  stepFields,
} from "./schema";

type FormInput = z.input<typeof consultationSchema>;

const DRAFT_KEY = "counsel-consultation-draft";
const LAST = c.steps.length - 1;

const areaIcons = {
  "personal-injury": Car01Icon,
  "family-law": UserGroupIcon,
  "estate-planning": File02Icon,
  "business-law": Briefcase01Icon,
  "criminal-defense": JusticeScale01Icon,
  "not-sure": HelpCircleIcon,
};

type Draft = { step: number; values: Partial<FormInput> };

function readDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

function writeDraft(draft: Draft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage unavailable: the form still works, just without a draft.
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {}
}

/** Draft first, then ?area= and ?attorney= from the link that got us here. */
function initialState(params: URLSearchParams): Draft {
  const draft = readDraft();
  const values: Partial<FormInput> = {
    preferredTimes: [],
    preferredAttorney: "",
    incidentDate: "",
    opposingParty: "",
    ...draft?.values,
  };

  const area = params.get("area");
  if (area && (practiceAreaOptions as readonly string[]).includes(area)) {
    values.practiceArea = area as FormInput["practiceArea"];
  }
  const attorney = getAttorney(params.get("attorney") ?? "");
  if (attorney) {
    values.preferredAttorney = attorney.slug;
    values.practiceArea ??= attorney.practiceAreas[0];
  }

  return { step: draft?.step ?? 0, values };
}

const optionLabel = (
  options: readonly { value: string; label: string }[],
  value?: string,
) => options.find((o) => o.value === value)?.label;

export function ConsultationForm() {
  const params = useSearchParams();
  const intake = useSettings("intake");
  const router = useRouter();
  const [initial] = useState(() => initialState(params));
  const [step, setStep] = useState(initial.step);
  const [pending, setPending] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const form = useForm<FormInput, unknown, ConsultationValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: initial.values,
    reValidateMode: "onChange",
  });
  const {
    register,
    control,
    formState: { errors },
    watch,
  } = form;

  // Keep a draft of every change (and the current step) for this tab.
  useEffect(() => {
    writeDraft({ step, values: form.getValues() });
    const sub = watch((values) =>
      writeDraft({ step, values: values as Partial<FormInput> }),
    );
    return () => sub.unsubscribe();
  }, [form, watch, step]);

  // Move focus to the new step's heading so screen readers announce it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on step change
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const practiceArea = watch("practiceArea");
  const description = watch("description") ?? "";
  const areaAttorneys =
    practiceArea && practiceArea !== "not-sure"
      ? attorneys.filter((a) => a.practiceAreas.includes(practiceArea))
      : attorneys;

  async function next() {
    const valid = await form.trigger(stepFields[step], { shouldFocus: true });
    if (valid) setStep((s) => Math.min(s + 1, LAST));
  }

  async function submit(values: ConsultationValues) {
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const lead = createLead({
      practiceArea: values.practiceArea,
      preferredAttorney: values.preferredAttorney || undefined,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      preferredContact: values.preferredContact,
      language: values.language,
      incidentDate: values.incidentDate || undefined,
      description: values.description,
      urgency: values.urgency,
      opposingParty: values.opposingParty || undefined,
      preferredTimes: values.preferredTimes,
      meetingType: values.meetingType,
      source: values.source,
      consent: values.consent,
      assignedAttorney: undefined,
    });
    clearDraft();
    router.push(`/consultation/thank-you?ref=${lead.id}`);
  }

  // Enter (or Continue) validates the current step and moves on.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (step < LAST) {
      event.preventDefault();
      void next();
      return;
    }
    void form.handleSubmit(submit)(event);
  }

  const err = (name: keyof FormInput) => errors[name]?.message;
  const invalid = (name: keyof FormInput) => Boolean(errors[name]);

  return (
    <div>
      <Progress step={step} />

      <form onSubmit={onSubmit} noValidate className="mt-10">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-[clamp(1.75rem,3vw,2.25rem)] text-[#111] outline-none"
        >
          {c.steps[step].title}
        </h2>

        <div className="mt-8 flex flex-col gap-4">
          {step === 0 && (
            <ChoiceFieldset
              id="practiceArea"
              legend={c.fields.practiceArea}
              error={err("practiceArea")}
              className="grid gap-3 sm:grid-cols-2"
            >
              {practiceAreaOptions
                .filter(
                  (value) =>
                    value === "not-sure" ||
                    intake.areas[value as PracticeAreaSlug] !== false,
                )
                .map((value) => {
                  const area = getPracticeArea(value);
                  return (
                    <label
                      key={value}
                      className={cn(optionTileClass, "items-start py-4")}
                    >
                      <input
                        type="radio"
                        value={value}
                        className={hiddenInputClass}
                        aria-invalid={invalid("practiceArea")}
                        {...register("practiceArea")}
                      />
                      <HugeiconsIcon
                        icon={areaIcons[value]}
                        strokeWidth={1.5}
                        className="mt-0.5 size-5 shrink-0"
                      />
                      <span>
                        <span className="block font-medium">
                          {area?.title ?? c.notSure.title}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                          {area?.navDescription ?? c.notSure.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
            </ChoiceFieldset>
          )}

          {step === 1 && (
            <>
              <Field
                id="description"
                label={c.fields.description}
                hint={c.fields.descriptionHint}
                error={err("description")}
                aside={
                  <span
                    aria-live="polite"
                    className={cn(
                      "text-[13px] tabular-nums",
                      description.length > 2000
                        ? "text-[#b42318]"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.fields.characters(description.length, 2000)}
                  </span>
                }
              >
                <textarea
                  id="description"
                  rows={6}
                  className={textareaClass}
                  aria-invalid={invalid("description")}
                  aria-describedby={describedBy("description", true)}
                  {...register("description")}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="incidentDate"
                  label={c.fields.incidentDate}
                  hint={c.fields.incidentDateHint}
                >
                  <input
                    id="incidentDate"
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    className={inputClass}
                    aria-describedby={describedBy("incidentDate", true)}
                    {...register("incidentDate")}
                  />
                </Field>
                <Field
                  id="opposingParty"
                  label={c.fields.opposingParty}
                  hint={c.fields.opposingPartyHint}
                >
                  <input
                    id="opposingParty"
                    className={inputClass}
                    autoComplete="off"
                    aria-describedby={describedBy("opposingParty", true)}
                    {...register("opposingParty")}
                  />
                </Field>
              </div>
              <ChoiceFieldset
                id="urgency"
                legend={c.fields.urgency}
                error={err("urgency")}
                className="grid gap-3 sm:grid-cols-3"
              >
                {c.urgency.map((o) => (
                  <label key={o.value} className={optionTileClass}>
                    <input
                      type="radio"
                      value={o.value}
                      className={hiddenInputClass}
                      aria-invalid={invalid("urgency")}
                      {...register("urgency")}
                    />
                    {o.label}
                  </label>
                ))}
              </ChoiceFieldset>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="firstName"
                  label={c.fields.firstName}
                  error={err("firstName")}
                >
                  <input
                    id="firstName"
                    className={inputClass}
                    autoComplete="given-name"
                    aria-invalid={invalid("firstName")}
                    aria-describedby={describedBy("firstName")}
                    {...register("firstName")}
                  />
                </Field>
                <Field
                  id="lastName"
                  label={c.fields.lastName}
                  error={err("lastName")}
                >
                  <input
                    id="lastName"
                    className={inputClass}
                    autoComplete="family-name"
                    aria-invalid={invalid("lastName")}
                    aria-describedby={describedBy("lastName")}
                    {...register("lastName")}
                  />
                </Field>
                <Field id="email" label={c.fields.email} error={err("email")}>
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
                <Field id="phone" label={c.fields.phone} error={err("phone")}>
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
                        placeholder="(555) 555-0100"
                        aria-invalid={invalid("phone")}
                        aria-describedby={describedBy("phone")}
                        ref={field.ref}
                        name={field.name}
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={(e) =>
                          field.onChange(formatPhone(e.target.value))
                        }
                      />
                    )}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ChoiceFieldset
                  id="preferredContact"
                  legend={c.fields.preferredContact}
                  error={err("preferredContact")}
                  className="grid grid-cols-3 gap-2"
                >
                  {c.preferredContact.map((o) => (
                    <label
                      key={o.value}
                      className={cn(optionTileClass, "justify-center px-2")}
                    >
                      <input
                        type="radio"
                        value={o.value}
                        className={hiddenInputClass}
                        aria-invalid={invalid("preferredContact")}
                        {...register("preferredContact")}
                      />
                      {o.label}
                    </label>
                  ))}
                </ChoiceFieldset>
                <ChoiceFieldset
                  id="language"
                  legend={c.fields.language}
                  error={err("language")}
                  className="grid grid-cols-2 gap-2"
                >
                  {c.language.map((o) => (
                    <label
                      key={o.value}
                      className={cn(optionTileClass, "justify-center px-2")}
                    >
                      <input
                        type="radio"
                        value={o.value}
                        lang={o.value === "Spanish" ? "es" : "en"}
                        className={hiddenInputClass}
                        aria-invalid={invalid("language")}
                        {...register("language")}
                      />
                      {o.label}
                    </label>
                  ))}
                </ChoiceFieldset>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <ChoiceFieldset
                id="meetingType"
                legend={c.fields.meetingType}
                error={err("meetingType")}
                className="grid grid-cols-3 gap-2"
              >
                {c.meetingType.map((o) => (
                  <label
                    key={o.value}
                    className={cn(optionTileClass, "justify-center px-2")}
                  >
                    <input
                      type="radio"
                      value={o.value}
                      className={hiddenInputClass}
                      aria-invalid={invalid("meetingType")}
                      {...register("meetingType")}
                    />
                    {o.label}
                  </label>
                ))}
              </ChoiceFieldset>
              <ChoiceFieldset
                id="preferredTimes"
                legend={c.fields.preferredTimes}
                hint={c.fields.preferredTimesHint}
                error={err("preferredTimes")}
                className="flex flex-wrap gap-2"
              >
                {c.preferredTimes.map((time) => (
                  <label
                    key={time}
                    className={cn(optionTileClass, "rounded-full py-2")}
                  >
                    <input
                      type="checkbox"
                      value={time}
                      className={hiddenInputClass}
                      aria-invalid={invalid("preferredTimes")}
                      {...register("preferredTimes")}
                    />
                    {time}
                  </label>
                ))}
              </ChoiceFieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="preferredAttorney"
                  label={c.fields.preferredAttorney}
                >
                  <select
                    id="preferredAttorney"
                    className={inputClass}
                    aria-describedby={describedBy("preferredAttorney")}
                    {...register("preferredAttorney")}
                  >
                    <option value="">{c.fields.noPreference}</option>
                    {areaAttorneys.map((a) => (
                      <option key={a.slug} value={a.slug}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  id="source"
                  label={c.fields.source}
                  error={err("source")}
                >
                  <select
                    id="source"
                    className={inputClass}
                    defaultValue=""
                    aria-invalid={invalid("source")}
                    aria-describedby={describedBy("source")}
                    {...register("source")}
                  >
                    <option value="" disabled>
                      {c.fields.sourcePlaceholder}
                    </option>
                    {c.source.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <Review values={form.getValues()} onEdit={setStep} />
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
                  {err("consent")}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={pending}
            >
              {c.back}
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={pending} aria-busy={pending}>
            {step < LAST ? c.continue : pending ? c.submitting : c.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  const total = c.steps.length;
  return (
    <div>
      <p className="text-[13px] font-medium text-muted-foreground">
        {c.stepOf(step + 1, total)}
      </p>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step + 1}
        aria-valuetext={`${c.stepOf(step + 1, total)}: ${c.steps[step].title}`}
        className="mt-3 h-0.5 bg-[#e8e8e8]"
      >
        <div
          className="h-full bg-[#111]"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>
      <ol className="mt-3 hidden grid-cols-5 gap-2 text-[12px] md:grid">
        {c.steps.map((s, i) => (
          <li
            key={s.short}
            className={i <= step ? "text-[#111]" : "text-muted-foreground"}
          >
            {s.short}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Review({
  values,
  onEdit,
}: {
  values: FormInput;
  onEdit: (step: number) => void;
}) {
  const area =
    getPracticeArea(values.practiceArea ?? "")?.title ?? c.notSure.title;
  const attorney = getAttorney(values.preferredAttorney ?? "")?.name;
  const none = c.notProvided;

  const sections: { step: number; rows: [string, string | undefined][] }[] = [
    { step: 0, rows: [[c.fields.practiceArea, area]] },
    {
      step: 1,
      rows: [
        [c.fields.description, values.description],
        [c.fields.incidentDate, values.incidentDate || none],
        [c.fields.urgency, optionLabel(c.urgency, values.urgency)],
        [c.fields.opposingParty, values.opposingParty || none],
      ],
    },
    {
      step: 2,
      rows: [
        [
          c.fields.firstName,
          `${values.firstName ?? ""} ${values.lastName ?? ""}`,
        ],
        [c.fields.email, values.email],
        [c.fields.phone, values.phone],
        [
          c.fields.preferredContact,
          optionLabel(c.preferredContact, values.preferredContact),
        ],
        [c.fields.language, optionLabel(c.language, values.language)],
      ],
    },
    {
      step: 3,
      rows: [
        [c.fields.meetingType, optionLabel(c.meetingType, values.meetingType)],
        [c.fields.preferredTimes, values.preferredTimes?.join(", ")],
        [c.fields.preferredAttorney, attorney ?? c.fields.noPreference],
        [c.fields.source, optionLabel(c.source, values.source)],
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <section
          key={section.step}
          aria-labelledby={`review-${section.step}`}
          className="rounded-[10px] border border-border p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <h3
              id={`review-${section.step}`}
              className="font-sans text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
            >
              {c.steps[section.step].short}
            </h3>
            <button
              type="button"
              onClick={() => onEdit(section.step)}
              className="text-[14px] font-medium underline underline-offset-4"
              aria-label={`${c.edit} ${c.steps[section.step].short}`}
            >
              {c.edit}
            </button>
          </div>
          <dl className="mt-3 flex flex-col gap-2">
            {section.rows.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-1 sm:grid-cols-[200px_1fr] sm:gap-4"
              >
                <dt className="text-[14px] text-muted-foreground">{label}</dt>
                <dd className="break-words text-[15px] text-[#111]">
                  {value || none}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
