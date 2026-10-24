import type { Metadata } from "next";
import { Suspense } from "react";
import { ThankYou } from "@/components/site/consultation/thank-you";
import { consultation } from "@/lib/content/consultation";

export const metadata: Metadata = {
  title: consultation.thankYou.metaTitle,
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <section className="bg-white pt-14 pb-[88px] lg:pt-[100px] lg:pb-[140px]">
      <div className="container-page">
        <Suspense fallback={<div className="min-h-[560px]" />}>
          <ThankYou />
        </Suspense>
      </div>
    </section>
  );
}
