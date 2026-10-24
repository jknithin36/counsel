"use client";

import { Search01Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { isSameMonth } from "date-fns";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { documentsPage as copy } from "@/lib/content/dashboard-office";
import { documentHistory, documentUpdatedAt } from "@/lib/data/documents";
import { documentCategoryLabels } from "@/lib/data/labels";
import { useDemoStore } from "@/lib/data/store";
import type { DocumentCategory, MatterDocument } from "@/lib/data/types";
import { useDemoStatus } from "../demo-data-provider";
import { FacetedFilter } from "../faceted-filter";
import { PageHeader } from "../page-header";
import { PageSkeleton } from "../page-skeleton";
import { SectionCard } from "../section-card";
import {
  RequestDocumentDialog,
  UploadDocumentDialog,
} from "./document-dialogs";
import { DocumentsTable } from "./documents-table";

const tabFilter: Record<string, (d: MatterDocument) => boolean> = {
  all: () => true,
  requested: (d) => d.status === "requested",
  review: (d) => d.status === "uploaded",
  signature: (d) => d.status === "sent_for_signature",
  signed: (d) => d.status === "signed",
};

const categoryOptions = (
  Object.keys(documentCategoryLabels) as DocumentCategory[]
).map((value) => ({
  value,
  label: documentCategoryLabels[value],
}));

export function DocumentsPage() {
  const status = useDemoStatus();
  const documents = useDemoStore((s) => s.documents);
  const matters = useDemoStore((s) => s.matters);
  const clients = useDemoStore((s) => s.clients);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const searchable = useMemo(
    () =>
      documents.map((d) => {
        const matter = matters.find((m) => m.id === d.matterId);
        const client = clients.find((c) => c.id === matter?.clientId);
        return {
          doc: d,
          text: `${d.name} ${matter?.id} ${matter?.title} ${client?.name}`.toLowerCase(),
        };
      }),
    [documents, matters, clients],
  );

  if (status !== "ready") return <PageSkeleton />;

  const now = new Date();
  const counts = {
    requested: documents.filter(tabFilter.requested).length,
    review: documents.filter(tabFilter.review).length,
    signature: documents.filter(tabFilter.signature).length,
    signed: documents.filter(
      (d) =>
        d.status === "signed" &&
        isSameMonth(
          new Date(documentHistory(d).at(-1)?.at ?? d.uploadedAt),
          now,
        ),
    ).length,
  };

  const q = query.trim().toLowerCase();
  const typeCounts = new Map<string, number>();
  for (const d of documents.filter(tabFilter[tab]))
    typeCounts.set(
      d.category ?? "other",
      (typeCounts.get(d.category ?? "other") ?? 0) + 1,
    );
  const visible = searchable
    .filter(({ doc, text }) => tabFilter[tab](doc) && (!q || text.includes(q)))
    .filter(
      ({ doc }) =>
        types.length === 0 || types.includes(doc.category ?? "other"),
    )
    .map(({ doc }) => doc)
    .sort((a, b) => documentUpdatedAt(b).localeCompare(documentUpdatedAt(a)));

  const summary = [
    { label: copy.summary.requested, value: counts.requested },
    { label: copy.summary.review, value: counts.review },
    { label: copy.summary.signature, value: counts.signature },
    { label: copy.summary.signed, value: counts.signed },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title={copy.title}
        description={copy.subtitle}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-input"
              onClick={() => setRequestOpen(true)}
            >
              {copy.request}
            </Button>
            <Button
              size="sm"
              className="h-9"
              onClick={() => setUploadOpen(true)}
            >
              <HugeiconsIcon icon={Upload04Icon} />
              {copy.upload}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label}>
            <CardContent>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-serif text-[32px] leading-none tabular-nums">
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
            <TabsList>
              {copy.tabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="px-3">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-80">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              data-table-search
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.search}
              aria-label={copy.search}
              className="h-8 pl-8"
            />
          </div>
          <FacetedFilter
            title={copy.type}
            options={categoryOptions}
            selected={types}
            counts={typeCounts}
            onChange={setTypes}
          />
        </div>
        <SectionCard
          title={copy.tabs.find((t) => t.value === tab)?.label ?? ""}
          contentClassName="px-0"
        >
          <DocumentsTable documents={visible} showMatter />
        </SectionCard>
      </div>

      <RequestDocumentDialog open={requestOpen} onOpenChange={setRequestOpen} />
      <UploadDocumentDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
