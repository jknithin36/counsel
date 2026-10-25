"use client";

import {
  CalendarAdd01Icon,
  Call02Icon,
  Location01Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { appointmentsPage as copy } from "@/lib/content/portal";
import { requestAppointment } from "@/lib/data/portal";
import { findDemoUser } from "@/lib/data/seed/users";
import { useDemoStore } from "@/lib/data/store";
import type { MeetingType, PortalAppointment } from "@/lib/data/types";
import { useFirm } from "@/lib/site-content";
import { ChoiceSelect } from "../dashboard/content/shared";
import { CardEmpty } from "../dashboard/section-card";
import { PortalPage } from "./shared";
import { usePortal } from "./use-portal";

const typeIcon = {
  video: Video01Icon,
  phone: Call02Icon,
  in_person: Location01Icon,
};

function downloadCalendar(appointment: PortalAppointment, firmName: string) {
  const start = new Date(appointment.start);
  const end = new Date(start.getTime() + 45 * 60_000);
  const stamp = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `UID:${appointment.id}@counsel.demo`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${firmName}: ${appointment.agenda}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const url = URL.createObjectURL(
    new Blob([lines.join("\r\n")], { type: "text/calendar" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `appointment-${format(start, "yyyy-MM-dd")}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

function RequestDialog({ appointment }: { appointment?: PortalAppointment }) {
  const id = useId();
  const d = copy.dialog;
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<MeetingType>(appointment?.type ?? "video");
  const [times, setTimes] = useState<string[]>([]);

  function change(next: boolean) {
    setOpen(next);
    if (!next) {
      setTopic("");
      setTimes([]);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    requestAppointment({
      topic: topic.trim(),
      type,
      preferredTimes: times.length ? times : [d.anyTime],
      rescheduleId: appointment?.id,
    });
    toast.add({ title: d.done, description: d.doneDetail });
    change(false);
  }

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogTrigger
        render={
          <Button
            variant={appointment ? "outline" : "default"}
            size="sm"
            className="h-8"
          />
        }
      >
        {appointment ? copy.reschedule : copy.request}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form className="flex flex-col gap-5" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>
              {appointment ? d.rescheduleTitle : d.title}
            </DialogTitle>
            <DialogDescription>{d.description}</DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor={`${id}-topic`}>
              {appointment ? d.reason : d.topic}
            </FieldLabel>
            {appointment ? (
              <Textarea
                id={`${id}-topic`}
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            ) : (
              <Input
                id={`${id}-topic`}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-type`}>{d.type}</FieldLabel>
            <ChoiceSelect
              id={`${id}-type`}
              value={type}
              onChange={(v) => setType(v as MeetingType)}
              options={(Object.keys(copy.types) as MeetingType[]).map((t) => ({
                value: t,
                label: copy.types[t],
              }))}
            />
          </Field>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">{d.times}</legend>
            {d.timeOptions.map((option) => (
              // biome-ignore lint/a11y/noLabelWithoutControl: the checkbox renders inside the label
              <label key={option} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={times.includes(option)}
                  onCheckedChange={(on) =>
                    setTimes((list) =>
                      on ? [...list, option] : list.filter((t) => t !== option),
                    )
                  }
                />
                {option}
              </label>
            ))}
          </fieldset>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => change(false)}
            >
              {d.cancel}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8"
              disabled={!topic.trim()}
            >
              {d.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AppointmentCard({ appointment }: { appointment: PortalAppointment }) {
  const firm = useFirm();
  const person = findDemoUser(appointment.withId);
  const start = new Date(appointment.start);
  const joinable = Math.abs(start.getTime() - Date.now()) <= 15 * 60_000;
  const upcoming = appointment.status === "upcoming";

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 sm:flex-row">
        <div className="flex w-20 shrink-0 flex-col items-start sm:items-center sm:border-r sm:pr-5">
          <span className="text-xs text-muted-foreground uppercase">
            {format(start, "MMM")}
          </span>
          <span className="font-serif text-[40px] leading-none tabular-nums">
            {format(start, "d")}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            {format(start, "EEE")}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <p className="text-sm font-medium">{appointment.agenda}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span className="tabular-nums">{format(start, "h:mm a")}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <HugeiconsIcon
                  icon={typeIcon[appointment.type]}
                  strokeWidth={1.5}
                  className="size-4"
                />
                {copy.types[appointment.type]}
              </span>
              <span aria-hidden="true">·</span>
              <span>{copy.with(person?.name ?? "")}</span>
            </p>
          </div>
          {upcoming && appointment.type === "phone" && (
            <p className="text-sm text-muted-foreground">{copy.phone}</p>
          )}
          {upcoming && appointment.type === "in_person" && (
            <p className="text-sm text-muted-foreground">
              {firm.line1}, {firm.city}, {firm.region} {firm.postalCode}
            </p>
          )}
          {upcoming && (
            <div className="flex flex-wrap gap-2">
              {appointment.type === "video" && (
                <Button size="sm" className="h-8" disabled={!joinable}>
                  {copy.join}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => downloadCalendar(appointment, firm.name)}
              >
                <HugeiconsIcon
                  icon={CalendarAdd01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                {copy.calendar}
              </Button>
              <RequestDialog appointment={appointment} />
            </div>
          )}
          {upcoming && appointment.type === "video" && !joinable && (
            <p className="text-xs text-muted-foreground">{copy.joinHint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AppointmentsPage() {
  const { matter } = usePortal();
  const all = useDemoStore((s) => s.appointments);
  const mine = all.filter((a) => a.matterId === matter?.id);
  const upcoming = mine
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => a.start.localeCompare(b.start));
  const past = mine
    .filter((a) => a.status === "past")
    .sort((a, b) => b.start.localeCompare(a.start));

  return (
    <PortalPage
      title={copy.title}
      description={copy.subtitle}
      actions={<RequestDialog />}
    >
      <Tabs defaultValue="upcoming" className="gap-4">
        <TabsList>
          <TabsTrigger value="upcoming" className="px-3">
            {copy.tabs.upcoming}
          </TabsTrigger>
          <TabsTrigger value="past" className="px-3">
            {copy.tabs.past}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="flex max-w-3xl flex-col gap-4">
          {upcoming.length === 0 ? (
            <CardEmpty>{copy.emptyUpcoming}</CardEmpty>
          ) : (
            upcoming.map((a) => <AppointmentCard key={a.id} appointment={a} />)
          )}
        </TabsContent>
        <TabsContent value="past" className="flex max-w-3xl flex-col gap-4">
          {past.length === 0 ? (
            <CardEmpty>{copy.emptyPast}</CardEmpty>
          ) : (
            past.map((a) => <AppointmentCard key={a.id} appointment={a} />)
          )}
        </TabsContent>
      </Tabs>
    </PortalPage>
  );
}
