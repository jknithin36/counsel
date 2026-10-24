"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { firm } from "@/lib/config/firm";
import { consultationsPage } from "@/lib/content/dashboard-practice";
import {
  cancelConsultation,
  setConsultationStatus,
  updateConsultationNotes,
} from "@/lib/data/consultations";
import {
  consultationStatusLabels,
  meetingTypeLabels,
  practiceAreaLabel,
} from "@/lib/data/labels";
import { userName } from "@/lib/data/selectors";
import type { Lead } from "@/lib/data/types";
import { ConvertDialog } from "../leads/convert-dialog";
import { changeStatus } from "../leads/lead-actions-menu";
import { UserChip } from "../leads/lead-badges";
import { ScheduleDialog } from "../leads/schedule-dialog";
import { StatusBadge } from "../status-badge";
import { type ConsultationRow, consultationTones } from "./shared";

const s = consultationsPage.sheet;
const r = consultationsPage.retain;

/**
 * Details and status actions for one consultation, plus the follow-up
 * dialogs (reschedule, cancel, retain, convert).
 */
export function ConsultationSheet({
  row,
  onOpenChange,
}: {
  row: ConsultationRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [notes, setNotes] = useState("");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [retainLead, setRetainLead] = useState<Lead | null>(null);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);

  useEffect(() => setNotes(row?.notes ?? ""), [row?.notes]);

  const scheduled = row?.status === "scheduled";
  const address = `${firm.address.line1}, ${firm.address.city}, ${firm.address.region} ${firm.address.postalCode}`;

  return (
    <>
      <Sheet open={Boolean(row)} onOpenChange={onOpenChange}>
        <SheetContent className="w-full gap-0 sm:max-w-md">
          {row && (
            <>
              <SheetHeader className="border-b p-5 pr-12">
                <SheetTitle className="font-serif text-[26px] leading-tight font-normal">
                  {row.lead ? (
                    <Link
                      href={`/dashboard/leads/${row.lead.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {row.name}
                    </Link>
                  ) : (
                    row.name
                  )}
                </SheetTitle>
                <SheetDescription>
                  {row.lead ? practiceAreaLabel(row.lead.practiceArea) : ""}
                </SheetDescription>
                <div className="pt-1">
                  <StatusBadge tone={consultationTones[row.status]}>
                    {consultationStatusLabels[row.status]}
                  </StatusBadge>
                </div>
              </SheetHeader>

              <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">{s.when}</dt>
                    <dd className="mt-1 tabular-nums">
                      {format(row.startDate, "EEE, MMM d")}
                      <span className="block text-muted-foreground">
                        {format(row.startDate, "h:mm")}–
                        {format(row.end, "h:mm a")}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {s.attorney}
                    </dt>
                    <dd className="mt-1">
                      <UserChip
                        userId={row.attorneyId}
                        fallback={userName(row.attorneyId)}
                      />
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">{s.type}</dt>
                    <dd className="mt-1 flex flex-wrap items-center justify-between gap-2">
                      <span>
                        {meetingTypeLabels[row.type]} · {row.duration} min
                      </span>
                      {row.type === "video" && (
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={() => toast.add({ title: s.joinToast })}
                        >
                          {s.join}
                        </Button>
                      )}
                      {row.type === "phone" && row.lead?.phone && (
                        <a
                          href={`tel:${row.lead.phone.replace(/\D/g, "")}`}
                          className="text-sm tabular-nums underline-offset-4 hover:underline"
                        >
                          {s.call(row.lead.phone)}
                        </a>
                      )}
                      {row.type === "in_person" && (
                        <span className="w-full text-muted-foreground">
                          {s.office}: {address}
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="grid gap-1.5">
                  <label
                    htmlFor="consultation-notes"
                    className="text-xs text-muted-foreground"
                  >
                    {s.notes}
                  </label>
                  <Textarea
                    id="consultation-notes"
                    rows={5}
                    value={notes}
                    placeholder={s.notesPlaceholder}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={() => {
                      if (notes === row.notes) return;
                      updateConsultationNotes(row.id, notes);
                      toast.add({ title: s.notesSaved });
                    }}
                  />
                </div>
              </div>

              <SheetFooter className="grid grid-cols-2 gap-2 border-t p-4">
                {scheduled ? (
                  <>
                    <Button
                      size="sm"
                      className="h-9"
                      onClick={() => {
                        setConsultationStatus(row.id, "completed");
                        toast.add({ title: s.completed });
                        if (row.lead && row.lead.status !== "retained")
                          setRetainLead(row.lead);
                      }}
                    >
                      {s.complete}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 border-input"
                      onClick={() => {
                        setConsultationStatus(row.id, "no_show");
                        toast.add({ title: s.markedNoShow });
                      }}
                    >
                      {s.noShow}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 border-input"
                      disabled={!row.lead}
                      onClick={() => setRescheduleOpen(true)}
                    >
                      {s.reschedule}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 text-destructive hover:text-destructive"
                      onClick={() => setCancelOpen(true)}
                    >
                      {s.cancel}
                    </Button>
                  </>
                ) : (
                  row.lead && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="col-span-2 h-9 border-input"
                      nativeButton={false}
                      render={<Link href={`/dashboard/leads/${row.lead.id}`} />}
                    >
                      {s.openLead}
                    </Button>
                  )
                )}
              </SheetFooter>
            </>
          )}
          {/* Nested in the sheet so Escape closes only the top dialog. */}
          {row?.lead && (
            <ScheduleDialog
              lead={row.lead}
              open={rescheduleOpen}
              onOpenChange={setRescheduleOpen}
            />
          )}

          <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{s.cancelDialog.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {s.cancelDialog.body}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel size="sm">
                  {s.cancelDialog.keep}
                </AlertDialogCancel>
                <AlertDialogAction
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (row) cancelConsultation(row.id);
                    setCancelOpen(false);
                    toast.add({ title: s.cancelDialog.done });
                  }}
                >
                  {s.cancelDialog.confirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(retainLead)}
        onOpenChange={(open) => !open && setRetainLead(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans text-base font-semibold">
              {r.title}
            </DialogTitle>
            <DialogDescription>
              {retainLead && r.body(retainLead.firstName)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => setRetainLead(null)}
            >
              {r.later}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => {
                if (retainLead) changeStatus(retainLead, "not_a_fit");
                setRetainLead(null);
              }}
            >
              {r.notFit}
            </Button>
            <Button
              size="sm"
              className="h-9"
              onClick={() => {
                setConvertLead(retainLead);
                setRetainLead(null);
              }}
            >
              {r.convert}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {convertLead && (
        <ConvertDialog
          lead={convertLead}
          open={Boolean(convertLead)}
          onOpenChange={(open) => !open && setConvertLead(null)}
        />
      )}
    </>
  );
}
