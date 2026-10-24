"use client";

import { documentHistory } from "./documents";
import { uid } from "./leads";
import { useDemoStore } from "./store";
import type {
  DocumentCategory,
  MedicalProvider,
  MeetingType,
  Message,
  PortalFormData,
} from "./types";

const MARIA_ID = "u-maria";
const MARIA_NAME = "Maria Delgado";
const MATTER_ID = "M-2026-0142";
const now = () => new Date().toISOString();

const fileType = (name: string) => {
  const ext = name.split(".").at(-1)?.toLowerCase();
  if (["png", "jpg", "jpeg", "heic", "webp"].includes(ext ?? ""))
    return "image" as const;
  if (["doc", "docx", "rtf"].includes(ext ?? "")) return "docx" as const;
  if (["xls", "xlsx", "csv"].includes(ext ?? "")) return "spreadsheet" as const;
  return "pdf" as const;
};

export function uploadPortalDocument(input: {
  file: { name: string; size: number };
  requestId?: string;
  category?: DocumentCategory;
  comment?: string;
}) {
  const at = now();
  const cleanName = input.file.name.replace(/\.[^.]+$/, "");
  useDemoStore.getState().mutate((data) => ({
    documents: input.requestId
      ? data.documents.map((doc) =>
          doc.id === input.requestId
            ? {
                ...doc,
                name: doc.name,
                type: fileType(input.file.name),
                size: input.file.size,
                uploadedBy: "cl-delgado",
                uploadedAt: at,
                status: "uploaded",
                comment: input.comment?.trim() || undefined,
                history: [
                  ...documentHistory(doc),
                  { status: "uploaded", at, by: MARIA_ID },
                ],
              }
            : doc,
        )
      : [
          {
            id: `DOC-${uid().slice(0, 8)}`,
            matterId: MATTER_ID,
            name: cleanName,
            type: fileType(input.file.name),
            size: input.file.size,
            category: input.category,
            uploadedBy: "cl-delgado",
            uploadedAt: at,
            status: "uploaded",
            comment: input.comment?.trim() || undefined,
            history: [{ status: "uploaded", at, by: MARIA_ID }],
          },
          ...data.documents,
        ],
    activityLog: [
      {
        id: uid(),
        createdAt: at,
        type: "document_uploaded",
        actorId: MARIA_ID,
        message: `${MARIA_NAME} uploaded ${input.requestId ? (data.documents.find((doc) => doc.id === input.requestId)?.name ?? cleanName) : cleanName}`,
        href: `/dashboard/matters/${MATTER_ID}?tab=documents`,
      },
      ...data.activityLog,
    ],
  }));
}

export function signPortalDocument(docId: string, signer: string) {
  const doc = useDemoStore
    .getState()
    .documents.find((item) => item.id === docId);
  if (!doc || doc.status !== "sent_for_signature") return false;
  const at = now();
  useDemoStore.getState().mutate((data) => ({
    documents: data.documents.map((item) =>
      item.id === docId
        ? {
            ...item,
            status: "signed",
            signedAt: at,
            signer,
            history: [
              ...documentHistory(item),
              { status: "signed", at, by: MARIA_ID },
            ],
          }
        : item,
    ),
    activityLog: [
      {
        id: uid(),
        createdAt: at,
        type: "document_signed",
        actorId: MARIA_ID,
        message: `${MARIA_NAME} signed ${doc.name}`,
        href: `/dashboard/matters/${MATTER_ID}?tab=documents`,
      },
      ...data.activityLog,
    ],
  }));
  return true;
}

function appendMessage(message: Message, activityMessage: string) {
  useDemoStore.getState().mutate((data) => ({
    threads: data.threads.map((thread) =>
      thread.matterId === MATTER_ID
        ? { ...thread, messages: [...thread.messages, message] }
        : thread,
    ),
    activityLog: [
      {
        id: uid(),
        createdAt: message.sentAt,
        type: "message_received",
        actorId: MARIA_ID,
        message: activityMessage,
        href: "/dashboard/messages",
      },
      ...data.activityLog,
    ],
  }));
}

