"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formsPage as copy } from "@/lib/content/portal";
import { useDemoStore } from "@/lib/data/store";
import type { PortalForm } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { StatusBadge, type Tone } from "../dashboard/status-badge";
import { PortalPage } from "./shared";
import { usePortal } from "./use-portal";

const tone: Record<PortalForm["status"], Tone> = {
  not_started: "amber",
  in_progress: "blue",
  submitted: "green",
};

export function FormsPage() {
  const { matter } = usePortal();
  const all = useDemoStore((s) => s.portalForms);
  const forms = all.filter((f) => f.matterId === matter?.id);

  return (
    <PortalPage title={copy.title} description={copy.subtitle}>
      <Card className="gap-0 py-0">
        {forms.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">{copy.empty}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">{copy.columns.name}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {copy.columns.updated}
                </TableHead>
                <TableHead>{copy.columns.status}</TableHead>
                <TableHead className="pr-4">
                  <span className="sr-only">{copy.columns.name}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="pl-4 font-medium whitespace-normal">
                    {form.name}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                    {formatDate(form.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={tone[form.status]}>
                      {copy.statuses[form.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button
                      variant={
                        form.status === "submitted" ? "outline" : "default"
                      }
                      size="sm"
                      className="h-8"
                      nativeButton={false}
                      render={<Link href={`/portal/forms/${form.id}`} />}
                    >
                      {copy.actions[form.status]}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </PortalPage>
  );
}
