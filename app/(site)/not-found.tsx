import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { notFoundPage as copy } from "@/lib/content/pages";

export default function NotFound() {
  return (
    <section className="min-h-[60vh] bg-white pb-[120px]">
      <PageHeader title={copy.title} intro={copy.intro} />
      <div className="container-page">
        <div className="mx-auto flex max-w-[1200px] flex-wrap gap-3">
          {copy.links.map((link, index) => (
            <Button
              key={link.href}
              variant={index === 0 ? "default" : "outline"}
              nativeButton={false}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
