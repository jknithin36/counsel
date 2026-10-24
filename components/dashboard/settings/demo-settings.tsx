"use client";

import { Download04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
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
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import { settingsPage } from "@/lib/content/dashboard-admin";
import { resetDemoData } from "@/lib/data/demo-data";
import { STORE_KEY, useDemoStore } from "@/lib/data/store";
import { SectionCard } from "../section-card";

const copy = settingsPage.demo;
/** Browsers allow roughly 5 MB of localStorage per site. */
const LIMIT = 5 * 1024 * 1024;

const size = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function storedBytes() {
  try {
    // localStorage keeps UTF-16, two bytes per character.
    return (localStorage.getItem(STORE_KEY)?.length ?? 0) * 2;
  } catch {
    return 0;
  }
}

export function DemoSettings() {
  const [bytes, setBytes] = useState(0);
  useEffect(() => {
    const measure = () => setBytes(storedBytes());
    measure();
    // Persist writes after notifying subscribers; measure once it has.
    return useDemoStore.subscribe(() => queueMicrotask(measure));
  }, []);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function exportJson() {
    const raw = localStorage.getItem(STORE_KEY) ?? "{}";
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(JSON.parse(raw), null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `counsel-demo-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.add({ title: copy.exportDone });
  }

  function reset() {
    resetDemoData();
    useDemoStore.getState().resetCustomizations();
    setConfirmOpen(false);
    toast.add({ title: copy.resetDone });
  }

  return (
    <SectionCard title={copy.title} description={copy.description}>
      <div className="flex flex-col divide-y">
        <div className="flex flex-col gap-2 pb-4">
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="font-medium">{copy.storage}</span>
            <span className="text-muted-foreground tabular-nums">
              {copy.storageDetail(size(bytes), size(LIMIT))}
            </span>
          </div>
          <Progress
            value={Math.min(100, (bytes / LIMIT) * 100)}
            aria-label={copy.storage}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-sm font-medium">{copy.export}</p>
            <p className="text-xs text-muted-foreground">{copy.exportHint}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={exportJson}
          >
            <HugeiconsIcon
              icon={Download04Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {copy.export}
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="max-w-md">
            <p className="text-sm font-medium">{copy.reset}</p>
            <p className="text-xs text-muted-foreground">{copy.resetHint}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => setConfirmOpen(true)}
          >
            {copy.reset}
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.resetDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {copy.resetDialog.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">
              {copy.resetDialog.cancel}
            </AlertDialogCancel>
            <AlertDialogAction size="sm" variant="destructive" onClick={reset}>
              {copy.resetDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionCard>
  );
}
