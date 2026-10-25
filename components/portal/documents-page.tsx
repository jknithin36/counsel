"use client";

import { Download04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { documentsPage as copy } from "@/lib/content/portal";
import { useDemoStore } from "@/lib/data/store";
import { formatDate } from "@/lib/format";
import { SectionCard } from "../dashboard/section-card";
import { TipButton } from "../dashboard/tip-button";
import { DocumentBadge, PortalPage } from "./shared";
import { UploadDialog } from "./upload-dialog";
import { usePortal, usePortalTasks } from "./use-portal";

export function DocumentsPage() {
  const { matter, client } = usePortal();
  const { toSign, toUpload } = usePortalTasks();
  const allDocs = useDemoStore((s) => s.documents);
  const docs = useMemo(
    () =>
      allDocs
        .filter((d) => d.matterId === matter?.id && d.status !== "requested")
        .toSorted((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    [allDocs, matter],
  );

  return (
    <PortalPage
      title={copy.title}
      description={copy.subtitle}
      actions={<UploadDialog />}
    >
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <SectionCard
          title={copy.requested.title}
          description={copy.requested.description}
        >
          {toUpload.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {copy.requested.empty}
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {toUpload.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{doc.name}</p>
                    {doc.note && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {doc.note}
                      </p>
                    )}
                    {doc.dueAt && (
                      <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                        {copy.requested.due(formatDate(doc.dueAt))}
                      </p>
                    )}
                  </div>
                  <UploadDialog
                    requestId={doc.id}
                    requestName={doc.name}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 shrink-0"
                      />
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title={copy.signature.title}
          description={copy.signature.description}
        >
          {toSign.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {copy.signature.empty}
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {toSign.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                      {copy.signature.sent(formatDate(doc.uploadedAt))}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 shrink-0"
                    nativeButton={false}
                    render={<Link href={`/portal/sign/${doc.id}`} />}
                  >
                    {copy.signature.action}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title={copy.all.title} contentClassName="px-0">
        {docs.length === 0 ? (
          <p className="px-4 text-sm text-muted-foreground">{copy.all.empty}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">{copy.all.columns.name}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {copy.all.columns.from}
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  {copy.all.columns.date}
                </TableHead>
                <TableHead>{copy.all.columns.status}</TableHead>
                <TableHead className="w-12 pr-4">
                  <span className="sr-only">{copy.all.download("")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="max-w-0 pl-4 sm:max-w-none">
                    <span className="block truncate font-medium">
                      {doc.name}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {doc.uploadedBy === client?.id
                      ? copy.all.fromYou
                      : copy.all.fromFirm}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-muted-foreground tabular-nums md:table-cell">
                    {formatDate(doc.uploadedAt)}
                  </TableCell>
                  <TableCell>
                    <DocumentBadge status={doc.status} />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <TipButton
                      variant="ghost"
                      size="icon-sm"
                      aria-label={copy.all.download(doc.name)}
                      className="text-muted-foreground"
                      onClick={() =>
                        toast.add({ title: copy.all.downloadDemo })
                      }
                    >
                      <HugeiconsIcon icon={Download04Icon} strokeWidth={2} />
                    </TipButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </PortalPage>
  );
}
