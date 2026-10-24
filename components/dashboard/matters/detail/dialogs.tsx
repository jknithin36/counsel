"use client";

import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { addDays, format } from "date-fns";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { matterDetail as copy } from "@/lib/content/dashboard-practice";
import { addTask, postUpdate, setTeam, updateTask } from "@/lib/data/matters";
import { staffUsers } from "@/lib/data/seed/users";
import type { Matter, MatterTask, TaskPriority } from "@/lib/data/types";
import { AttorneySelect } from "../../leads/attorney-select";
import { TeamPicker } from "../matter-bits";

function DatePicker({
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
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function Footer({
  formId,
  cancel,
  submit,
  onCancel,
}: {
  formId: string;
  cancel: string;
  submit: string;
  onCancel: () => void;
}) {
  return (
    <DialogFooter>
      <Button variant="outline" size="sm" className="h-9" onClick={onCancel}>
        {cancel}
      </Button>
      <Button type="submit" form={formId} size="sm" className="h-9">
        {submit}
      </Button>
    </DialogFooter>
  );
}

export function PostUpdateDialog({
  matterId,
  open,
  onOpenChange,
}: {
  matterId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const c = copy.updateDialog;
  const ids = useId();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [shared, setShared] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setBody("");
    setShared(true);
    setSubmitted(false);
  }, [open]);

  const errors = {
    title: title.trim() ? "" : c.errors.title,
    body: body.trim() ? "" : c.errors.body,
  };

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (errors.title || errors.body) return;
    postUpdate(matterId, { title, body, shared });
    toast.add({ title: c.posted });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">
            {c.title}
          </DialogTitle>
        </DialogHeader>
        <form id={`${ids}-form`} className="grid gap-4" onSubmit={save}>
          <Field
            data-invalid={(submitted && Boolean(errors.title)) || undefined}
          >
            <FieldLabel htmlFor={`${ids}-title`}>{c.updateTitle}</FieldLabel>
            <Input
              id={`${ids}-title`}
              className="h-9"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <FieldError>{submitted ? errors.title : undefined}</FieldError>
          </Field>
          <Field
            data-invalid={(submitted && Boolean(errors.body)) || undefined}
          >
            <FieldLabel htmlFor={`${ids}-body`}>{c.body}</FieldLabel>
            <Textarea
              id={`${ids}-body`}
              rows={5}
              placeholder={c.bodyPlaceholder}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <FieldError>{submitted ? errors.body : undefined}</FieldError>
          </Field>
          <Field
            orientation="horizontal"
            className="items-start justify-between"
          >
            <div>
              <FieldLabel htmlFor={`${ids}-shared`}>{c.shared}</FieldLabel>
              <FieldDescription>{c.sharedHint}</FieldDescription>
            </div>
            <Switch
              id={`${ids}-shared`}
              checked={shared}
              onCheckedChange={setShared}
            />
          </Field>
        </form>
        <Footer
          formId={`${ids}-form`}
          cancel={c.cancel}
          submit={c.post}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function TeamDialog({
  matter,
  open,
  onOpenChange,
}: {
  matter: Matter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const c = copy.teamDialog;
  const ids = useId();
  const [lead, setLead] = useState<string | undefined>(matter.leadAttorneyId);
  const [team, setTeamState] = useState<string[]>(matter.team);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when opened
  useEffect(() => {
    if (!open) return;
    setLead(matter.leadAttorneyId);
    setTeamState(matter.team);
  }, [open]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!lead) return;
    setTeam(matter.id, lead, team);
    toast.add({ title: c.saved });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">
            {c.title}
          </DialogTitle>
        </DialogHeader>
        <form id={`${ids}-form`} className="grid gap-4" onSubmit={save}>
          <Field>
            <FieldLabel htmlFor={`${ids}-lead`}>{c.lead}</FieldLabel>
            <AttorneySelect
              id={`${ids}-lead`}
              area={matter.practiceArea}
              value={lead}
              onChange={setLead}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-team`}>{c.members}</FieldLabel>
            <TeamPicker
              id={`${ids}-team`}
              value={team}
              onChange={setTeamState}
              lockedId={lead}
            />
          </Field>
        </form>
        <Footer
          formId={`${ids}-form`}
          cancel={c.cancel}
          submit={c.save}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

const priorities: TaskPriority[] = ["high", "medium", "low"];
const people = staffUsers.map((u) => ({ value: u.id, label: u.name }));
const priorityItems = priorities.map((p) => ({
  value: p,
  label: copy.tasks.priority[p],
}));

/** Add a task, or edit one when `task` is given. */
export function TaskDialog({
  matter,
  task,
  open,
  onOpenChange,
}: {
  matter: Matter;
  task?: MatterTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const c = copy.tasks.dialog;
  const ids = useId();
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(matter.leadAttorneyId);
  const [due, setDue] = useState<Date | undefined>();
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [submitted, setSubmitted] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: prefill when opened
  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setAssignee(task?.assigneeId ?? matter.leadAttorneyId);
    setDue(task ? new Date(task.dueAt) : addDays(new Date(), 7));
    setPriority(task?.priority ?? "medium");
    setSubmitted(false);
  }, [open]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!title.trim()) return;
    const dueAt = (due ?? addDays(new Date(), 7)).toISOString();
    if (task) {
      updateTask(matter.id, task.id, {
        title: title.trim(),
        assigneeId: assignee,
        dueAt,
        priority,
      });
      toast.add({ title: c.saved });
    } else {
      addTask(matter.id, { title, assigneeId: assignee, dueAt, priority });
      toast.add({ title: c.added });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">
            {task ? c.edit : c.add}
          </DialogTitle>
        </DialogHeader>
        <form
          id={`${ids}-form`}
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={save}
        >
          <Field
            className="sm:col-span-2"
            data-invalid={(submitted && !title.trim()) || undefined}
          >
            <FieldLabel htmlFor={`${ids}-title`}>{c.title}</FieldLabel>
            <Input
              id={`${ids}-title`}
              className="h-9"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <FieldError>
              {submitted && !title.trim() ? c.required : undefined}
            </FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-assignee`}>{c.assignee}</FieldLabel>
            <Select
              items={people}
              value={assignee}
              onValueChange={(v) => setAssignee(v as string)}
            >
              <SelectTrigger id={`${ids}-assignee`} className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {people.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${ids}-priority`}>{c.priority}</FieldLabel>
            <Select
              items={priorityItems}
              value={priority}
              onValueChange={(v) => setPriority(v as TaskPriority)}
            >
              <SelectTrigger id={`${ids}-priority`} className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityItems.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor={`${ids}-due`}>{c.due}</FieldLabel>
            <DatePicker
              id={`${ids}-due`}
              value={due}
              onChange={setDue}
              placeholder={c.pickDate}
            />
          </Field>
        </form>
        <Footer
          formId={`${ids}-form`}
          cancel={c.cancel}
          submit={c.save}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
