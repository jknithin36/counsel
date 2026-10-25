"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { formDetail as copy } from "@/lib/content/portal";
import { emptyProvider, savePortalForm } from "@/lib/data/portal";
import { useDemoStore } from "@/lib/data/store";
import type { PortalForm, PortalFormData } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CardEmpty, SectionCard } from "../dashboard/section-card";
import { TipButton } from "../dashboard/tip-button";
import { usePortalStatus } from "./provider";
import { PortalPage } from "./shared";

const e = copy.errors;
const schema = z.object({
  providers: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().trim().min(2, e.name),
        specialty: z.string().trim().min(2, e.specialty),
        phone: z.string().trim().min(7, e.phone),
        firstVisit: z.string().min(1, e.firstVisit),
        stillTreating: z.boolean(),
      }),
    )
    .min(1, e.providers),
  insurance: z.string().trim().min(2, e.insurance),
  pharmacy: z.string().trim().min(2, e.pharmacy),
  consent: z.boolean().refine(Boolean, e.consent),
});
type Values = z.infer<typeof schema>;

const back = { href: "/portal/forms", label: copy.back };
const r = copy.review;

/** Read-only answers, used for review and for submitted forms. */
function Answers({ data }: { data: PortalFormData }) {
  return (
    <dl className="flex flex-col gap-5 text-sm">
      <div>
        <dt className="text-xs text-muted-foreground">{r.providers}</dt>
        <dd className="mt-2">
          {data.providers.length === 0 ? (
            r.none
          ) : (
            <ul className="flex flex-col divide-y rounded-md border">
              {data.providers.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-3 py-2.5"
                >
                  <span>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {p.specialty}
                    </span>
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {p.phone}
                    {p.firstVisit && ` · ${formatDate(p.firstVisit)}`}
                    {p.stillTreating && ` · ${r.still}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </dd>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">{r.insurance}</dt>
          <dd className="mt-1">{data.insurance || r.none}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{r.pharmacy}</dt>
          <dd className="mt-1">{data.pharmacy || r.none}</dd>
        </div>
      </div>
    </dl>
  );
}

export function FormDetail({ formId }: { formId: string }) {
  const record = useDemoStore((s) =>
    s.portalForms.find((f) => f.id === formId),
  );
  const ready = usePortalStatus() === "ready";

  if (!record)
    return (
      <PortalPage title={ready ? copy.notFound : ""} back={back}>
        <CardEmpty>{copy.notFound}</CardEmpty>
      </PortalPage>
    );

  if (record.status === "submitted")
    return (
      <PortalPage
        title={record.name}
        description={copy.submittedOn(
          formatDate(record.submittedAt ?? record.updatedAt),
        )}
        back={back}
      >
        <SectionCard title={copy.answers} className="max-w-3xl">
          <Answers data={record.data} />
        </SectionCard>
      </PortalPage>
    );

  return <Wizard record={record} />;
}

/** The three-step questionnaire; mounted once the saved answers exist. */
function Wizard({ record }: { record: PortalForm }) {
  const formId = record.id;
  const [step, setStep] = useState(0);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...record.data,
      providers: record.data.providers.length
        ? record.data.providers
        : [emptyProvider()],
    },
    mode: "onTouched",
  });
  const providers = useFieldArray({ control: form.control, name: "providers" });
  const errors = form.formState.errors;

  // Autosave as the client types. A field showing an error is re-checked
  // on every change, so the message clears as soon as it's fixed (instead
  // of on blur, which shifts the layout under the Continue button).
  useEffect(() => {
    const sub = form.watch((value, { name }) => {
      savePortalForm(formId, value as Values);
      if (name && form.getFieldState(name).invalid) form.trigger(name);
    });
    return () => sub.unsubscribe();
  }, [form, formId]);

  async function next() {
    const ok =
      step === 0
        ? await form.trigger("providers")
        : await form.trigger(["insurance", "pharmacy"]);
    if (ok) setStep((s) => s + 1);
  }

  const submit = form.handleSubmit((values) => {
    savePortalForm(formId, values, true);
    toast.add({ title: copy.submitted, description: copy.submittedDetail });
  });

  const err = (m?: string) => (m ? m : undefined);

  return (
    <PortalPage title={record.name} description={copy.autosave} back={back}>
      <form onSubmit={submit} className="flex max-w-3xl flex-col gap-4">
        <ol
          className="grid grid-cols-3 gap-2"
          aria-label={copy.stepOf(step + 1, 3)}
        >
          {copy.steps.map((label, i) => (
            <li key={label} aria-current={i === step ? "step" : undefined}>
              <span
                className={cn(
                  "block h-1 rounded-full",
                  i <= step ? "bg-foreground" : "bg-border",
                )}
              />
              <span
                className={cn(
                  "mt-2 block text-xs",
                  i === step
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <span className="sm:hidden">{i + 1}</span>
                <span className="hidden sm:inline">{label}</span>
              </span>
            </li>
          ))}
        </ol>

        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col gap-5 py-5">
            <h2 className="font-sans text-sm font-semibold tracking-normal">
              {copy.stepOf(step + 1, 3)} · {copy.steps[step]}
            </h2>

            {step === 0 && (
              <>
                {providers.fields.map((field, i) => {
                  const pe = errors.providers?.[i];
                  return (
                    <fieldset
                      key={field.id}
                      className="flex flex-col gap-4 rounded-md border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <legend className="text-sm font-medium">
                          {copy.provider(i + 1)}
                        </legend>
                        {providers.fields.length > 1 && (
                          <TipButton
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={copy.removeProvider(i + 1)}
                            className="text-muted-foreground"
                            onClick={() => providers.remove(i)}
                          >
                            <HugeiconsIcon
                              icon={Delete02Icon}
                              strokeWidth={2}
                            />
                          </TipButton>
                        )}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field data-invalid={Boolean(pe?.name) || undefined}>
                          <FieldLabel htmlFor={`p${i}-name`}>
                            {copy.fields.name}
                          </FieldLabel>
                          <Input
                            id={`p${i}-name`}
                            aria-invalid={Boolean(pe?.name) || undefined}
                            {...form.register(`providers.${i}.name`)}
                          />
                          <FieldError>{err(pe?.name?.message)}</FieldError>
                        </Field>
                        <Field
                          data-invalid={Boolean(pe?.specialty) || undefined}
                        >
                          <FieldLabel htmlFor={`p${i}-specialty`}>
                            {copy.fields.specialty}
                          </FieldLabel>
                          <Input
                            id={`p${i}-specialty`}
                            placeholder={copy.fields.specialtyPlaceholder}
                            aria-invalid={Boolean(pe?.specialty) || undefined}
                            {...form.register(`providers.${i}.specialty`)}
                          />
                          <FieldError>{err(pe?.specialty?.message)}</FieldError>
                        </Field>
                        <Field data-invalid={Boolean(pe?.phone) || undefined}>
                          <FieldLabel htmlFor={`p${i}-phone`}>
                            {copy.fields.phone}
                          </FieldLabel>
                          <Input
                            id={`p${i}-phone`}
                            type="tel"
                            inputMode="tel"
                            aria-invalid={Boolean(pe?.phone) || undefined}
                            {...form.register(`providers.${i}.phone`)}
                          />
                          <FieldError>{err(pe?.phone?.message)}</FieldError>
                        </Field>
                        <Field
                          data-invalid={Boolean(pe?.firstVisit) || undefined}
                        >
                          <FieldLabel htmlFor={`p${i}-visit`}>
                            {copy.fields.firstVisit}
                          </FieldLabel>
                          <Input
                            id={`p${i}-visit`}
                            type="date"
                            aria-invalid={Boolean(pe?.firstVisit) || undefined}
                            {...form.register(`providers.${i}.firstVisit`)}
                          />
                          <FieldError>
                            {err(pe?.firstVisit?.message)}
                          </FieldError>
                        </Field>
                      </div>
                      {/* biome-ignore lint/a11y/noLabelWithoutControl: the checkbox renders inside the label */}
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={form.watch(`providers.${i}.stillTreating`)}
                          onCheckedChange={(on) =>
                            form.setValue(
                              `providers.${i}.stillTreating`,
                              on === true,
                            )
                          }
                        />
                        {copy.fields.stillTreating}
                      </label>
                    </fieldset>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 self-start"
                  onClick={() => providers.append(emptyProvider())}
                >
                  {copy.addProvider}
                </Button>
              </>
            )}

            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.insurance) || undefined}>
                  <FieldLabel htmlFor="insurance">
                    {copy.fields.insurance}
                  </FieldLabel>
                  <Input
                    id="insurance"
                    placeholder={copy.fields.insurancePlaceholder}
                    aria-invalid={Boolean(errors.insurance) || undefined}
                    {...form.register("insurance")}
                  />
                  <FieldError>{err(errors.insurance?.message)}</FieldError>
                </Field>
                <Field data-invalid={Boolean(errors.pharmacy) || undefined}>
                  <FieldLabel htmlFor="pharmacy">
                    {copy.fields.pharmacy}
                  </FieldLabel>
                  <Input
                    id="pharmacy"
                    placeholder={copy.fields.pharmacyPlaceholder}
                    aria-invalid={Boolean(errors.pharmacy) || undefined}
                    {...form.register("pharmacy")}
                  />
                  <FieldError>{err(errors.pharmacy?.message)}</FieldError>
                </Field>
              </div>
            )}

            {step === 2 && (
              <>
                <Answers data={form.getValues()} />
                <div className="border-t pt-4">
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: the checkbox renders inside the label */}
                  <label className="flex items-start gap-2 text-sm leading-relaxed">
                    <Checkbox
                      className="mt-0.5"
                      checked={form.watch("consent")}
                      onCheckedChange={(on) =>
                        form.setValue("consent", on === true, {
                          shouldValidate: true,
                        })
                      }
                    />
                    {copy.fields.consent}
                  </label>
                  {errors.consent && (
                    <p className="mt-2 text-sm text-destructive">
                      {errors.consent.message}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="justify-between border-t py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              {copy.back2}
            </Button>
            {step < 2 ? (
              <Button type="button" size="sm" className="h-8" onClick={next}>
                {copy.next}
              </Button>
            ) : (
              <Button type="submit" size="sm" className="h-8">
                {copy.submit}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </PortalPage>
  );
}
