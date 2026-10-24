"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { firm } from "@/lib/config/firm";
import { requestAppointment } from "@/lib/data/portal";
import { findDemoUser } from "@/lib/data/seed/users";
import { useDemoStore } from "@/lib/data/store";
import type { MeetingType, PortalAppointment } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { MATTER_ID, PortalPage } from "./shared";

function downloadCalendar(appointment: PortalAppointment) {
  const start = new Date(appointment.start);
  const end = new Date(start.getTime() + 45 * 60_000);
  const stamp = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const text = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${appointment.id}@counsel.demo\nDTSTART:${stamp(start)}\nDTEND:${stamp(end)}\nSUMMARY:${appointment.agenda}\nDESCRIPTION:Fictional appointment with Calloway and Reyes\nEND:VEVENT\nEND:VCALENDAR`;
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "counsel-appointment.ics";
  link.click();
  URL.revokeObjectURL(url);
}

function RequestDialog({ appointment }: { appointment?: PortalAppointment }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(
    appointment ? "Reschedule request" : "Case update",
  );
  const [type, setType] = useState<MeetingType>(appointment?.type ?? "video");
  const [times, setTimes] = useState<string[]>([]);
  const options = ["Weekday mornings", "Weekday afternoons", "After 5 PM"];
  const submit = () => {
    requestAppointment({
      topic,
      type,
      preferredTimes: times.length ? times : ["Please contact me"],
      rescheduleId: appointment?.id,
    });
    toast.add({
      title: "Request sent",
      description: "Your legal team will confirm a time.",
      type: "success",
    });
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant={appointment ? "outline" : "default"} />}
      >
        {appointment ? "Request to reschedule" : "Request an appointment"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Request to reschedule" : "Request an appointment"}
          </DialogTitle>
          <DialogDescription>
            This sends a message to your legal team. It does not change the
            calendar yet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="appointment-topic">
            {appointment ? "Reason" : "Topic"}
          </Label>
          {appointment ? (
            <Textarea
              id="appointment-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          ) : (
            <Input
              id="appointment-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          )}
        </div>
        <div className="grid gap-2">
          <Label>Meeting type</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as MeetingType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="in_person">In person</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Preferred times</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((option) => (
              <Button
                key={option}
                type="button"
                variant={times.includes(option) ? "default" : "outline"}
                onClick={() =>
                  setTimes((current) =>
                    current.includes(option)
                      ? current.filter((item) => item !== option)
                      : [...current, option],
                  )
                }
              >
                {option}
              </Button>
            ))}
          </div>
        </fieldset>
        <DialogFooter>
          <Button onClick={submit} disabled={!topic.trim()}>
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AppointmentCard({ appointment }: { appointment: PortalAppointment }) {
  const user = findDemoUser(appointment.withId);
  const withinJoinWindow =
    Math.abs(new Date(appointment.start).getTime() - Date.now()) <= 15 * 60_000;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl">
              {formatDate(appointment.start)}
            </CardTitle>
            <p className="mt-1 text-muted-foreground">
              {formatDate(appointment.start, true).split(", ").at(-1)} ·{" "}
              {appointment.type.replace("_", " ")}
            </p>
          </div>
          <span className="text-sm">With {user?.name}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{appointment.agenda}</p>
        {appointment.type === "video" && (
          <Button
            disabled={!withinJoinWindow}
            title={
              withinJoinWindow
                ? "Join now"
                : "Available 15 minutes before the appointment"
            }
          >
            Join video call
          </Button>
        )}
        {appointment.type === "phone" && (
          <p className="rounded-lg bg-muted p-3">
            We'll call you at (555) 555-2300.
          </p>
        )}
        {appointment.type === "in_person" && (
          <p className="rounded-lg bg-muted p-3">
            {firm.address.line1}, {firm.address.city}, {firm.address.region}{" "}
            {firm.address.postalCode}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => downloadCalendar(appointment)}
          >
            Add to calendar
          </Button>
          {appointment.status === "upcoming" && (
            <RequestDialog appointment={appointment} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AppointmentsPage() {
  const allAppointments = useDemoStore((s) => s.appointments);
  const appointments = allAppointments.filter(
    (item) => item.matterId === MATTER_ID,
  );
  return (
    <PortalPage
      title="Appointments"
      description="Your meetings and calls with the legal team."
      actions={<RequestDialog />}
    >
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {appointments
            .filter((item) => item.status === "upcoming")
            .map((item) => (
              <AppointmentCard key={item.id} appointment={item} />
            ))}
          {!appointments.some((item) => item.status === "upcoming") && (
            <p className="rounded-lg border p-8 text-center text-muted-foreground">
              No upcoming appointments.
            </p>
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-4">
          {appointments
            .filter((item) => item.status === "past")
            .map((item) => (
              <AppointmentCard key={item.id} appointment={item} />
            ))}
          {!appointments.some((item) => item.status === "past") && (
            <p className="rounded-lg border p-8 text-center text-muted-foreground">
              No past appointments.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </PortalPage>
  );
}
