"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { demoMode } from "@/lib/config/env";
import { demoExperience as copy } from "@/lib/content/demo";

const DISMISSED_KEY = "counsel-demo-banner-dismissed";
const enabled = demoMode;

export function DemoModeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      setVisible(sessionStorage.getItem(DISMISSED_KEY) !== "true");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <aside className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-amber-950">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 text-xs leading-5">
        <p>{copy.banner}</p>
        <button
          type="button"
          aria-label={copy.dismissBanner}
          className="-m-2 flex size-9 shrink-0 items-center justify-center rounded-button hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => {
            try {
              sessionStorage.setItem(DISMISSED_KEY, "true");
            } catch {}
            setVisible(false);
          }}
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
        </button>
      </div>
    </aside>
  );
}
