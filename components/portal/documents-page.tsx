"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useDemoStore } from "@/lib/data/store";
import { formatDate } from "@/lib/format";
import { DocumentBadge, MATTER_ID, PortalPage } from "./shared";
import { UploadDialog } from "./upload-dialog";

export function DocumentsPage() {
  const allDocs = useDemoStore((s) => s.documents);
  const docs = allDocs.filter((doc) => doc.matterId === MATTER_ID);
  const requested = docs.filter(
    (doc) =>
      ["requested", "uploaded", "reviewed"].includes(doc.status) &&
      (doc.note || doc.dueAt || doc.history?.[0]?.status === "requested"),
  );
  const signatures = docs.filter((doc) => doc.status === "sent_for_signature");
  return (
    <PortalPage
      title="Documents"
      description="Upload requested files, sign documents, and see everything shared on your case."
      actions={<UploadDialog />}
    >
      <Card>
        <CardHeader>
          <CardTitle>Requested by your attorney</CardTitle>
          <CardDescription>
            Files your legal team needs from you.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {requested.length ? (
            requested.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{doc.name}</p>
                    <DocumentBadge status={doc.status} />
                  </div>
                  {doc.note && (
                    <p className="mt-1 text-muted-foreground">{doc.note}</p>
                  )}
                  {doc.dueAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Due {formatDate(doc.dueAt)}
                    </p>
                  )}
                </div>
                {doc.status === "requested" && (
                  <UploadDialog
                    requestId={doc.id}
                    trigger={<Button variant="outline" />}
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">
              No documents requested right now.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Waiting for your signature</CardTitle>
          <CardDescription>
            Review each document before signing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {signatures.length ? (
            signatures.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Sent {formatDate(doc.uploadedAt)}
                  </p>
                </div>
                <Button
                  render={<Link href={`/portal/sign/${doc.id}`} />}
                  nativeButton={false}
                >
                  Review &amp; sign
                </Button>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">
              Nothing is waiting for your signature.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>All documents</CardTitle>
        </CardHeader>
        <CardContent>
          {docs.length ? (
            <div className="divide-y">
              {docs
                .toSorted((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
                .map((doc) => (
                  <div
                    key={doc.id}
                    className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_120px_120px_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        From{" "}
                        {doc.uploadedBy === "cl-delgado"
                          ? "you"
                          : "your attorney"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(doc.uploadedAt)}
                    </span>
                    <DocumentBadge status={doc.status} />
                    <Button
                      variant="ghost"
                      onClick={() =>
                        toast.add({
                          title: "Download isn't available in the demo",
                          type: "info",
                        })
                      }
                    >
                      Download
                    </Button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No documents have been added yet.
            </p>
          )}
        </CardContent>
      </Card>
    </PortalPage>
  );
}