export function sendPortalMessage(
  body: string,
  attachments: { name: string; size: number }[] = [],
) {
  const message: Message = {
    id: uid(),
    authorId: MARIA_ID,
    body: body.trim(),
    sentAt: now(),
    read: false,
    attachments: attachments.length ? attachments : undefined,
  };
  appendMessage(message, `New message from ${MARIA_NAME}`);
}

export function simulateStaffReply(onReply: () => void) {
  try {
    if (sessionStorage.getItem("counsel-portal-reply")) return false;
    sessionStorage.setItem("counsel-portal-reply", "1");
  } catch {}
  setTimeout(() => {
    const reply: Message = {
      id: uid(),
      authorId: "u-rosa",
      body: "Thanks, Maria. I've let Daniel know. We'll follow up shortly.",
      sentAt: now(),
      read: false,
    };
    useDemoStore.getState().mutate((data) => ({
      threads: data.threads.map((thread) =>
        thread.matterId === MATTER_ID
          ? { ...thread, messages: [...thread.messages, reply] }
          : thread,
      ),
    }));
    onReply();
  }, 4000);
  return true;
}

export function markPortalMessagesRead() {
  useDemoStore.getState().mutate((data) => ({
    threads: data.threads.map((thread) =>
      thread.matterId === MATTER_ID
        ? {
            ...thread,
            messages: thread.messages.map((message) =>
              message.authorId !== MARIA_ID && !message.internal
                ? { ...message, read: true }
                : message,
            ),
          }
        : thread,
    ),
  }));
}

export function requestAppointment(input: {
  topic: string;
  type: MeetingType;
  preferredTimes: string[];
  rescheduleId?: string;
}) {
  const lead = input.rescheduleId
    ? "I'd like to reschedule my appointment."
    : "I'd like to request an appointment.";
  sendPortalMessage(
    `${lead} Topic: ${input.topic}. Preferred format: ${input.type.replace("_", " ")}. Good times: ${input.preferredTimes.join(", ")}.`,
  );
}

export function savePortalForm(
  formId: string,
  data: PortalFormData,
  submit = false,
) {
  const at = now();
  useDemoStore.getState().mutate((state) => {
    const form = state.portalForms.find((item) => item.id === formId);
    if (!form) return {};
    const submittedDocumentExists = state.documents.some(
      (doc) => doc.id === `DOC-${formId}`,
    );
    return {
      portalForms: state.portalForms.map((item) =>
        item.id === formId
          ? {
              ...item,
              data,
              status: submit ? "submitted" : "in_progress",
              updatedAt: at,
              submittedAt: submit ? at : item.submittedAt,
            }
          : item,
      ),
      ...(submit && !submittedDocumentExists
        ? {
            documents: [
              {
                id: `DOC-${formId}`,
                matterId: form.matterId,
                name: `Form: ${form.name} (submitted)`,
                type: "pdf" as const,
                uploadedBy: "cl-delgado",
                uploadedAt: at,
                status: "uploaded" as const,
                category: "other" as const,
                history: [{ status: "uploaded" as const, at, by: MARIA_ID }],
              },
              ...state.documents,
            ],
            activityLog: [
              {
                id: uid(),
                createdAt: at,
                type: "document_uploaded" as const,
                actorId: MARIA_ID,
                message: `${MARIA_NAME} submitted ${form.name}`,
                href: `/dashboard/matters/${MATTER_ID}?tab=documents`,
              },
              ...state.activityLog,
            ],
          }
        : {}),
    };
  });
}

export function emptyProvider(): MedicalProvider {
  return {
    id: uid(),
    name: "",
    specialty: "",
    phone: "",
    firstVisit: "",
    stillTreating: true,
  };
}
