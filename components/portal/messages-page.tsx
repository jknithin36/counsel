"use client";

import {
  Attachment01Icon,
  Cancel01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format, isToday, isYesterday } from "date-fns";
import { Fragment, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { messagesPage as copy } from "@/lib/content/portal";
import {
  markPortalMessagesRead,
  sendPortalMessage,
  simulateStaffReply,
} from "@/lib/data/portal";
import { findDemoUser } from "@/lib/data/seed/users";
import { useDemoStore } from "@/lib/data/store";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PortalPage } from "./shared";
import { usePortal } from "./use-portal";

function dayLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMM d");
}

export function MessagesPage() {
  const { user, matter } = usePortal();
  const thread = useDemoStore((s) =>
    s.threads.find((t) => t.matterId === matter?.id),
  );
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const messages = thread?.messages.filter((m) => !m.internal) ?? [];
  const count = messages.length;

  // Opening the conversation marks the team's messages read.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run as messages arrive
  useEffect(() => {
    markPortalMessagesRead();
    end.current?.scrollIntoView({ block: "end" });
  }, [count]);

  function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (!body.trim() && !file) return;
    sendPortalMessage(
      body.trim() || copy.attachmentOnly,
      file ? [{ name: file.name, size: file.size }] : [],
    );
    setBody("");
    setFile(null);
    toast.add({ title: copy.sent });
    simulateStaffReply((name) => toast.add({ title: copy.reply(name) }));
  }

  let lastDay = "";
  return (
    <PortalPage title={copy.title} description={copy.subtitle}>
      <Card className="h-[calc(100dvh-14rem)] min-h-[420px] gap-0 py-0">
        <div
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <p className="m-auto text-sm text-muted-foreground">{copy.empty}</p>
          )}
          {messages.map((message) => {
            const sent = new Date(message.sentAt);
            const day = dayLabel(sent);
            const showDay = day !== lastDay;
            lastDay = day;
            const mine = message.authorId === user?.id;
            const author = findDemoUser(message.authorId);
            return (
              <Fragment key={message.id}>
                {showDay && (
                  <div className="flex items-center gap-3 py-1 text-xs text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-border"
                    />
                    {day}
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-border"
                    />
                  </div>
                )}
                <div
                  className={cn(
                    "flex max-w-[85%] gap-2.5",
                    mine ? "flex-row-reverse self-end" : "self-start",
                  )}
                >
                  {!mine && (
                    <Avatar size="sm" aria-hidden="true" className="mt-5">
                      <AvatarFallback className="text-[10px]">
                        {initials(author?.name ?? "")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "flex min-w-0 flex-col gap-1",
                      mine && "items-end",
                    )}
                  >
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {mine ? copy.you : `${author?.name} · ${author?.title}`} ·{" "}
                      {format(sent, "h:mm a")}
                    </p>
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-line",
                        mine ? "bg-foreground text-background" : "bg-muted",
                      )}
                    >
                      {message.body}
                    </div>
                    {message.attachments && (
                      <div className="flex flex-wrap gap-1.5">
                        {message.attachments.map((a) => (
                          <span
                            key={a.name}
                            className="flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
                          >
                            <HugeiconsIcon
                              icon={Attachment01Icon}
                              className="size-3"
                            />
                            {a.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
          <div ref={end} />
        </div>

        <form
          onSubmit={send}
          className="flex shrink-0 flex-col gap-2 border-t p-4"
        >
          <Textarea
            value={body}
            aria-label={copy.placeholder}
            placeholder={copy.placeholder}
            className="max-h-40 min-h-16 resize-none"
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) send(e);
            }}
          />
          {file && (
            <span className="flex items-center gap-1 self-start rounded-md border py-0.5 pr-1 pl-2 text-xs">
              <HugeiconsIcon icon={Attachment01Icon} className="size-3" />
              {file.name}
              <button
                type="button"
                aria-label={copy.removeAttachment(file.name)}
                className="rounded p-0.5 hover:bg-muted"
                onClick={() => setFile(null)}
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
              </button>
            </span>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => fileRef.current?.click()}
            >
              <HugeiconsIcon
                icon={Attachment01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              {copy.attach}
            </Button>
            <input
              ref={fileRef}
              type="file"
              className="sr-only"
              tabIndex={-1}
              aria-label={copy.attach}
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            <span className="ml-auto hidden text-xs text-muted-foreground md:inline">
              {copy.hint}
            </span>
            <Button
              type="submit"
              size="sm"
              className="h-8"
              disabled={!body.trim() && !file}
            >
              <HugeiconsIcon
                icon={SentIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              {copy.send}
            </Button>
          </div>
        </form>
      </Card>
    </PortalPage>
  );
}
