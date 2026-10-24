"use client";

import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { matterDialog as copy } from "@/lib/content/dashboard-practice";
import {
  type PracticeAreaSlug,
  practiceAreas,
} from "@/lib/content/practice-areas";
import { suggestedAttorney } from "@/lib/data/attorneys";
import { defaultFeeType } from "@/lib/data/clients";
import { feeTypeLabels } from "@/lib/data/labels";
import { createClient, createMatter, updateMatter } from "@/lib/data/matters";
import { useDemoStore } from "@/lib/data/store";
import type { FeeType, Matter } from "@/lib/data/types";
import { formatPhone } from "@/lib/format";
import { AttorneySelect } from "../leads/attorney-select";
import { TeamPicker } from "./matter-bits";

const areaItems = practiceAreas.map((a) => ({ value: a.slug, label: a.title }));
const feeItems = (Object.keys(feeTypeLabels) as FeeType[]).map((value) => ({
  value,
  label: feeTypeLabels[value],
}));

/** Date button + Calendar popover. */
function DateField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            className="h-9 w-full justify-start border-input px-2.5 text-sm font-normal"
          />
        }
      >
        <HugeiconsIcon
          icon={Calendar03Icon}
          className="text-muted-foreground"
        />
        {value ? (
          format(value, "MMM d, yyyy")
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/** New matter (with an existing or new client), or edit an existing one. */
export function MatterDialog({
  open,
  onOpenChange,
  matter,
  clientId: presetClient,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit this matter instead of creating one. */
  matter?: Matter;
  /** Start a new matter for this client. */
  clientId?: string;
}) {
  const router = useRouter();
  const ids = useId();
  const clients = useDemoStore((s) => s.clients);
  const editing = Boolean(matter);

  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<PracticeAreaSlug>("personal-injury");
  const [leadId, setLeadId] = useState<string | undefined>();
  const [team, setTeam] = useState<string[]>([]);
  const [fee, setFee] = useState<FeeType>("contingency");
  const [opened, setOpened] = useState<Date | undefined>(new Date());
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [deadlineLabel, setDeadlineLabel] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: prefill when opened
  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    if (matter) {
      setTitle(matter.title);
      setArea(matter.practiceArea);
      setLeadId(matter.leadAttorneyId);
      setFee(matter.feeType);
      setAmount(String(matter.budget ?? matter.estimatedValue ?? ""));
      setDeadline(
        matter.nextDeadline ? new Date(matter.nextDeadline.date) : undefined,
      );
      setDeadlineLabel(matter.nextDeadline?.label ?? "");
      return;
    }
    setClientMode("existing");
    setClientId(presetClient ?? null);
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setTitle("");
    setArea("personal-injury");
    setLeadId(suggestedAttorney("personal-injury").id);
    setTeam([]);
    setFee("contingency");
    setOpened(new Date());
    setAmount("");
  }, [open]);

  function changeArea(next: PracticeAreaSlug) {
    setArea(next);
    setFee(defaultFeeType[next]);
    setLeadId(suggestedAttorney(next).id);
  }

  const errors = {
    client:
      !editing && clientMode === "existing" && !clientId
        ? copy.errors.client
        : undefined,
    clientName:
      !editing && clientMode === "new" && !clientName.trim()
        ? copy.errors.clientName
        : undefined,
    contact:
      !editing &&
      clientMode === "new" &&
      !clientEmail.trim() &&
      !clientPhone.trim()
        ? copy.errors.contact
        : undefined,
    title: !title.trim() ? copy.errors.title : undefined,
    attorney: !leadId ? copy.errors.attorney : undefined,
  };
  const show = (m?: string) => (submitted ? m : undefined);
  const invalid = Object.values(errors).some(Boolean);
  const value = amount.trim()
    ? Number(amount.replace(/[^\d.]/g, ""))
    : undefined;

  function save() {
    setSubmitted(true);
    if (invalid || !leadId) return;
    if (matter) {
      updateMatter(matter.id, {
        title: title.trim(),
        leadAttorneyId: leadId,
        feeType: fee,
        budget: fee === "contingency" ? undefined : value,
        estimatedValue: fee === "contingency" ? value : undefined,
        nextDeadline: deadline
          ? {
              date: deadline.toISOString(),
              label: deadlineLabel.trim() || "Deadline",
            }
          : undefined,
      });
      toast.add({ title: copy.saved });
      onOpenChange(false);
      return;
    }
    const owner =
      clientMode === "new"
        ? createClient({
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
          }).id
        : clientId;
    if (!owner) return;
    const created = createMatter({
      clientId: owner,
      title,
      practiceArea: area,
      leadAttorneyId: leadId,
      team,
      feeType: fee,
      openedAt: (opened ?? new Date()).toISOString(),
      amount: value,
    });
    onOpenChange(false);
    toast.add({
      title: copy.created(created.id),
      actionProps: {
        children: "Open",
        onClick: () => router.push(`/dashboard/matters/${created.id}`),
      },
    });
  }

  const clientItems = [...clients]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ value: c.id, label: c.name }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">
            {editing ? copy.editTitle : copy.title}
          </DialogTitle>
          {!editing && (
            <DialogDescription>{copy.description}</DialogDescription>
          )}
        </DialogHeader>

        <form
          id={`${ids}-form`}
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          {!editing && (
            <div className="grid gap-3 sm:col-span-2">
              <Tabs
                value={clientMode}
                onValueChange={(v) => setClientMode(v as "existing" | "new")}
              >
                <TabsList>
                  <TabsTrigger value="existing" className="px-3">
                    {copy.existingClient}
                  </TabsTrigger>
                  <TabsTrigger value="new" className="px-3">
                    {copy.newClient}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {clientMode === "existing" ? (
                <Field data-invalid={Boolean(show(errors.client)) || undefined}>
                  <FieldLabel htmlFor={`${ids}-client`}>
                    {copy.client}
                  </FieldLabel>
                  <Select
                    items={clientItems}
                    value={clientId}
                    onValueChange={(v) => setClientId(v as string)}
                  >
                    <SelectTrigger
                      id={`${ids}-client`}
                      aria-invalid={Boolean(show(errors.client)) || undefined}
                      className="h-9 w-full"
                    >
                      <SelectValue placeholder={copy.clientPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {clientItems.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{show(errors.client)}</FieldError>
                </Field>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    className="sm:col-span-2"
                    data-invalid={Boolean(show(errors.clientName)) || undefined}
                  >
                    <FieldLabel htmlFor={`${ids}-cname`}>
                      {copy.clientName}
                    </FieldLabel>
                    <Input
                      id={`${ids}-cname`}
                      className="h-9"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      aria-invalid={
                        Boolean(show(errors.clientName)) || undefined
                      }
                    />
                    <FieldError>{show(errors.clientName)}</FieldError>
                  </Field>
                  <Field
                    data-invalid={Boolean(show(errors.contact)) || undefined}
                  >
                    <FieldLabel htmlFor={`${ids}-cemail`}>
                      {copy.clientEmail}
                    </FieldLabel>
                    <Input
                      id={`${ids}-cemail`}
                      type="email"
                      className="h-9"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                    <FieldError>{show(errors.contact)}</FieldError>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${ids}-cphone`}>
                      {copy.clientPhone}
                    </FieldLabel>
                    <Input
                      id={`${ids}-cphone`}
                      type="tel"
                      className="h-9"
                      value={clientPhone}
                      onChange={(e) =>
                        setClientPhone(formatPhone(e.target.value))
                      }
                    />
                  </Field>
                </div>
              )}
            </div>
          )}

          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(show(errors.title)) || undefined}
          >
            <FieldLabel htmlFor={`${ids}-title`}>{copy.matterTitle}</FieldLabel>
            <Input
              id={`${ids}-title`}
              className="h-9"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={Boolean(show(errors.title)) || undefined}
            />
            <FieldError>{show(errors.title)}</FieldError>
          </Field>

          {!editing && (
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
          )}
          <Field data-invalid={Boolean(show(errors.attorney)) || undefined}>
            <FieldLabel htmlFor={`${ids}-lead`}>{copy.attorney}</FieldLabel>
            <AttorneySelect
              id={`${ids}-lead`}
              area={area}
              value={leadId}
              onChange={setLeadId}
              invalid={Boolean(show(errors.attorney))}
            />
            <FieldError>{show(errors.attorney)}</FieldError>
          </Field>
          {!editing && (
            <Field>
              <FieldLabel htmlFor={`${ids}-team`}>{copy.team}</FieldLabel>
              <TeamPicker
                id={`${ids}-team`}
                value={team}
                onChange={setTeam}
                lockedId={leadId}
              />
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor={`${ids}-fee`}>{copy.fee}</FieldLabel>
            <Select
              items={feeItems}
              value={fee}
              onValueChange={(v) => setFee(v as FeeType)}
            >
              <SelectTrigger id={`${ids}-fee`} className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {feeItems.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-amount`}>
              {fee === "contingency" ? copy.value : copy.budget}
            </FieldLabel>
            <Input
              id={`${ids}-amount`}
              inputMode="decimal"
              className="h-9 tabular-nums"
              placeholder="$"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^\d.,]/g, ""))
              }
            />
          </Field>
          {!editing ? (
            <Field>
              <FieldLabel htmlFor={`${ids}-opened`}>{copy.opened}</FieldLabel>
              <DateField
                id={`${ids}-opened`}
                value={opened}
                onChange={setOpened}
                placeholder={copy.opened}
              />
            </Field>
          ) : (
            <>
              <Field>
                <FieldLabel htmlFor={`${ids}-deadline`}>
                  {copy.deadline}
                </FieldLabel>
                <DateField
                  id={`${ids}-deadline`}
                  value={deadline}
                  onChange={setDeadline}
                  placeholder={copy.deadline}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${ids}-dlabel`}>
                  {copy.deadlineLabel}
                </FieldLabel>
                <Input
                  id={`${ids}-dlabel`}
                  className="h-9"
                  value={deadlineLabel}
                  onChange={(e) => setDeadlineLabel(e.target.value)}
                />
              </Field>
            </>
          )}
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
            {editing ? copy.save : copy.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
