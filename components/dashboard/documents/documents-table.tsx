"use client";

import {
  Doc01Icon,
  Image01Icon,
  MoreHorizontalIcon,
  Pdf01Icon,
  Xls01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { documentsPage as copy } from "@/lib/content/dashboard-office";
import {
  deleteDocument,
  documentHistory,
  documentUpdatedAt,
  sendDocumentReminder,
  setDocumentStatus,
} from "@/lib/data/documents";
import {
  documentCategoryLabels,
  documentStatusLabels,
} from "@/lib/data/labels";
import { isClientAuthor, userName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import type {
  Client,
  DocumentStatus,
  Matter,
  MatterDocument,
} from "@/lib/data/types";
import { formatDate, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatusBadge, type Tone } from "../status-badge";
import { TipButton } from "../tip-button";
import { Spacer, useVirtualRows } from "../use-virtual-rows";

export const docTones: Record<DocumentStatus, Tone> = {
  requested: "amber",
  uploaded: "blue",
  reviewed: "neutral",
  sent_for_signature: "amber",
  signed: "green",
};

const docIcons: Record<MatterDocument["type"], typeof Pdf01Icon> = {
  pdf: Pdf01Icon,
  docx: Doc01Icon,
  image: Image01Icon,
  spreadsheet: Xls01Icon,
};

const typeLabels: Record<MatterDocument["type"], string> = {
  pdf: "PDF",
  docx: "Document",
  image: "Image",
  spreadsheet: "Spreadsheet",
};

const kb = (bytes: number) =>
  bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1000))} KB`;

type Row = MatterDocument & { matter?: Matter; client?: Client };

/** Who did it: staff name, or the client for client uploads. */
function person(id: string, client?: Client) {
  return id.startsWith("cl-") || isClientAuthor(id)
    ? (client?.name ?? "Client")
    : userName(id);
}

/** Documents with status, actions and a preview sheet. */
export function DocumentsTable({
  documents,
  showMatter = false,
}: {
  documents: MatterDocument[];
  /** Adds Matter and Client columns (for lists across matters). */
  showMatter?: boolean;
}) {
  const matters = useDemoStore((s) => s.matters);
  const clients = useDemoStore((s) => s.clients);
  const allDocuments = useDemoStore((s) => s.documents);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const rows: Row[] = documents.map((doc) => {
    const matter = matters.find((m) => m.id === doc.matterId);
    return {
      ...doc,
      matter,
      client: clients.find((c) => c.id === matter?.clientId),
    };
  });
  // From the store, not `rows`: a status change can move the document out
  // of the current filter, and the preview should stay open.
  const previewDoc = allDocuments.find((d) => d.id === previewId);
  const previewMatter = matters.find((m) => m.id === previewDoc?.matterId);
  const preview: Row | null = previewDoc
    ? {
        ...previewDoc,
        matter: previewMatter,
        client: clients.find((c) => c.id === previewMatter?.clientId),
      }
    : null;

  const virtual = useVirtualRows(rows);
  const columnCount = showMatter ? 8 : 6;

  return (
    <>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">{copy.empty}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">{copy.columns.document}</TableHead>
              {showMatter && <TableHead>{copy.columns.matter}</TableHead>}
              {showMatter && (
                <TableHead className="hidden lg:table-cell">
                  {copy.columns.client}
                </TableHead>
              )}
              <TableHead className="hidden sm:table-cell">
                {copy.columns.type}
              </TableHead>
              <TableHead>{copy.columns.status}</TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.columns.owner}
              </TableHead>
              <TableHead>{copy.columns.updated}</TableHead>
              <TableHead className="w-12 pr-4">
                <span className="sr-only">{copy.columns.actions}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody ref={virtual.bodyRef}>
            <Spacer height={virtual.before} colSpan={columnCount} />
            {virtual.items.map(({ row: doc, index }) => (
              <TableRow key={doc.id} data-index={index} ref={virtual.measure}>
                <TableCell className="pl-4">
                  <button
                    type="button"
                    onClick={() => setPreviewId(doc.id)}
                    className="flex min-w-44 items-start gap-2.5 text-left"
                  >
                    <HugeiconsIcon
                      icon={docIcons[doc.type]}
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium underline-offset-4 hover:underline">
                        {doc.name}
                      </span>
                      {doc.status === "requested" && doc.dueAt && (
                        <span className="block text-xs text-muted-foreground tabular-nums">
                          Due {formatDate(doc.dueAt)}
                        </span>
                      )}
                      {doc.size && (
                        <span className="block text-xs text-muted-foreground tabular-nums">
                          {kb(doc.size)}
                        </span>
                      )}
                    </span>
                  </button>
                </TableCell>
                {showMatter && (
                  <TableCell>
                    {doc.matter && (
                      <Link
                        href={`/dashboard/matters/${doc.matter.id}?tab=documents`}
                        className="block min-w-36 underline-offset-4 hover:underline"
                      >
                        <span className="block text-xs text-muted-foreground tabular-nums">
                          {doc.matter.id}
                        </span>
                        <span className="block max-w-52 truncate">
                          {doc.matter.title}
                        </span>
                      </Link>
                    )}
                  </TableCell>
                )}
                {showMatter && (
                  <TableCell className="hidden whitespace-nowrap lg:table-cell">
                    {doc.client?.name}
                  </TableCell>
                )}
                <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                  {doc.category
                    ? documentCategoryLabels[doc.category]
                    : typeLabels[doc.type]}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={docTones[doc.status]}>
                    {documentStatusLabels[doc.status]}
                  </StatusBadge>
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
                  {person(doc.uploadedBy, doc.client)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                  {timeAgo(documentUpdatedAt(doc))}
                </TableCell>
                <TableCell className="pr-4">
                  <DocumentActions
                    doc={doc}
                    onPreview={() => setPreviewId(doc.id)}
                    onDelete={() => setDeleting(doc)}
                  />
                </TableCell>
              </TableRow>
            ))}
            <Spacer height={virtual.after} colSpan={columnCount} />
          </TableBody>
        </Table>
      )}
      <PreviewSheet
        doc={preview}
        onOpenChange={(open) => !open && setPreviewId(null)}
      />
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {copy.deleteDialog.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">
              {copy.deleteDialog.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              variant="destructive"
              onClick={() => {
                if (deleting) {
                  deleteDocument(deleting.id);
                  toast.add({ title: copy.toasts.deleted(deleting.name) });
                }
                setDeleting(null);
              }}
            >
              {copy.deleteDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Status actions shared by the row menu and the preview sheet. */
function useDocActions(doc: Row) {
  const a = copy.actions;
  const t = copy.toasts;
  return {
    review: {
      label: a.review,
      disabled: doc.status !== "uploaded",
      run: () => {
        setDocumentStatus(doc.id, "reviewed");
        toast.add({ title: t.reviewed(doc.name) });
      },
    },
    send: {
      label: a.send,
      disabled: doc.status !== "uploaded" && doc.status !== "reviewed",
      run: () => {
        setDocumentStatus(doc.id, "sent_for_signature");
        toast.add({ title: t.sent(doc.name) });
      },
    },
    remind: {
      label: a.remind,
      disabled:
        doc.status !== "requested" && doc.status !== "sent_for_signature",
      run: () => {
        const name = doc.client?.name ?? "the client";
        sendDocumentReminder(doc.id, name);
        toast.add({ title: t.reminded(name) });
      },
    },
    download: {
      label: a.download,
      disabled: doc.status === "requested",
      run: () => toast.add({ title: t.download }),
    },
  };
}

function DocumentActions({
  doc,
  onPreview,
  onDelete,
}: {
  doc: Row;
  onPreview: () => void;
  onDelete: () => void;
}) {
  const actions = useDocActions(doc);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <TipButton
            variant="ghost"
            size="icon"
            aria-label={`${copy.columns.actions}: ${doc.name}`}
          />
        }
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onPreview}>
          {copy.actions.preview}
        </DropdownMenuItem>
        {Object.values(actions).map((action) => (
          <DropdownMenuItem
            key={action.label}
            disabled={action.disabled}
            onClick={action.run}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          {copy.actions.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PreviewSheet({
  doc,
  onOpenChange,
}: {
  doc: Row | null;
  onOpenChange: (open: boolean) => void;
}) {
  const p = copy.preview;
  return (
    <Sheet open={Boolean(doc)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {doc && <PreviewBody doc={doc} />}
        {!doc && <SheetTitle className="sr-only">{p.details}</SheetTitle>}
      </SheetContent>
    </Sheet>
  );
}

function PreviewBody({ doc }: { doc: Row }) {
  const p = copy.preview;
  const actions = useDocActions(doc);
  const history = documentHistory(doc);
  return (
    <>
      <SheetHeader className="border-b p-5 pr-12">
        <SheetTitle className="font-sans text-base font-semibold">
          {doc.name}
        </SheetTitle>
        <SheetDescription>
          {doc.matter ? `${doc.matter.id} · ${doc.matter.title}` : ""}
        </SheetDescription>
        <div className="pt-1">
          <StatusBadge tone={docTones[doc.status]}>
            {documentStatusLabels[doc.status]}
          </StatusBadge>
        </div>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        {/* A placeholder page: the demo keeps no file contents. */}
        <div
          aria-hidden="true"
          className="mx-auto aspect-[8.5/11] w-full max-w-60 rounded-md border bg-white p-5 shadow-sm"
        >
          {doc.status === "requested" ? (
            <p className="mt-16 text-center text-xs text-muted-foreground">
              {p.pending}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="mb-2 h-2.5 w-2/3 rounded bg-[#D9D9D9]" />
              {[100, 92, 96, 84, 100, 70, 0, 96, 88, 100, 60].map((w, i) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: decorative lines
                  key={i}
                  className={cn(
                    "h-1.5 rounded bg-[#EDEDED]",
                    w === 0 && "bg-transparent",
                  )}
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">{p.client}</dt>
            <dd className="mt-1">{doc.client?.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{p.category}</dt>
            <dd className="mt-1">
              {doc.category
                ? documentCategoryLabels[doc.category]
                : typeLabels[doc.type]}
            </dd>
          </div>
          {doc.size && (
            <div>
              <dt className="text-xs text-muted-foreground">{p.size}</dt>
              <dd className="mt-1 tabular-nums">{kb(doc.size)}</dd>
            </div>
          )}
          {doc.dueAt && doc.status === "requested" && (
            <div>
              <dt className="text-xs text-muted-foreground">{p.due}</dt>
              <dd className="mt-1 tabular-nums">{formatDate(doc.dueAt)}</dd>
            </div>
          )}
          {doc.note && (
            <div className="col-span-2">
              <dt className="text-xs text-muted-foreground">{p.note}</dt>
              <dd className="mt-1">{doc.note}</dd>
            </div>
          )}
        </dl>

        <div>
          <h3 className="font-sans text-xs font-normal tracking-normal text-muted-foreground">
            {p.history}
          </h3>
          <ol className="mt-3 flex flex-col">
            {history.map((step, i) => (
              <li
                key={`${step.status}-${step.at}`}
                className="relative flex gap-3 pb-4 last:pb-0"
              >
                {i < history.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-3 left-[3px] h-full w-px bg-border"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="relative mt-1.5 size-[7px] shrink-0 rounded-full bg-foreground"
                />
                <div>
                  <p className="text-sm">{documentStatusLabels[step.status]}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {p.by(
                      person(step.by, doc.client),
                      formatDate(step.at, true),
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <SheetFooter className="grid grid-cols-2 gap-2 border-t p-4">
        {Object.values(actions).map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            className="h-9 border-input"
            disabled={action.disabled}
            onClick={action.run}
          >
            {action.label}
          </Button>
        ))}
      </SheetFooter>
    </>
  );
}
