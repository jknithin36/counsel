"use client";

import { addDays, differenceInCalendarDays } from "date-fns";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Role } from "@/lib/auth/roles";
import type {
  ContentOverrides,
  ContentSection,
  DemoData,
  FirmActivity,
  Lead,
  Profile,
  Settings,
  TeamMember,
} from "./types";

export type Session = { userId: string; role: Role; signedInAt: string };

export const STORE_KEY = "counsel-demo-v1";

/**
 * Bump when the seed gains data that existing browsers should receive
 * (see upgradeDemoData in demo-data.ts).
 */
export const SEED_VERSION = 5;

type DemoState = DemoData & {
  session: Session | null;
  /** When the seed data was loaded (or last moved forward); null = not yet. */
  seededAt: string | null;
  /** Which seed shape this browser's data has (0 = not seeded). */
  seedVersion: number;
  setSeedVersion: (version: number) => void;
  setSession: (session: Session | null) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  removeLead: (id: string) => void;
  logActivity: (event: FirmActivity) => void;
  /** Applies a change computed from the current data in one update. */
  mutate: (change: (data: DemoData) => Partial<DemoData>) => void;
  /** Loads seed data, keeping anything submitted before the first visit. */
  seed: (data: DemoData) => void;
  /** Replaces all data with a fresh seed; the session is kept. */
  resetData: (data: DemoData) => void;
  /** Moves every date forward so seeded data stays relative to today. */
  rebase: (now: Date) => void;
  /** Website edits (merged over lib/content on the public site). */
  contentOverrides: ContentOverrides;
  setContent: <K extends ContentSection>(
    section: K,
    patch: Partial<ContentOverrides>,
    by: string,
  ) => void;
  resetContent: () => void;
  /** Changed settings sections; defaults fill the rest. */
  settings: Partial<Settings>;
  setSettings: <K extends keyof Omit<Settings, "published">>(
    section: K,
    value: Settings[K],
    by: string,
  ) => void;
  /** Null until someone edits the team; then the full list. */
  team: TeamMember[] | null;
  setTeam: (team: TeamMember[]) => void;
  profiles: Record<string, Partial<Profile>>;
  setProfile: (userId: string, patch: Partial<Profile>) => void;
  /** Clears content, settings, team and profiles (used by a full reset). */
  resetCustomizations: () => void;
};

const emptyData: DemoData = {
  leads: [],
  consultations: [],
  clients: [],
  matters: [],
  invoices: [],
  documents: [],
  threads: [],
  activityLog: [],
  conflictChecks: [],
  payments: [],
  trustTransactions: [],
  appointments: [],
  portalForms: [],
};

const dataKeys = Object.keys(emptyData) as (keyof DemoData)[];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/** Every ISO date string inside `value`, moved by whole days. */
function shiftDates<T>(value: T, days: number): T {
  if (typeof value === "string" && ISO_DATE.test(value))
    return addDays(new Date(value), days).toISOString() as T;
  if (Array.isArray(value))
    return value.map((item) => shiftDates(item, days)) as T;
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, shiftDates(v, days)]),
    ) as T;
  return value;
}

const newestFirst = (a: { createdAt: string }, b: { createdAt: string }) =>
  b.createdAt.localeCompare(a.createdAt);

// localStorage can be missing or throw (private mode, blocked storage).
// Fall back to an in-memory store so the app keeps working.
const memory = new Map<string, string>();
const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      memory.delete(key);
    }
  },
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      ...emptyData,
      session: null,
      seededAt: null,
      seedVersion: 0,
      setSeedVersion: (seedVersion) => set({ seedVersion }),
      contentOverrides: {},
      setContent: (section, patch, by) =>
        set((state) => ({
          contentOverrides: {
            ...state.contentOverrides,
            ...patch,
            published: {
              ...state.contentOverrides.published,
              [section]: { at: new Date().toISOString(), by },
            },
          },
        })),
      // The firm profile is edited in Settings and survives a content reset.
      resetContent: () =>
        set(({ contentOverrides: { firm, published } }) => ({
          contentOverrides: firm
            ? { firm, published: published?.firm && { firm: published.firm } }
            : {},
        })),
      settings: {},
      setSettings: (section, value, by) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [section]: value,
            published: {
              ...state.settings.published,
              [section]: { at: new Date().toISOString(), by },
            },
          },
        })),
      team: null,
      setTeam: (team) => set({ team }),
      profiles: {},
      setProfile: (userId, patch) =>
        set((state) => ({
          profiles: {
            ...state.profiles,
            [userId]: { ...state.profiles[userId], ...patch },
          },
        })),
      resetCustomizations: () =>
        set({ contentOverrides: {}, settings: {}, team: null, profiles: {} }),
      setSession: (session) => set({ session }),
      addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),
      updateLead: (id, patch) =>
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id ? { ...lead, ...patch } : lead,
          ),
        })),
      removeLead: (id) =>
        set((state) => ({ leads: state.leads.filter((l) => l.id !== id) })),
      logActivity: (event) =>
        set((state) => ({ activityLog: [event, ...state.activityLog] })),
      mutate: (change) => set((state) => change(state)),
      seed: (data) =>
        set((state) => ({
          ...data,
          leads: [...state.leads, ...data.leads].sort(newestFirst),
          activityLog: [...state.activityLog, ...data.activityLog].sort(
            newestFirst,
          ),
          seededAt: new Date().toISOString(),
        })),
      resetData: (data) => set({ ...data, seededAt: new Date().toISOString() }),
      rebase: (now) =>
        set((state) => {
          if (!state.seededAt) return {};
          const days = differenceInCalendarDays(now, new Date(state.seededAt));
          if (days <= 0) return {};
          // Records added after seeding (e.g. a website lead) already have
          // real dates, so only seeded ones move.
          const seededAt = state.seededAt;
          const shifted: Partial<DemoData> = {};
          for (const key of dataKeys) {
            const items = state[key] as { createdAt?: string }[];
            Object.assign(shifted, {
              [key]: items.map((item) =>
                item.createdAt && item.createdAt > seededAt
                  ? item
                  : shiftDates(item, days),
              ),
            });
          }
          return { ...shifted, seededAt: now.toISOString() };
        }),
    }),
    {
      name: STORE_KEY,
      version: 3,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        session: state.session,
        seededAt: state.seededAt,
        seedVersion: state.seedVersion,
        contentOverrides: state.contentOverrides,
        settings: state.settings,
        team: state.team,
        profiles: state.profiles,
        ...Object.fromEntries(dataKeys.map((key) => [key, state[key]])),
      }),
      // Version 1 only stored the session and website leads. Keep both;
      // the dashboard seeds the rest on its first visit.
      migrate: (persisted, version) => {
        const old = (persisted ?? {}) as Partial<DemoState>;
        if (version < 2) {
          return {
            ...emptyData,
            session: old.session ?? null,
            leads: old.leads ?? [],
            seededAt: null,
          } as DemoState;
        }
        if (version < 3) {
          return {
            ...old,
            conflictChecks: [],
            seedVersion: 2,
          } as DemoState;
        }
        return {
          ...old,
          appointments: old.appointments ?? [],
          portalForms: old.portalForms ?? [],
        } as DemoState;
      },
    },
  ),
);
