"use client";

import { currentUser, uid } from "./leads";
import { getMatter } from "./matters";
import { isClientAuthor } from "./selectors";
import { useDemoStore } from "./store";
import type { Message } from "./types";

/*
 * Message threads (one per matter) between the client and staff.
 * Internal notes sit in the same thread but never reach the portal.
 */

const now = () => new Date().toISOString();

/** Adds a staff message (or internal note) to the matter's client thread. */
export function sendMessage(
  matterId: string,
  input: {
    body: string;
    internal: boolean;
    attachments: { name: string; size: number }[];
  },
) {
  const matter = getMatter(matterId);
  if (!matter) return;
  const message: Message = {
    id: uid(),
    authorId: currentUser().id,
    body: input.body.trim(),
    sentAt: now(),
    read: false,
    internal: input.internal || undefined,
    attachments: input.attachments.length ? input.attachments : undefined,
  };
  useDemoStore.getState().mutate((data) => {
    const thread = data.threads.find((t) => t.matterId === matterId);
    return {
      threads: thread
        ? data.threads.map((t) =>
            t.id === thread.id
              ? { ...t, messages: [...t.messages, message] }
              : t,
          )
        : [
            ...data.threads,
            {
              id: `TH-${matterId}`,
              matterId,
              clientId: matter.clientId,
              subject: matter.title,
              messages: [message],
            },
          ],
    };
  });
  if (!input.internal)
    useDemoStore.getState().mutate((data) => ({
      activityLog: [
        {
          id: uid(),
          createdAt: now(),
          type: "message_sent",
          actorId: currentUser().id,
          message: `Message sent to the client on ${matterId}`,
          href: `/dashboard/matters/${matterId}?tab=messages`,
        },
        ...data.activityLog,
      ],
    }));
}

/** Marks the client's messages on this matter as read by staff. */
export function markThreadRead(matterId: string) {
  const thread = useDemoStore
    .getState()
    .threads.find((t) => t.matterId === matterId);
  if (!thread?.messages.some((m) => !m.read && isClientAuthor(m.authorId)))
    return;
  useDemoStore.getState().mutate((data) => ({
    threads: data.threads.map((t) =>
      t.id === thread.id
        ? {
            ...t,
            messages: t.messages.map((m) =>
              isClientAuthor(m.authorId) ? { ...m, read: true } : m,
            ),
          }
        : t,
    ),
  }));
}

/**
 * Demo realism: the first staff message to Maria in a session gets a
 * reply from her a few seconds later. Returns false if it already ran.
 */
export function simulateClientReply(matterId: string, onReply: () => void) {
  if (matterId !== "M-2026-0142") return false;
  try {
    if (sessionStorage.getItem("counsel-demo-reply")) return false;
    sessionStorage.setItem("counsel-demo-reply", "1");
  } catch {}
  setTimeout(() => {
    const reply: Message = {
      id: uid(),
      authorId: "u-maria",
      body: "Thank you! I'll upload it tonight.",
      sentAt: now(),
      read: false,
    };
    useDemoStore.getState().mutate((data) => ({
      threads: data.threads.map((t) =>
        t.matterId === matterId
          ? { ...t, messages: [...t.messages, reply] }
          : t,
      ),
      activityLog: [
        {
          id: uid(),
          createdAt: reply.sentAt,
          type: "message_received",
          actorId: "client",
          message: "New message from Maria Delgado",
          href: "/dashboard/messages",
        },
        ...data.activityLog,
      ],
    }));
    onReply();
  }, 4000);
  return true;
}
