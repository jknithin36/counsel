"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast";
import {
  can,
  type Permission,
  restrictedMessage,
} from "@/lib/auth/permissions";
import { editorCopy } from "@/lib/content/dashboard-admin";
import { currentUser } from "@/lib/data/leads";
import { useDemoStore } from "@/lib/data/store";
import type { Settings } from "@/lib/data/types";
import { useSettings } from "@/lib/site-content";
import { useDirty } from "../editor-kit";

type Section = keyof Omit<Settings, "published">;

/** The restriction message when the signed-in role lacks `permission`. */
export function useRestriction(permission?: Permission) {
  const role = useDemoStore((s) => s.session?.role);
  return permission && !can(role, permission) ? restrictedMessage : undefined;
}

/** Draft state for one settings section, saved independently. */
export function useSettingsDraft<K extends Section>(section: K, name: string) {
  const live = useSettings(section);
  const published = useDemoStore(
    (s) => s.settings.published?.[section as never],
  );
  const [draft, setDraft] = useState(live);
  const dirty = useDirty(draft, live);
  return {
    draft,
    setDraft,
    patch: (change: Partial<Settings[K]>) =>
      setDraft((d) => ({ ...d, ...change })),
    dirty,
    published,
    discard: () => setDraft(live),
    save: (value: Settings[K] = draft) => {
      useDemoStore.getState().setSettings(section, value, currentUser().name);
      toast.add({ title: editorCopy.saved(name) });
    },
  };
}

/** "06:00" … "21:00" in 30-minute steps. */
export const timeOptions = Array.from({ length: 31 }, (_, i) => {
  const minutes = 6 * 60 + i * 30;
  const value = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 ? "30" : "00"}`;
  const h = Math.floor(minutes / 60);
  const label = `${h % 12 || 12}:${minutes % 60 ? "30" : "00"} ${h < 12 ? "AM" : "PM"}`;
  return { value, label };
});
