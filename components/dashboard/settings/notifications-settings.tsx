"use client";

import { Switch } from "@/components/ui/switch";
import { defaultNotifications } from "@/lib/config/defaults";
import { settingsPage } from "@/lib/content/dashboard-admin";
import { currentUser } from "@/lib/data/leads";
import type { NotificationKey } from "@/lib/data/types";
import { EditorCard } from "../editor-kit";
import { useSettingsDraft } from "./shared";

const copy = settingsPage.notifications;
const keys = Object.keys(copy.items) as NotificationKey[];

/** The signed-in user's email alerts (stored per user). */
export function NotificationsSettings() {
  const s = useSettingsDraft(
    "notifications",
    settingsPage.savedName.notifications,
  );
  const me = currentUser();
  const mine = { ...defaultNotifications, ...s.draft[me.id] };

  return (
    <EditorCard
      kind="settings"
      title={copy.title}
      description={copy.description(me.name)}
      published={s.published}
      dirty={s.dirty}
      onDiscard={s.discard}
      onSave={() => s.save()}
    >
      <ul className="flex flex-col divide-y rounded-md border">
        {keys.map((key) => (
          <li key={key}>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: the switch renders inside the label */}
            <label className="flex items-center justify-between gap-4 px-3 py-3 text-sm">
              {copy.items[key]}
              <Switch
                checked={mine[key]}
                onCheckedChange={(on) =>
                  s.patch({ [me.id]: { ...mine, [key]: on } })
                }
              />
            </label>
          </li>
        ))}
      </ul>
    </EditorCard>
  );
}
