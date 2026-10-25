"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appErrors } from "@/lib/content/errors";

export default function PortalError({ reset }: { reset: () => void }) {
  const copy = appErrors.portal;
  return (
    <section className="mx-auto max-w-2xl py-12">
      <h1 className="font-serif text-4xl tracking-tight">{copy.title}</h1>
      <p className="mt-3 text-muted-foreground">{copy.body}</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>{copy.retry}</Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/portal" />}
        >
          {copy.home}
        </Button>
      </div>
    </section>
  );
}
