"use client";

import { appErrors } from "@/lib/content/errors";

export default function GlobalError({ reset }: { reset: () => void }) {
  const copy = appErrors.global;
  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-white p-6 text-[#111]">
        <main className="w-full max-w-xl text-center">
          <h1 className="font-serif text-5xl tracking-tight">{copy.title}</h1>
          <p className="mt-4 text-base leading-7 text-[#4a4a4a]">{copy.body}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 min-h-11 rounded-button bg-[#111] px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {copy.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
