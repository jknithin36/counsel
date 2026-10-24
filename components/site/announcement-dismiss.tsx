"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect } from "react";

/** Hides the bar until its message changes. */
export function AnnouncementDismiss({
  storageKey,
  message,
}: {
  storageKey: string;
  message: string;
}) {
  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) === message) {
        document.documentElement.dataset.announcement = "dismissed";
      } else {
        delete document.documentElement.dataset.announcement;
      }
    } catch {
      // Storage may be blocked; the announcement simply remains visible.
    }
  }, [storageKey, message]);

  function dismiss() {
    try {
      localStorage.setItem(storageKey, message);
    } catch {
      // Storage blocked (private mode etc.) — still hide it for this visit.
    }
    document.documentElement.dataset.announcement = "dismissed";
  }

  return (
    <button
      type="button"
      onClick={dismiss}
      aria-label="Dismiss announcement"
      className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-button text-white/70 transition-colors duration-150 hover:text-white lg:right-6"
    >
      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
    </button>
  );
}
