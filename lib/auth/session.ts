"use client";

import {
  DEMO_PASSWORD,
  type DemoUser,
  demoUsers,
  findDemoUser,
} from "@/lib/data/seed/users";
import { STORE_KEY, useDemoStore } from "@/lib/data/store";
import { type Role, SESSION_COOKIE, type StaffRole } from "./roles";

/*
 * Demo-only authentication. The session lives in the persisted store; a
 * readable role cookie lets proxy.ts redirect before a page renders. Swap
 * these functions for a real auth provider later.
 */

export type SignInResult =
  | { ok: true; user: DemoUser }
  | { ok: false; error: "invalid" | "corrupted" };

function setRoleCookie(role: Role, remember: boolean) {
  const maxAge = remember ? `; max-age=${60 * 60 * 24 * 30}` : "";
  // biome-ignore lint/suspicious/noDocumentCookie: demo session cookie read by proxy.ts
  document.cookie = `${SESSION_COOKIE}=${role}; path=/; SameSite=Lax${maxAge}`;
}

function clearRoleCookie() {
  // biome-ignore lint/suspicious/noDocumentCookie: demo session cookie read by proxy.ts
  document.cookie = `${SESSION_COOKIE}=; path=/; SameSite=Lax; max-age=0`;
}

/** True when the saved demo data can't be read back. */
export function isDemoDataCorrupted() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw === null) return false;
    const parsed = JSON.parse(raw);
    return !parsed?.state || !Array.isArray(parsed.state.leads);
  } catch (error) {
    // SecurityError means storage is blocked, not corrupted.
    return !(error instanceof DOMException);
  }
}

/** Clears every piece of demo data in this browser and reloads. */
export function resetDemo() {
  try {
    localStorage.removeItem(STORE_KEY);
    sessionStorage.clear();
  } catch {}
  clearRoleCookie();
  window.location.reload();
}

export function signInAs(user: DemoUser, remember = true): SignInResult {
  if (isDemoDataCorrupted()) return { ok: false, error: "corrupted" };
  useDemoStore.getState().setSession({
    userId: user.id,
    role: user.role,
    signedInAt: new Date().toISOString(),
  });
  setRoleCookie(user.role, remember);
  return { ok: true, user };
}

export function signIn(
  email: string,
  password: string,
  remember = true,
): SignInResult {
  if (isDemoDataCorrupted()) return { ok: false, error: "corrupted" };
  const user = demoUsers.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!user || password !== DEMO_PASSWORD)
    return { ok: false, error: "invalid" };
  return signInAs(user, remember);
}

/** Demo mode only: view the dashboard as another staff role. */
export function switchDemoRole(role: StaffRole) {
  const { session, setSession } = useDemoStore.getState();
  if (!session) return;
  setSession({ ...session, role });
  setRoleCookie(role, true);
}

export function signOut() {
  useDemoStore.getState().setSession(null);
  clearRoleCookie();
}

/** The signed-in demo user, or null. */
export function useSession() {
  const session = useDemoStore((s) => s.session);
  const user = session ? findDemoUser(session.userId) : undefined;
  return { session, user: user ?? null };
}
