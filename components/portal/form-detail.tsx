"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import { emptyProvider, savePortalForm } from "@/lib/data/portal";
import { useDemoStore } from "@/lib/data/store";
import { formatDate } from "@/lib/format";

const schema = z.object({
  providers: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(2, "Provider name is required"),
        specialty: z.string().min(2, "Specialty is required"),
        phone: z.string().min(7, "Phone is required"),
        firstVisit: z.string().min(1, "First visit date is required"),
        stillTreating: z.boolean(),
      }),
    )
    .min(1, "Add at least one provider"),
  insurance: z.string().min(2, "Insurance information is required"),
  pharmacy: z.string().min(2, "Pharmacy is required"),
  consent: z.boolean().refine(Boolean, "Please confirm before submitting"),
});
type FormValues = z.infer<typeof schema>;

export function FormDetail({ formId }: { formId: string }) {
  const formRecord = useDemoStore((s) =>
    s.portalForms.find((form) => form.id === formId),
  );
  const [step, setStep] = useState(0);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: formRecord?.data ?? {
      providers: [emptyProvider()],
      insurance: "",
      pharmacy: "",
      consent: false,
    },
    mode: "onBlur",
  });
  const fields = useFieldArray({ control: form.control, name: "providers" });
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (formRecord && formRecord.status !== "submitted")
        savePortalForm(formId, value as FormValues);
    });
    return () => subscription.unsubscribe();
  }, [form, formId, formRecord]);
  if (!formRecord)
    return (
      <div>
        <Button
          variant="link"
          render={<Link href="/portal/forms" />}
          nativeButton={false}
        >
          ← Forms
        </Button>
        <h1 className="mt-6 text-4xl">Form not found</h1>
      </div>
    );
  if (formRecord.status === "submitted")
    return (
      <div className="space-y-6">
        <Button
          variant="link"
          className="px-0"
          render={<Link href="/portal/forms" />}
          nativeButton={false}
        >
          ← Forms
        </Button>
        <header>
          <h1 className="text-4xl">{formRecord.name}</h1>
          <p className="mt-2 text-muted-foreground">
            Submitted{" "}
            {formatDate(formRecord.submittedAt ?? formRecord.updatedAt)}
          </p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Your answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {formRecord.data.providers.length ? (
              formRecord.data.providers.map((provider) => (
                <dl
                  key={provider.id}
                  className="grid gap-2 rounded-lg border p-4 sm:grid-cols-2"
                >
                  <div>
                    <dt className="text-xs text-muted-foreground">Provider</dt>
                    <dd>{provider.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Specialty</dt>
                    <dd>{provider.specialty}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Phone</dt>
                    <dd>{provider.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      First visit
                    </dt>
                    <dd>{provider.firstVisit}</dd>
                  </div>
                </dl>
              ))
            ) : (
              <p>No providers were included on this form.</p>
            )}
            <p>
              <span className="text-muted-foreground">Insurance:</span>{" "}
              {formRecord.data.insurance || "Not provided"}
            </p>
            <p>
              <span className="text-muted-foreground">Pharmacy:</span>{" "}
              {formRecord.data.pharmacy || "Not provided"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  const next = async () => {
    if (step === 0) {
      const valid = await form.trigger("providers");
      if (!valid) return;
    }
    if (step === 1) {
      const valid = await form.trigger(["insurance", "pharmacy"]);
      if (!valid) return;
    }
    setStep((current) => Math.min(2, current + 1));
  };
  const submit = form.handleSubmit((values) => {
    savePortalForm(formId, values, true);
    toast.add({
      title: "Form submitted",
      description: "Your legal team can now review it.",
      type: "success",
    });
  });
  return (
    <div className="space-y-6">
      <Button
        variant="link"
        className="px-0"
        render={<Link href="/portal/forms" />}
        nativeButton={false}
      >
        ← Forms
      </Button>
      <header>
        <h1 className="text-4xl">{formRecord.name}</h1>
        <p className="mt-2 text-muted-foreground">
          Your answers save automatically.
        </p>
      </header>
      <div>
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of 3</span>
          <span>
            {["Providers", "Insurance and pharmacy", "Review and submit"][step]}
          </span>
        </div>
        <Progress value={(step + 1) * 33.333} />
      </div>
      <form onSubmit={submit}>
        <Card>
          <CardContent className="space-y-6 pt-1">
            {step === 0 && (
              <div className="space-y-5">
                {fields.fields.map((field, index) => (
                  <fieldset
                    key={field.id}
                    className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2"
                  >
                    <legend className="px-2 font-medium">
                      Provider {index + 1}
                    </legend>
                    <div className="grid gap-2">
                      <Label htmlFor={`provider-${index}`}>
                        Provider or clinic name
                      </Label>
                      <Input
                        id={`provider-${index}`}
                        {...form.register(`providers.${index}.name`)}
                      />
                      <p className="text-xs text-destructive">
                        {
                          form.formState.errors.providers?.[index]?.name
                            ?.message
                        }
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`specialty-${index}`}>Specialty</Label>
                      <Input
                        id={`specialty-${index}`}
                        {...form.register(`providers.${index}.specialty`)}
                        placeholder="Physical therapy"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`phone-${index}`}>Phone</Label>
                      <Input
                        id={`phone-${index}`}
                        {...form.register(`providers.${index}.phone`)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`visit-${index}`}>First visit date</Label>
                      <Input
                        id={`visit-${index}`}
                        type="date"
                        {...form.register(`providers.${index}.firstVisit`)}
                      />
                    </div>
                    <Label className="flex items-center gap-3">
                      <Checkbox
                        checked={form.watch(`providers.${index}.stillTreating`)}
                        onCheckedChange={(value) =>
                          form.setValue(
                            `providers.${index}.stillTreating`,
                            value === true,
                          )
                        }
                      />
                      Still treating here
                    </Label>
                    {fields.fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => fields.remove(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </fieldset>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fields.append(emptyProvider())}
                >
                  Add another provider
                </Button>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="insurance">Health insurance</Label>
                  <Input
                    id="insurance"
                    {...form.register("insurance")}
                    placeholder="Company and member number"
                  />
                  <p className="text-xs text-destructive">
                    {form.formState.errors.insurance?.message}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pharmacy">Preferred pharmacy</Label>
                  <Input
                    id="pharmacy"
                    {...form.register("pharmacy")}
                    placeholder="Name and location"
                  />
                  <p className="text-xs text-destructive">
                    {form.formState.errors.pharmacy?.message}
                  </p>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <div className="rounded-lg bg-muted p-4">
                  <p className="font-medium">Please review your answers</p>
                  <p className="mt-2 text-muted-foreground">
                    You listed {form.getValues("providers").length} provider(s),{" "}
                    {form.getValues("insurance") || "no insurance"}, and{" "}
                    {form.getValues("pharmacy") || "no pharmacy"}.
                  </p>
                </div>
                <Label className="flex items-start gap-3 leading-relaxed">
                  <Checkbox
                    checked={form.watch("consent")}
                    onCheckedChange={(value) =>
                      form.setValue("consent", value === true, {
                        shouldValidate: true,
                      })
                    }
                  />
                  I confirm these answers are complete and accurate to the best
                  of my knowledge.
                </Label>
                <p className="text-xs text-destructive">
                  {form.formState.errors.consent?.message}
                </p>
              </div>
            )}
            <div className="flex justify-between border-t pt-5">
              <Button
                type="button"
                variant="outline"
                disabled={step === 0}
                onClick={() => setStep((current) => current - 1)}
              >
                Back
              </Button>
              {step < 2 ? (
                <Button type="button" onClick={next}>
                  Continue
                </Button>
              ) : (
                <Button type="submit">Submit form</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
