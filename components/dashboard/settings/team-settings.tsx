"use client";

import { Add01Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StaffRole } from "@/lib/auth/roles";
import { defaultTeam } from "@/lib/config/defaults";
import { editorCopy, settingsPage } from "@/lib/content/dashboard-admin";
import { saveTeam } from "@/lib/data/admin";
import { currentUser } from "@/lib/data/leads";
import { useDemoStore } from "@/lib/data/store";
import type { TeamMember } from "@/lib/data/types";
import { timeAgo } from "@/lib/format";
import { ChoiceSelect, newId } from "../content/shared";
import { EditorCard, useDirty } from "../editor-kit";
import { StatusBadge, type Tone } from "../status-badge";
import { TipButton } from "../tip-button";
import { useRestriction } from "./shared";

const copy = settingsPage.team;
const statusTone: Record<TeamMember["status"], Tone> = {
  active: "green",
  invited: "amber",
  deactivated: "neutral",
};
const roleOptions = copy.roles.map((r) => ({ ...r }));

export function TeamSettings() {
  const seededAt = useDemoStore((s) => s.seededAt);
  const stored = useDemoStore((s) => s.team);
  const published = useDemoStore((s) => s.settings.published?.team);
  const restricted = useRestriction("manageTeam");
  // Seeded "last active" times are relative to when the demo was set up.
  const [live] = useState(
    () => stored ?? defaultTeam(seededAt ? new Date(seededAt) : new Date()),
  );
  const current = stored ?? live;
  const [draft, setDraft] = useState(current);
  const dirty = useDirty(draft, current);
  const [inviteOpen, setInviteOpen] = useState(false);
  const me = currentUser().id;

  const patch = (memberId: string, change: Partial<TeamMember>) =>
    setDraft((list) =>
      list.map((m) => (m.id === memberId ? { ...m, ...change } : m)),
    );

  function save() {
    saveTeam(draft);
    toast.add({ title: editorCopy.saved(settingsPage.savedName.team) });
  }

  const locked = (m: TeamMember) =>
    restricted ?? (m.id === me ? copy.selfLocked : undefined);

  return (
    <>
      <EditorCard
        kind="settings"
        title={copy.title}
        description={copy.description}
        published={published}
        dirty={dirty}
        disabledReason={restricted}
        onDiscard={() => setDraft(current)}
        onSave={save}
        action={
          <Restricted reason={restricted}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              disabled={Boolean(restricted)}
              onClick={() => setInviteOpen(true)}
            >
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              {copy.invite}
            </Button>
          </Restricted>
        }
      >
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{copy.columns.member}</TableHead>
                <TableHead>{copy.columns.role}</TableHead>
                <TableHead>{copy.columns.status}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {copy.columns.lastActive}
                </TableHead>
                <TableHead>
                  <span className="sr-only">{copy.columns.actions}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {draft.map((m) => {
                const reason = locked(m);
                return (
                  <TableRow key={m.id}>
                    <TableCell className="min-w-44">
                      <span className="block font-medium">
                        {m.name}
                        {m.id === me && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            ({copy.you})
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {m.email}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-36">
                      <Restricted reason={reason}>
                        <ChoiceSelect
                          aria-label={`${copy.columns.role}: ${m.name}`}
                          className="h-8 w-32"
                          value={m.role}
                          disabled={Boolean(reason)}
                          onChange={(role) =>
                            patch(m.id, { role: role as StaffRole })
                          }
                          options={roleOptions}
                        />
                      </Restricted>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={statusTone[m.status]}>
                        {copy.statuses[m.status]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-muted-foreground tabular-nums md:table-cell">
                      {m.lastActive ? timeAgo(m.lastActive) : copy.never}
                    </TableCell>
                    <TableCell className="text-right">
                      <Restricted reason={reason}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <TipButton
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={copy.actions.menu(m.name)}
                                disabled={Boolean(reason)}
                              />
                            }
                          >
                            <HugeiconsIcon
                              icon={MoreHorizontalIcon}
                              strokeWidth={2}
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {m.status === "invited" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    toast.add({ title: copy.resent(m.email) })
                                  }
                                >
                                  {copy.actions.resend}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() =>
                                    setDraft((list) =>
                                      list.filter((x) => x.id !== m.id),
                                    )
                                  }
                                >
                                  {copy.actions.revoke}
                                </DropdownMenuItem>
                              </>
                            )}
                            {m.status === "active" && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  patch(m.id, { status: "deactivated" })
                                }
                              >
                                {copy.actions.deactivate}
                              </DropdownMenuItem>
                            )}
                            {m.status === "deactivated" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  patch(m.id, { status: "active" })
                                }
                              >
                                {copy.actions.reactivate}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Restricted>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </EditorCard>

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        taken={draft.map((m) => m.email.toLowerCase())}
        onInvite={(member) => setDraft((list) => [...list, member])}
      />
    </>
  );
}

/** Wraps a disabled control so its tooltip still explains why. */
function Restricted({
  reason,
  children,
}: {
  reason?: string;
  children: React.ReactNode;
}) {
  if (!reason) return children;
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}

function InviteDialog({
  open,
  onOpenChange,
  taken,
  onInvite,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taken: string[];
  onInvite: (member: TeamMember) => void;
}) {
  const id = useId();
  const d = copy.dialog;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("paralegal");
  const [submitted, setSubmitted] = useState(false);
  const errors = {
    name: name.trim() ? "" : editorCopy.required,
    email: !/^\S+@\S+\.\S+$/.test(email.trim())
      ? settingsPage.firm.invalidEmail
      : taken.includes(email.trim().toLowerCase())
        ? d.duplicate
        : "",
  };
  const show = (m: string) => (submitted && m ? m : undefined);

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setName("");
      setEmail("");
      setRole("paralegal");
      setSubmitted(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            if (errors.name || errors.email) return;
            onInvite({
              id: newId("u"),
              name: name.trim(),
              email: email.trim(),
              role,
              practiceAreas: [],
              status: "invited",
            });
            close(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>{d.title}</DialogTitle>
            <DialogDescription>{d.description}</DialogDescription>
          </DialogHeader>
          <Field data-invalid={Boolean(show(errors.name)) || undefined}>
            <FieldLabel htmlFor={`${id}-name`}>{d.name}</FieldLabel>
            <Input
              id={`${id}-name`}
              value={name}
              aria-invalid={Boolean(show(errors.name)) || undefined}
              onChange={(e) => setName(e.target.value)}
            />
            <FieldError>{show(errors.name)}</FieldError>
          </Field>
          <Field data-invalid={Boolean(show(errors.email)) || undefined}>
            <FieldLabel htmlFor={`${id}-email`}>{d.email}</FieldLabel>
            <Input
              id={`${id}-email`}
              type="email"
              value={email}
              aria-invalid={Boolean(show(errors.email)) || undefined}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FieldError>{show(errors.email)}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-role`}>{d.role}</FieldLabel>
            <ChoiceSelect
              id={`${id}-role`}
              value={role}
              onChange={(v) => setRole(v as StaffRole)}
              options={roleOptions}
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => close(false)}
            >
              {d.cancel}
            </Button>
            <Button type="submit" size="sm" className="h-8">
              {d.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
