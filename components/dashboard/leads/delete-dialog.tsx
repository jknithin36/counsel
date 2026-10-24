"use client";

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
import { toast } from "@/components/ui/toast";
import { leadsPage } from "@/lib/content/dashboard-leads";
import { deleteLead } from "@/lib/data/leads";

const copy = leadsPage.deleteDialog;

/** Confirms, then deletes one or more leads. */
export function DeleteLeadsDialog({
  ids,
  open,
  onOpenChange,
  onDeleted,
}: {
  ids: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  function confirm() {
    for (const id of ids) deleteLead(id);
    onOpenChange(false);
    toast.add({ title: copy.done(ids.length) });
    onDeleted?.();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title(ids.length)}</AlertDialogTitle>
          <AlertDialogDescription>{copy.body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm">{copy.cancel}</AlertDialogCancel>
          <AlertDialogAction size="sm" variant="destructive" onClick={confirm}>
            {copy.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
