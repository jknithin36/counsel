"use client";

import Link from "next/link";
import { FirmPhoneLink } from "@/components/site/live/firm";
import { Button } from "@/components/ui/button";
import { errorPage as copy } from "@/lib/content/pages";

export default function SiteError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="bg-white pt-14 pb-[120px] lg:pt-[100px]">
      <div className="container-page">
        <div className="mx-auto max-w-[1200px]">
          <h1 className="text-[clamp(2.75rem,6vw,5rem)] leading-[1.02] tracking-[-0.025em] text-[#111]">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-[640px] text-[19px] leading-[1.6] text-[#3a3a3a]">
            {copy.intro}{" "}
            <FirmPhoneLink className="whitespace-nowrap underline underline-offset-4" />
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
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
      </div>
    </section>
  );
}
