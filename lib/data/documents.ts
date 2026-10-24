"use client";

import { documentStatusLabels } from "./labels";
import { currentUser, uid } from "./leads";
import { useDemoStore } from "./store";
import type {
  DocumentCategory,
  DocumentStatus,
  FirmActivityType,
  MatterDocument,
} from "./types";

/*
 * Document data access. Requests and signature requests show up on the
 * client's portal checklist, so they live in the shared store.
 */

const now = () => new Date().toISOString();

function log(
  doc: Pick<MatterDocument, "matterId">,
  type: FirmActivityType,
  message: string,
) {
  useDemoStore.getState().mutate((data) => ({
    activityLog: [
      {
        id: uid(),
        createdAt: now(),
        type,
        actorId: currentUser().id,
        message,
        href: `/dashboard/matters/${doc.matterId}?tab=documents`,
      },
      ...data.activityLog,
    ],
  }));
}

/** Status history; older documents get one reconstructed from their status. */
export function documentHistory(doc: MatterDocument) {
  if (doc.history?.length) return doc.history;
  const order: DocumentStatus[] = [
    "uploaded",
    "reviewed",
    "sent_for_signature",
    "signed",
  ];
  if (doc.status === "requested")
    return [
      { status: "requested" as const, at: doc.uploadedAt, by: doc.uploadedBy },
    ];
  const steps = order.slice(0, order.indexOf(doc.status) + 1);
  const start = new Date(doc.uploadedAt).getTime();
  return steps.map((status, i) => ({
    status,
    at: new Date(start + i * 2 * 864e5).toISOString(),
    by: doc.uploadedBy,
  }));
}

/** Last status change, for "Updated" columns. */
export function documentUpdatedAt(doc: MatterDocument) {
  return documentHistory(doc).at(-1)?.at ?? doc.uploadedAt;
}

function addDocument(doc: MatterDocument) {
  useDemoStore
    .getState()
    .mutate((data) => ({ documents: [doc, ...data.documents] }));
}

/** Asks the client for a document; it appears on their portal checklist. */
export function requestDocument(
  matterId: string,
  input: {
    name: string;
    note: string;
    dueAt?: string;
    category?: DocumentCategory;
  },
) {
  const by = currentUser().id;
  const at = now();
  addDocument({
    id: `DOC-${uid().slice(0, 8)}`,
    matterId,
    name: input.name.trim(),
    type: "pdf",
    category: input.category,
    uploadedBy: by,
    uploadedAt: at,
    status: "requested",
    note: input.note.trim() || undefined,
    dueAt: input.dueAt,
    history: [{ status: "requested", at, by }],
  });
  log(
    { matterId },
    "document_requested",
    `Requested from client: ${input.name.trim()}`,
  );
}

const typeFor = (name: string): MatterDocument["type"] => {
  const ext = name.split(".").at(-1)?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "heic", "webp"].includes(ext))
    return "image";
  if (["doc", "docx", "rtf", "txt", "pages"].includes(ext)) return "docx";
  if (["xls", "xlsx", "csv", "numbers"].includes(ext)) return "spreadsheet";
  return "pdf";
};

/** Stores the file's name, type and size only (demo upload). */
export function uploadDocument(
  matterId: string,
  file: { name: string; size: number },
  category?: DocumentCategory,
) {
  const name = file.name.replace(/\.[^.]+$/, "");
  const by = currentUser().id;
  const at = now();
  addDocument({
    id: `DOC-${uid().slice(0, 8)}`,
    matterId,
    name,
    type: typeFor(file.name),
    category,
    uploadedBy: by,
    uploadedAt: at,
    status: "uploaded",
    size: file.size,
    history: [{ status: "uploaded", at, by }],
  });
  log(
    { matterId },
    "document_uploaded",
    `Document uploaded to ${matterId}: ${name}`,
  );
}

export function setDocumentStatus(docId: string, status: DocumentStatus) {
  const doc = useDemoStore.getState().documents.find((d) => d.id === docId);
  if (!doc || doc.status === status) return;
  const entry = { status, at: now(), by: currentUser().id };
  useDemoStore.getState().mutate((data) => ({
    documents: data.documents.map((d) =>
      d.id === docId
        ? { ...d, status, history: [...documentHistory(d), entry] }
        : d,
    ),
  }));
  log(
    doc,
    status === "sent_for_signature" ? "document_sent" : "document_uploaded",
    `${doc.name}: ${documentStatusLabels[status].toLowerCase()}`,
  );
}

export function deleteDocument(docId: string) {
  const doc = useDemoStore.getState().documents.find((d) => d.id === docId);
  if (!doc) return;
  useDemoStore.getState().mutate((data) => ({
    documents: data.documents.filter((d) => d.id !== docId),
  }));
  log(doc, "document_uploaded", `Document deleted: ${doc.name}`);
}

/** Logs a reminder to the client (no email is sent in the demo). */
export function sendDocumentReminder(docId: string, clientName: string) {
  const doc = useDemoStore.getState().documents.find((d) => d.id === docId);
  if (!doc) return;
  log(doc, "document_reminder", `Reminder sent to ${clientName}: ${doc.name}`);
}
