"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  markPortalMessagesRead,
  sendPortalMessage,
  simulateStaffReply,
} from "@/lib/data/portal";
import { findDemoUser } from "@/lib/data/seed/users";
import { useDemoStore } from "@/lib/data/store";
import { formatDate, initials } from "@/lib/format";
import { MATTER_ID, PortalPage } from "./shared";

export function MessagesPage() {
  const thread = useDemoStore((s) =>
    s.threads.find((item) => item.matterId === MATTER_ID),
  );
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    markPortalMessagesRead();
  }, []);
  const messages =
    thread?.messages.filter((message) => !message.internal) ?? [];
  const send = () => {
    if (!body.trim() && !attachment) return;
    sendPortalMessage(
      body || "Attached a file.",
      attachment ? [{ name: attachment.name, size: attachment.size }] : [],
    );
    setBody("");
    setAttachment(null);
    toast.add({ title: "Message sent", type: "success" });
    simulateStaffReply(() => {
      toast.add({
        title: "New message from Rosa",
        description: "Thanks, Maria. I've let Daniel know.",
        type: "info",
      });
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        0,
      );
    });
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      0,
    );
  };
  return (
    <PortalPage
      title="Messages"
      description="A private conversation with your legal team."
    >
      <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm">
        We typically reply within 1 business day.
      </div>
      <Card>
        <CardContent className="p-0">
          <div
            className="max-h-[60vh] min-h-[420px] space-y-5 overflow-y-auto p-4 sm:p-6"
            aria-live="polite"
          >
            {messages.length ? (
              messages.map((message, index) => {
                const mine = message.authorId === "u-maria";
                const user = findDemoUser(message.authorId);
                const previous = messages[index - 1];
                const newDay =
                  !previous ||
                  new Date(previous.sentAt).toDateString() !==
                    new Date(message.sentAt).toDateString();
                return (
                  <div key={message.id}>
                    {newDay && (
                      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                        {formatDate(message.sentAt)}
                      </div>
                    )}
                    <div
                      className={`flex gap-3 ${mine ? "justify-end" : "justify-start"}`}
                    >
                      {!mine && (
                        <Avatar>
                          <AvatarFallback>
                            {initials(user?.name ?? "Team")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[82%] ${mine ? "items-end" : "items-start"}`}
                      >
                        <p
                          className={`mb-1 text-xs text-muted-foreground ${mine ? "text-right" : ""}`}
                        >
                          {mine
                            ? "You"
                            : `${user?.name ?? "Your legal team"} · ${user?.title ?? "Staff"}`}
                        </p>
                        <div
                          className={`rounded-2xl px-4 py-3 leading-relaxed ${mine ? "rounded-br-sm bg-foreground text-background" : "rounded-bl-sm bg-muted"}`}
                        >
                          {message.body}
                          {message.attachments?.map((file) => (
                            <span
                              key={file.name}
                              className={`mt-2 block rounded-full border px-3 py-1 text-xs ${mine ? "border-white/30" : ""}`}
                            >
                              {file.name}
                            </span>
                          ))}
                        </div>
                        <p
                          className={`mt-1 text-[11px] text-muted-foreground ${mine ? "text-right" : ""}`}
                        >
                          {formatDate(message.sentAt, true).split(", ").at(-1)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-muted-foreground">
                No messages yet. Send a note to start the conversation.
              </p>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="border-t p-4">
            <div className="flex items-end gap-2">
              <Textarea
                aria-label="Message"
                rows={2}
                className="min-h-12 resize-none"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                placeholder="Write a message"
              />
              <Button
                variant="outline"
                aria-label="Attach a file"
                onClick={() => inputRef.current?.click()}
              >
                Attach
              </Button>
              <input
                ref={inputRef}
                className="sr-only"
                type="file"
                onChange={(event) =>
                  setAttachment(event.target.files?.[0] ?? null)
                }
              />
              <Button onClick={send} disabled={!body.trim() && !attachment}>
                Send
              </Button>
            </div>
            {attachment && (
              <p className="mt-2 text-xs text-muted-foreground">
                Attached: {attachment.name}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </PortalPage>
  );
}
