"use client";

import {
  Attachment01Icon,
  Cancel01Icon,
  FlashIcon,
  SentIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format, isToday, isYesterday } from "date-fns";
import { Fragment, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { messagesPage as copy } from "@/lib/content/dashboard-office";
import {
  markThreadRead,
  sendMessage,
  simulateClientReply,
} from "@/lib/data/messages";
import { isClientAuthor, userName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const kb = (bytes: number) =>
  bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1000))} KB`;

function dayLabel(date: Date) {
  if (isToday(date)) return copy.today;
  if (isYesterday(date)) return copy.yesterday;
  return format(date, "EEEE, MMM d");
}

/**
 * A matter's client thread: messages grouped by day (client left, staff
 * right, internal notes tinted) and a composer. Opening it marks the
 * client's messages read.
 */
export function MessageThread({
  matterId,
  className,
}: {
  matterId: string;
  className?: string;
}) {
  const c = copy.composer;
  const thread = useDemoStore((s) =>
    s.threads.find((t) => t.matterId === matterId),
  );
  const clientId = useDemoStore(
    (s) => s.matters.find((m) => m.id === matterId)?.clientId,
  );
  const client = useDemoStore((s) =>
    s.clients.find((cl) => cl.id === clientId),
  );
  const userId = useDemoStore((s) => s.session?.userId);
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const messages = thread?.messages ?? [];
  const unread = messages.some((m) => !m.read && isClientAuthor(m.authorId));

  // Reading the thread (including replies that arrive while it's open)
  // clears its unread state.
  useEffect(() => {
    if (unread) markThreadRead(matterId);
  }, [matterId, unread]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when a message arrives or the thread changes
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length, matterId]);

  function send(event?: React.FormEvent) {
    event?.preventDefault();
    if (!body.trim() && files.length === 0) return;
    sendMessage(matterId, { body, internal, attachments: files });
    toast.add({ title: internal ? c.noted : c.sent });
    if (!internal && client)
      simulateClientReply(matterId, () =>
        toast.add({ title: copy.replyToast(client.name) }),
      );
    setBody("");
    setFiles([]);
  }

  let lastDay = "";

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">{copy.noMessages}</p>
        )}
        {messages.map((message) => {
          const sent = new Date(message.sentAt);
          const day = dayLabel(sent);
          const showDay = day !== lastDay;
          lastDay = day;
          const fromClient = isClientAuthor(message.authorId);
          const author = fromClient
            ? (client?.name ?? "")
            : userName(message.authorId);
          const name =
            !fromClient && message.authorId === userId ? copy.you : author;
          return (
            <Fragment key={message.id}>
              {showDay && (
                <div className="flex items-center gap-3 py-1 text-xs text-muted-foreground">
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                  {day}
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                </div>
              )}
              <div
                className={cn(
                  "flex max-w-[85%] gap-2.5",
                  fromClient ? "self-start" : "flex-row-reverse self-end",
                )}
              >
                <Avatar size="sm" aria-hidden="true" className="mt-5">
                  <AvatarFallback className="text-[10px]">
                    {initials(author)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "flex min-w-0 flex-col gap-1",
                    !fromClient && "items-end",
                  )}
                >
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {name} · {format(sent, "h:mm a")}
                  </p>
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-line",
                      message.internal
                        ? "border border-[#EADFB4] bg-[#FBF6E3]"
                        : fromClient
                          ? "bg-muted"
                          : "bg-foreground text-background",
                    )}
                  >
                    {message.internal && (
                      <span className="mb-1 block text-xs font-medium text-[#8A5A00]">
                        {copy.internal}
                      </span>
                    )}
                    {message.body}
                  </div>
                  {message.attachments && (
                    <div className="flex flex-wrap gap-1.5">
                      {message.attachments.map((file) => (
                        <span
                          key={file.name}
                          className="flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
                        >
                          <HugeiconsIcon
                            icon={Attachment01Icon}
                            className="size-3"
                          />
                          {file.name}
                          <span className="text-muted-foreground">
                            {kb(file.size)}
                          </span>
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
        className="mt-4 flex shrink-0 flex-col gap-2 border-t pt-4"
      >
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={internal ? c.internalPlaceholder : c.placeholder}
          aria-label={internal ? c.internalPlaceholder : c.placeholder}
          className={cn("max-h-48 min-h-20", internal && "bg-[#FBF6E3]")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
        />
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {files.map((file) => (
              <span
                key={file.name}
                className="flex items-center gap-1 rounded-md border py-0.5 pr-1 pl-2 text-xs"
              >
                {file.name}
                <button
                  type="button"
                  aria-label={c.remove(file.name)}
                  className="rounded p-0.5 hover:bg-muted"
                  onClick={() =>
                    setFiles((list) => list.filter((f) => f.name !== file.name))
                  }
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => fileInput.current?.click()}
          >
            <HugeiconsIcon icon={Attachment01Icon} />
            <span className="hidden sm:inline">{c.attach}</span>
            <span className="sr-only sm:hidden">{c.attach}</span>
          </Button>
          <input
            ref={fileInput}
            type="file"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-label={c.attach}
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []).map((f) => ({
                name: f.name,
                size: f.size,
              }));
              setFiles((list) => [...list, ...picked]);
              e.target.value = "";
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8"
                />
              }
            >
              <HugeiconsIcon icon={FlashIcon} />
              <span className="hidden sm:inline">{c.quickReplies}</span>
              <span className="sr-only sm:hidden">{c.quickReplies}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              {c.replies.map((reply) => (
                <DropdownMenuItem key={reply} onClick={() => setBody(reply)}>
                  {reply}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: the switch renders inside the label */}
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={internal} onCheckedChange={setInternal} />
            {copy.internal}
          </label>
          <span className="ml-auto hidden text-xs text-muted-foreground lg:inline">
            {c.hint}
          </span>
          <Button type="submit" size="sm" className="h-8">
            <HugeiconsIcon icon={SentIcon} />
            {c.send}
          </Button>
        </div>
      </form>
    </div>
  );
}
