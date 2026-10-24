"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { clientDialog as copy } from "@/lib/content/dashboard-office";
import { updateClient } from "@/lib/data/clients";
import { createClient } from "@/lib/data/matters";
import type { Client } from "@/lib/data/types";
import { formatPhone } from "@/lib/format";
import { MatterDialog } from "../matters/matter-dialog";

type Contact = NonNullable<Client["preferredContact"]>;
const languages = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
];
const contactItems = (Object.keys(copy.methods) as Contact[]).map((value) => ({
  value,
  label: copy.methods[value],
}));

/** "1 Main St, Springfield, ST 00000" → its parts (best effort). */
function splitAddress(address: string) {
  const m = address.match(/^(.*?),\s*(.*?),\s*([A-Z]{2})\s+(\S+)$/);
  return m
    ? { street: m[1], city: m[2], state: m[3], zip: m[4] }
    : {
        street: address === "Address to be confirmed" ? "" : address,
        city: "",
        state: "",
        zip: "",
      };
}

/** New client (optionally followed by a new matter), or edit one. */
export function ClientDialog({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}) {
  const router = useRouter();
  const ids = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState<Client["language"]>("English");
  const [preferred, setPreferred] = useState<Contact>("email");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [notes, setNotes] = useState("");
  const [withMatter, setWithMatter] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [matterFor, setMatterFor] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: prefill when opened
  useEffect(() => {
    if (!open) return;
    const address = splitAddress(client?.address ?? "");
    setName(client?.name ?? "");
    setEmail(client?.email ?? "");
    setPhone(client?.phone ?? "");
    setLanguage(client?.language ?? "English");
    setPreferred(client?.preferredContact ?? "email");
    setStreet(address.street);
    setCity(address.city);
    setState(address.state);
    setZip(address.zip);
    setNotes("");
    setWithMatter(false);
    setSubmitted(false);
  }, [open]);

  const errors = {
    name: name.trim() ? "" : copy.errors.name,
    contact: email.trim() || phone.trim() ? "" : copy.errors.contact,
    email:
      !email.trim() || /^\S+@\S+\.\S+$/.test(email.trim())
        ? ""
        : copy.errors.email,
  };

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (errors.name || errors.contact || errors.email) return;
    const address =
      [
        street.trim(),
        city.trim(),
        [state.trim().toUpperCase(), zip.trim()].filter(Boolean).join(" "),
      ]
        .filter(Boolean)
        .join(", ") || "Address to be confirmed";
    if (client) {
      updateClient(client.id, {
        name: name.trim(),
        email: email.trim(),
        phone,
        address,
        language,
        preferredContact: preferred,
      });
      toast.add({ title: copy.saved });
      onOpenChange(false);
      return;
    }
    const created = createClient({
      name,
      email,
      phone,
      address,
      language,
      preferredContact: preferred,
      note: notes,
    });
    onOpenChange(false);
    toast.add({ title: copy.created(created.name) });
    if (withMatter) setMatterFor(created.id);
    else router.push(`/dashboard/clients/${created.id}`);
  }

  const show = (m: string) => (submitted ? m || undefined : undefined);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-sans text-base font-semibold">
              {client ? copy.editTitle : copy.title}
            </DialogTitle>
            {!client && (
              <DialogDescription>{copy.description}</DialogDescription>
            )}
          </DialogHeader>
          <form
            id={`${ids}-form`}
            className="grid gap-4 sm:grid-cols-6"
            onSubmit={save}
          >
            <Field
              className="sm:col-span-6"
              data-invalid={Boolean(show(errors.name)) || undefined}
            >
              <FieldLabel htmlFor={`${ids}-name`}>{copy.name}</FieldLabel>
              <Input
                id={`${ids}-name`}
                className="h-9"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FieldError>{show(errors.name)}</FieldError>
            </Field>
            <Field
              className="sm:col-span-3"
              data-invalid={
                Boolean(show(errors.contact || errors.email)) || undefined
              }
            >
              <FieldLabel htmlFor={`${ids}-email`}>{copy.email}</FieldLabel>
              <Input
                id={`${ids}-email`}
                type="email"
                className="h-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FieldError>{show(errors.email || errors.contact)}</FieldError>
            </Field>
            <Field className="sm:col-span-3">
              <FieldLabel htmlFor={`${ids}-phone`}>{copy.phone}</FieldLabel>
              <Input
                id={`${ids}-phone`}
                type="tel"
                className="h-9 tabular-nums"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
              />
            </Field>
            <Field className="sm:col-span-3">
              <FieldLabel htmlFor={`${ids}-language`}>
                {copy.language}
              </FieldLabel>
              <Select
                items={languages}
                value={language}
                onValueChange={(v) => setLanguage(v as Client["language"])}
              >
                <SelectTrigger id={`${ids}-language`} className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field className="sm:col-span-3">
              <FieldLabel htmlFor={`${ids}-preferred`}>
                {copy.preferred}
              </FieldLabel>
              <Select
                items={contactItems}
                value={preferred}
                onValueChange={(v) => setPreferred(v as Contact)}
              >
                <SelectTrigger id={`${ids}-preferred`} className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contactItems.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field className="sm:col-span-6">
              <FieldLabel htmlFor={`${ids}-street`}>{copy.street}</FieldLabel>
              <Input
                id={`${ids}-street`}
                className="h-9"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </Field>
            <Field className="sm:col-span-3">
              <FieldLabel htmlFor={`${ids}-city`}>{copy.city}</FieldLabel>
              <Input
                id={`${ids}-city`}
                className="h-9"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Field>
            <Field className="sm:col-span-1">
              <FieldLabel htmlFor={`${ids}-state`}>{copy.state}</FieldLabel>
              <Input
                id={`${ids}-state`}
                className="h-9 uppercase"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={`${ids}-zip`}>{copy.zip}</FieldLabel>
              <Input
                id={`${ids}-zip`}
                className="h-9 tabular-nums"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </Field>
            {!client && (
              <>
                <Field className="sm:col-span-6">
                  <FieldLabel htmlFor={`${ids}-notes`}>{copy.notes}</FieldLabel>
                  <Textarea
                    id={`${ids}-notes`}
                    rows={3}
                    placeholder={copy.notesPlaceholder}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Field>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: the checkbox renders inside the label */}
                <label className="flex items-center gap-2 text-sm sm:col-span-6">
                  <Checkbox
                    checked={withMatter}
                    onCheckedChange={(v) => setWithMatter(Boolean(v))}
                  />
                  {copy.createMatter}
                </label>
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
            <Button
              type="submit"
              form={`${ids}-form`}
              size="sm"
              className="h-9"
            >
              {client ? copy.save : copy.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <MatterDialog
        open={Boolean(matterFor)}
        onOpenChange={(o) => !o && setMatterFor(null)}
        clientId={matterFor ?? undefined}
      />
    </>
  );
}
