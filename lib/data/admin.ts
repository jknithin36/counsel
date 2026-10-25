"use client";

import { currentUser } from "./leads";
import { useDemoStore } from "./store";
import type {
  ContentOverrides,
  ContentSection,
  Profile,
  Settings,
  TeamMember,
} from "./types";

/*
 * Website content, firm settings, team and staff profiles. Each change is
 * stamped with who made it. Swap these for API calls when connecting a
 * backend; the dashboard only calls these functions.
 */

type SettingsSection = keyof Omit<Settings, "published">;

/** Publishes edits to one website section (or the firm profile). */
export function saveContent(
  section: ContentSection,
  patch: Partial<ContentOverrides>,
) {
  useDemoStore.getState().setContent(section, patch, currentUser().name);
}

/** Restores the website's default content; the firm profile is kept. */
export function resetContent() {
  useDemoStore.getState().resetContent();
}

export function saveSettings<K extends SettingsSection>(
  section: K,
  value: Settings[K],
) {
  useDemoStore.getState().setSettings(section, value, currentUser().name);
}

export function saveTeam(team: TeamMember[]) {
  useDemoStore.setState((s) => ({
    team,
    settings: {
      ...s.settings,
      published: {
        ...s.settings.published,
        team: { at: new Date().toISOString(), by: currentUser().name },
      },
    },
  }));
}

export function saveProfile(userId: string, patch: Partial<Profile>) {
  useDemoStore.getState().setProfile(userId, patch);
}

/** Clears content, settings, team and profile changes. */
export function resetCustomizations() {
  useDemoStore.getState().resetCustomizations();
}
