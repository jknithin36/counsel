"use client";

import { documentHistory } from "./documents";
import { uid } from "./leads";
import { demoClientUser, findDemoUser } from "./seed/users";
import { useDemoStore } from "./store";
import type {
  Client,
  DocumentCategory,
  MedicalProvider,
  MeetingType,
  Message,
  PortalFormData,
} from "./types";

const now = () => new Date().toISOString();

/** The signed-in client: their login, matter and client record. */
export function portalIdentity() {
  const state = useDemoStore.getState();
  const user = findDemoUser(state.session?.userId ?? "") ?? demoClientUser;
  const matter = state.matters.find((m) => m.id === user.matterId);
  return {
    userId: user.id,
    name: user.name,
    matterId: user.matterId ?? "",
    clientId: matter?.clientId ?? "",
    matter,
  };
}

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
  const me = portalIdentity();
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
                uploadedBy: me.clientId,
                uploadedAt: at,
                status: "uploaded",
                comment: input.comment?.trim() || undefined,
                history: [
                  ...documentHistory(doc),
                  { status: "uploaded", at, by: me.userId },
                ],
              }
            : doc,
        )
      : [
          {
            id: `DOC-${uid().slice(0, 8)}`,
            matterId: me.matterId,
            name: cleanName,
            type: fileType(input.file.name),
            size: input.file.size,
            category: input.category,
            uploadedBy: me.clientId,
            uploadedAt: at,
            status: "uploaded",
            comment: input.comment?.trim() || undefined,
            history: [{ status: "uploaded", at, by: me.userId }],
          },
          ...data.documents,
        ],
    activityLog: [
      {
        id: uid(),
        createdAt: at,
        type: "document_uploaded",
        actorId: me.userId,
        message: `${me.name} uploaded ${input.requestId ? (data.documents.find((doc) => doc.id === input.requestId)?.name ?? cleanName) : cleanName}`,
        href: `/dashboard/matters/${me.matterId}?tab=documents`,
      },
      ...data.activityLog,
    ],
  }));
}

export function signPortalDocument(docId: string, signer: string) {
  const me = portalIdentity();
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
              { status: "signed", at, by: me.userId },
            ],
          }
        : item,
    ),
    activityLog: [
      {
        id: uid(),
        createdAt: at,
        type: "document_signed",
        actorId: me.userId,
        message: `${me.name} signed ${doc.name}`,
        href: `/dashboard/matters/${me.matterId}?tab=documents`,
      },
      ...data.activityLog,
    ],
  }));
  return true;
}

function appendMessage(message: Message, activityMessage: string) {
  const me = portalIdentity();
  useDemoStore.getState().mutate((data) => ({
    threads: data.threads.map((thread) =>
      thread.matterId === me.matterId
        ? { ...thread, messages: [...thread.messages, message] }
        : thread,
    ),
    activityLog: [
      {
        id: uid(),
        createdAt: message.sentAt,
        type: "message_received",
        actorId: me.userId,
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
  const me = portalIdentity();
  const message: Message = {
    id: uid(),
    authorId: me.userId,
    body: body.trim(),
    sentAt: now(),
    read: false,
    attachments: attachments.length ? attachments : undefined,
  };
  appendMessage(message, `New message from ${me.name}`);
}

/** Demo only: a teammate answers the client's first message of the session. */
export function simulateStaffReply(onReply: (name: string) => void) {
  const me = portalIdentity();
  const team = me.matter?.team ?? [];
  const leadId = me.matter?.leadAttorneyId ?? "";
  const replier =
    findDemoUser(team.find((id) => id !== leadId) ?? leadId) ?? demoClientUser;
  const lead = findDemoUser(leadId)?.name ?? "your attorney";
  try {
    if (sessionStorage.getItem("counsel-portal-reply")) return false;
    sessionStorage.setItem("counsel-portal-reply", "1");
  } catch {}
  setTimeout(() => {
    const reply: Message = {
      id: uid(),
      authorId: replier.id,
      body: `Thanks, ${me.name.split(" ")[0]}. I've passed this to ${lead.split(" ")[0]} and we'll follow up shortly.`,
      sentAt: now(),
      read: false,
    };
    useDemoStore.getState().mutate((data) => ({
      threads: data.threads.map((thread) =>
        thread.matterId === me.matterId
          ? { ...thread, messages: [...thread.messages, reply] }
          : thread,
      ),
    }));
    onReply(replier.name);
  }, 4000);
  return true;
}

export function markPortalMessagesRead() {
  const me = portalIdentity();
  useDemoStore.getState().mutate((data) => ({
    threads: data.threads.map((thread) =>
      thread.matterId === me.matterId
        ? {
            ...thread,
            messages: thread.messages.map((message) =>
              message.authorId !== me.userId && !message.internal
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
  const format = {
    video: "video call",
    phone: "phone call",
    in_person: "in person",
  }[input.type];
  sendPortalMessage(
    `${lead}\n\nTopic: ${input.topic}\nFormat: ${format}\nGood times: ${input.preferredTimes.join(", ")}`,
  );
}

export function savePortalForm(
  formId: string,
  data: PortalFormData,
  submit = false,
) {
  const me = portalIdentity();
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
                uploadedBy: me.clientId,
                uploadedAt: at,
                status: "uploaded" as const,
                category: "other" as const,
                history: [{ status: "uploaded" as const, at, by: me.userId }],
              },
              ...state.documents,
            ],
            activityLog: [
              {
                id: uid(),
                createdAt: at,
                type: "document_uploaded" as const,
                actorId: me.userId,
                message: `${me.name} submitted ${form.name}`,
                href: `/dashboard/matters/${me.matterId}?tab=documents`,
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

/** The client updates their own contact details or preferences. */
export function updatePortalProfile(patch: Partial<Client>) {
  const me = portalIdentity();
  useDemoStore.getState().mutate((data) => {
    const client = data.clients.find((c) => c.id === me.clientId);
    if (!client) return {};
    return {
      clients: data.clients.map((c) =>
        c.id === me.clientId ? { ...c, ...patch } : c,
      ),
      activityLog: [
        {
          id: uid(),
          createdAt: now(),
          type: "client_updated" as const,
          actorId: me.userId,
          message: `${client.name} updated their portal profile`,
          href: `/dashboard/clients/${client.id}`,
        },
        ...data.activityLog,
      ],
    };
  });
}
