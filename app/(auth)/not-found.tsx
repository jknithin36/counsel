import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFoundPage as copy } from "@/lib/content/pages";

export default function AuthNotFound() {
  return (
    <section className="flex min-h-dvh items-center justify-center p-6 text-center">
      <div className="max-w-xl">
        <h1 className="font-serif text-5xl tracking-tight">{copy.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {copy.intro}
        </p>
        <Button
          className="mt-8"
          nativeButton={false}
          render={<Link href="/" />}
        >
          {copy.links[0].label}
        </Button>
      </div>
    </section>
  );
}
