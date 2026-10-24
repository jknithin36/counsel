"use client";

import { useMemo } from "react";
import { defaultProfile } from "@/lib/config/defaults";
import { findDemoUser } from "@/lib/data/seed/users";
import { useDemoStore } from "@/lib/data/store";
import type { Profile } from "@/lib/data/types";
import { setDateStyle } from "@/lib/format";

/** The signed-in user's profile with defaults filled in. */
export function useProfile(): Profile & { userId?: string } {
  const userId = useDemoStore((s) => s.session?.userId);
  const stored = useDemoStore((s) => (userId ? s.profiles[userId] : undefined));
  return useMemo(() => {
    const user = userId ? findDemoUser(userId) : undefined;
    return { ...defaultProfile, title: user?.title, ...stored, userId };
  }, [userId, stored]);
}

/**
 * Applies Profile › Preferences to the dashboard: the date format (pages
 * re-render under a new key when it changes) and compact table density.
 */
export function Preferences({ children }: { children: React.ReactNode }) {
  const { dateFormat, compact } = useProfile();
  // Set before children render so every formatDate call agrees.
  setDateStyle(dateFormat);
  return (
    <div
      key={dateFormat}
      data-density={compact ? "compact" : undefined}
      className="contents"
    >
      {children}
    </div>
  );
}
