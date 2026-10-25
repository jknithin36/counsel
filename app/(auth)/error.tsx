"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appErrors } from "@/lib/content/errors";

export default function AuthError({ reset }: { reset: () => void }) {
  const copy = appErrors.auth;
  return (
    <section className="flex min-h-dvh items-center justify-center p-6 text-center">
      <div className="max-w-xl">
        <h1 className="font-serif text-5xl tracking-tight">{copy.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {copy.body}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset}>{copy.retry}</Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/" />}
          >
            {copy.home}
          </Button>
        </div>
      </div>
    </section>
  );
}
