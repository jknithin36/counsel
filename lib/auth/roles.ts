/*
 * Shared by the browser and proxy.ts, so keep this file free of
 * browser-only or React code.
 */

export type StaffRole = "owner" | "attorney" | "paralegal" | "intake";
export type Role = StaffRole | "client";

export const SESSION_COOKIE = "counsel-session";

export const staffRoleLabels: Record<StaffRole, string> = {
  owner: "Owner",
  attorney: "Attorney",
  paralegal: "Paralegal",
  intake: "Intake",
};

const staffRoles: readonly string[] = [
  "owner",
  "attorney",
  "paralegal",
  "intake",
];

export function isRole(value: string | undefined): value is Role {
  return value === "client" || staffRoles.includes(value ?? "");
}

export function isStaff(role: Role) {
  return staffRoles.includes(role);
}

/** Where a role lands after signing in. */
export function homeFor(role: Role) {
  return isStaff(role) ? "/dashboard" : "/portal";
}

/**
 * Accept ?next= only when it's an internal path inside the role's own area,
 * so a login link can't send someone off-site or to the wrong app.
 */
export function safeNext(next: string | null | undefined, role: Role) {
  if (!next || !next.startsWith("/") || next.startsWith("//"))
    return homeFor(role);
  const area = homeFor(role);
  return next === area ||
    next.startsWith(`${area}/`) ||
    next.startsWith(`${area}?`)
    ? next
    : area;
}
