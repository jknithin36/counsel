"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { sendPortalMessage, simulateStaffReply } from "@/lib/data/portal";
import { invoiceBalance } from "@/lib/data/selectors";
import { matterStages, stageLabel } from "@/lib/data/stages";
import { useDemoStore } from "@/lib/data/store";
import { formatDate, formatMoney } from "@/lib/format";
import { CLIENT_ID, MATTER_ID, Person, PortalPage } from "./shared";
import { UploadDialog } from "./upload-dialog";

export function PortalOverview() {
  const [reply, setReply] = useState("");
  const matter = useDemoStore((s) =>
    s.matters.find((item) => item.id === MATTER_ID),
  );
  const allDocs = useDemoStore((s) => s.documents);
  const docs = allDocs.filter((doc) => doc.matterId === MATTER_ID);
  const thread = useDemoStore((s) =>
    s.threads.find((item) => item.matterId === MATTER_ID),
  );
  const allInvoices = useDemoStore((s) => s.invoices);
  const invoices = allInvoices.filter(
    (invoice) => invoice.clientId === CLIENT_ID,
  );
  const payments = useDemoStore((s) => s.payments);
  const allAppointments = useDemoStore((s) => s.appointments);
  const appointments = allAppointments.filter(
    (item) => item.matterId === MATTER_ID && item.status === "upcoming",
  );
  if (!matter)
    return (
      <PortalPage title="Maria's Case">
        <p>We could not find this case.</p>
      </PortalPage>
    );
  const signatures = docs.filter((doc) => doc.status === "sent_for_signature");
  const requested = docs.filter((doc) => doc.status === "requested");
  const due = invoices.reduce(
    (sum, invoice) => sum + invoiceBalance(invoice, payments),
    0,
  );
  const firmMessages =
    thread?.messages.filter(
      (message) => !message.internal && message.authorId !== "u-maria",
    ) ?? [];
  const latest = firmMessages.at(-1);
  const steps = matterStages[matter.practiceArea];
  const current = steps.findIndex((step) => step.key === matter.stage);
  const notices = [
    signatures.length
      ? `${signatures.length} documents are waiting for your signature.`
      : "",
    requested.length
      ? `${requested.length} document upload${requested.length === 1 ? " is" : "s are"} needed.`
      : "",
    due > 0 ? `${formatMoney(due, true)} is due.` : "",
  ].filter(Boolean);
  const sendReply = () => {
    if (!reply.trim()) return;
    sendPortalMessage(reply);
    setReply("");
    toast.add({ title: "Message sent", type: "success" });
    simulateStaffReply(() =>
      toast.add({ title: "New reply from Rosa", type: "info" }),
    );
  };
  return (
    <PortalPage
      title="Maria's Case"
      description={`${matter.title} · ${matter.id}`}
      actions={
        <>
          <Button
            variant="outline"
            render={<Link href="/portal/messages" />}
            nativeButton={false}
          >
            Message attorney
          </Button>
          <UploadDialog />
        </>
      }
    >
      {notices.length > 0 && (
        <Card className="border-l-4 border-l-foreground">
          <CardContent className="space-y-3">
            <p className="font-medium">Your attention is needed</p>
            {notices.map((notice) => (
              <div
                key={notice}
                className="flex items-center justify-between gap-4 border-t pt-3"
              >
                <span>{notice}</span>
                <Button
                  variant="link"
                  className="px-0"
                  render={
                    <Link
                      href={
                        notice.includes("signature")
                          ? "/portal/documents"
                          : notice.includes("due")
                            ? "/portal/billing"
                            : "/portal/documents"
                      }
                    />
                  }
                  nativeButton={false}
                >
                  Review →
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Current stage</CardDescription>
            <CardTitle className="text-2xl">
              {stageLabel(matter.practiceArea, matter.stage)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm text-emerald-700">On track</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Next appointment</CardDescription>
            <CardTitle className="text-2xl">
              {appointments[0]
                ? formatDate(appointments[0].start)
                : "Not scheduled"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments[0] && (
              <p className="text-muted-foreground">
                {formatDate(appointments[0].start, true).split(", ").at(-1)} ·{" "}
                {appointments[0].type}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Balance due</CardDescription>
            <CardTitle className="text-2xl">{formatMoney(due, true)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {due
                ? `Due ${formatDate(invoices.find((invoice) => invoiceBalance(invoice, payments) > 0)?.dueAt ?? "")}`
                : "Contingency case"}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Case timeline</CardTitle>
            <CardDescription>Where your case stands today.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li key={step.key} className="flex gap-3">
                  <span
                    className={`mt-1 size-3 rounded-full ${index <= current ? "bg-foreground" : "border bg-white"}`}
                  />
                  <div>
                    <p
                      className={
                        index === current
                          ? "font-medium"
                          : index < current
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }
                    >
                      {step.label}
                      {index === current && (
                        <Badge variant="secondary" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </p>
                    {matter.updates.find((update) =>
                      update.title
                        .toLowerCase()
                        .includes(step.label.toLowerCase().split(" ")[0]),
                    ) && (
                      <p className="text-xs text-muted-foreground">
                        Completed{" "}
                        {formatDate(
                          matter.updates.find((update) =>
                            update.title
                              .toLowerCase()
                              .includes(step.label.toLowerCase().split(" ")[0]),
                          )?.createdAt ?? "",
                        )}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latest message</CardTitle>
            <CardDescription>
              {latest ? formatDate(latest.sentAt, true) : "No messages yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-lg bg-muted p-4 leading-relaxed">
              {latest?.body ?? "Your legal team has not sent a message yet."}
            </p>
            <div className="flex gap-2">
              <Input
                aria-label="Quick reply"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendReply();
                }}
                placeholder="Write a quick reply"
              />
              <Button onClick={sendReply} disabled={!reply.trim()}>
                Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent updates</CardTitle>
          <CardDescription>
            Updates your legal team has shared with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {matter.updates
            .filter((update) => update.shared)
            .slice(-3)
            .reverse()
            .map((update) => (
              <article key={update.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-sans font-medium tracking-normal">
                    {update.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(update.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-muted-foreground">{update.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Shared by{" "}
                  {update.authorId === "u-daniel"
                    ? "Daniel Reyes"
                    : "Rosa Medina"}
                </p>
              </article>
            ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your legal team</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {[
            matter.leadAttorneyId,
            ...matter.team.filter((id) => id !== matter.leadAttorneyId),
          ].map((id) => (
            <div key={id} className="flex items-center justify-between gap-4">
              <Person userId={id} />
              <Button
                variant="outline"
                render={<Link href="/portal/messages" />}
                nativeButton={false}
              >
                Message
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalPage>
  );
}
