import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appErrors } from "@/lib/content/errors";

export default function PortalNotFound() {
  const copy = appErrors.portal;
  return (
    <section className="mx-auto max-w-2xl py-12">
      <h1 className="font-serif text-4xl tracking-tight">
        {copy.notFoundTitle}
      </h1>
      <p className="mt-3 text-muted-foreground">{copy.notFoundBody}</p>
      <Button
        className="mt-6"
        nativeButton={false}
        render={<Link href="/portal" />}
      >
        {copy.home}
      </Button>
    </section>
  );
}
