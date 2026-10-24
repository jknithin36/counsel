"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDemoStore } from "@/lib/data/store";
import { formatDate } from "@/lib/format";
import { MATTER_ID, PortalPage } from "./shared";

const labels = {
  not_started: "Not started",
  in_progress: "In progress",
  submitted: "Submitted",
};
export function FormsPage() {
  const allForms = useDemoStore((s) => s.portalForms);
  const forms = allForms.filter((form) => form.matterId === MATTER_ID);
  return (
    <PortalPage
      title="Forms"
      description="Questionnaires your legal team has asked you to complete."
    >
      <div className="space-y-4">
        {forms.length ? (
          forms.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{form.name}</CardTitle>
                    <CardDescription>
                      Updated {formatDate(form.updatedAt)}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{labels[form.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant={form.status === "submitted" ? "outline" : "default"}
                  render={<Link href={`/portal/forms/${form.id}`} />}
                  nativeButton={false}
                >
                  {form.status === "submitted"
                    ? "View answers"
                    : form.status === "in_progress"
                      ? "Continue"
                      : "Start form"}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="rounded-lg border p-8 text-center text-muted-foreground">
            No forms are waiting for you.
          </p>
        )}
      </div>
    </PortalPage>
  );
}
