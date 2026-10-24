import type { Role } from "./roles";

/*
 * What each staff role may change. Owners can do everything; attorneys
 * can't edit the firm or team; paralegals and intake also can't touch
 * billing settings or export reports.
 */

export type Permission =
  | "editFirm"
  | "manageTeam"
  | "billingSettings"
  | "exportReports";

const rules: Record<Permission, Role[]> = {
  editFirm: ["owner"],
  manageTeam: ["owner"],
  billingSettings: ["owner"],
  exportReports: ["owner"],
};

export function can(role: Role | undefined, permission: Permission) {
  return Boolean(role && rules[permission].includes(role));
}

export const restrictedMessage = "Only owners can change this";
