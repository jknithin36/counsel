"use client";

import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { contentPage as copy } from "@/lib/content/dashboard-admin";
import { resetContent } from "@/lib/data/admin";
import { useDemoStatus } from "../demo-data-provider";
import { DirtyReporter } from "../editor-kit";
import { LeaveGuard } from "../leave-guard";
import { PageHeader } from "../page-header";
import { PageSkeleton } from "../page-skeleton";
import { AnnouncementEditor } from "./announcement-editor";
import { AttorneysEditor } from "./attorneys-editor";
import { FaqEditor } from "./faq-editor";
import { PracticeAreasEditor } from "./practice-areas-editor";
import { ResultsEditor } from "./results-editor";
import { TestimonialsEditor } from "./testimonials-editor";

type Tab = (typeof copy.tabs)[number]["value"];
const tabs = copy.tabs.map((t) => t.value) as Tab[];

const editors: Record<Tab, () => React.ReactNode> = {
  announcement: AnnouncementEditor,
  attorneys: AttorneysEditor,
  practiceAreas: PracticeAreasEditor,
  results: ResultsEditor,
  testimonials: TestimonialsEditor,
  faqs: FaqEditor,
};

/** Where "View site" goes for each tab. */
const sitePath: Record<Tab, string> = {
  announcement: "/",
  attorneys: "/attorneys",
  practiceAreas: "/practice-areas",
  results: "/results",
  testimonials: "/#testimonials",
  faqs: "/faq",
};

export function ContentPage() {
  const status = useDemoStatus();
  const router = useRouter();
  const params = useSearchParams();
  const fromUrl = params.get("tab") as Tab | null;
  const tab: Tab = fromUrl && tabs.includes(fromUrl) ? fromUrl : "announcement";

  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<Tab | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  // Bumped on reset so every editor reloads from the defaults.
  const [generation, setGeneration] = useState(0);
  const report = useCallback((value: boolean) => setDirty(value), []);

  const go = (next: Tab) =>
    router.replace(next === "announcement" ? "?" : `?tab=${next}`, {
      scroll: false,
    });

  function onTabChange(next: Tab) {
    if (next === tab) return;
    if (dirty) setPending(next);
    else go(next);
  }

  function reset() {
    resetContent();
    setGeneration((g) => g + 1);
    setResetOpen(false);
    toast.add({ title: copy.resetDone });
  }

  if (status !== "ready") return <PageSkeleton />;
  const Editor = editors[tab];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={copy.title}
        description={copy.subtitle}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setResetOpen(true)}
            >
              {copy.reset}
            </Button>
            <Button
              size="sm"
              className="h-8"
              nativeButton={false}
              render={
                // biome-ignore lint/a11y/useAnchorContent: content comes from children
                <a href={sitePath[tab]} target="_blank" rel="noreferrer" />
              }
            >
              {copy.viewSite}
              <HugeiconsIcon
                icon={LinkSquare02Icon}
                strokeWidth={2}
                data-icon="inline-end"
              />
            </Button>
          </>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) => onTabChange(v as Tab)}
        className="gap-4"
      >
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <TabsList>
            {copy.tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="px-3">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value={tab} className="max-w-3xl">
          <DirtyReporter value={report}>
            <Editor key={`${tab}-${generation}`} />
          </DirtyReporter>
        </TabsContent>
      </Tabs>

      <LeaveGuard
        open={pending !== null}
        onStay={() => setPending(null)}
        onLeave={() => {
          if (pending) go(pending);
          setDirty(false);
          setPending(null);
        }}
      />

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
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
    </div>
  );
}
