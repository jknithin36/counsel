import type { Role } from "@/lib/auth/roles";

/** Fictional demo accounts. Every account uses DEMO_PASSWORD. */
export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Display title, e.g. "Owner" or "Personal injury client". */
  title: string;
  /** Attorney profile slug, for staff who are attorneys. */
  attorneySlug?: string;
  /** Matter the client account is linked to. */
  matterId?: string;
};

export const DEMO_PASSWORD = "demo1234";

export const demoUsers: DemoUser[] = [
  {
    id: "u-eleanor",
    name: "Eleanor Calloway",
    email: "eleanor@example.com",
    role: "owner",
    title: "Owner",
    attorneySlug: "eleanor-calloway",
  },
  {
    id: "u-daniel",
    name: "Daniel Reyes",
    email: "daniel@example.com",
    role: "attorney",
    title: "Attorney",
    attorneySlug: "daniel-reyes",
  },
  {
    id: "u-priya",
    name: "Priya Raman",
    email: "priya@example.com",
    role: "attorney",
    title: "Attorney",
    attorneySlug: "priya-raman",
  },
  {
    id: "u-marcus",
    name: "Marcus Bell",
    email: "marcus@example.com",
    role: "attorney",
    title: "Attorney",
    attorneySlug: "marcus-bell",
  },
  {
    id: "u-sofia",
    name: "Sofia Alvarez",
    email: "sofia@example.com",
    role: "attorney",
    title: "Attorney",
    attorneySlug: "sofia-alvarez",
  },
  {
    id: "u-james",
    name: "James Whitaker",
    email: "james@example.com",
    role: "attorney",
    title: "Attorney",
    attorneySlug: "james-whitaker",
  },
  {
    id: "u-rosa",
    name: "Rosa Medina",
    email: "rosa@example.com",
    role: "paralegal",
    title: "Paralegal",
  },
  {
    id: "u-tom",
    name: "Tom Becker",
    email: "tom@example.com",
    role: "intake",
    title: "Intake Specialist",
  },
  {
    id: "u-maria",
    name: "Maria Delgado",
    email: "maria@example.com",
    role: "client",
    title: "Personal injury client",
    matterId: "M-2026-0142",
  },
];

export function findDemoUser(id: string) {
  return demoUsers.find((u) => u.id === id);
}

function requireUser(id: string) {
  const user = findDemoUser(id);
  if (!user) throw new Error(`Missing demo user ${id}`);
  return user;
}

export const demoStaffUser = requireUser("u-eleanor");
export const demoClientUser = requireUser("u-maria");

export const staffUsers = demoUsers.filter((u) => u.role !== "client");
export const attorneyUsers = demoUsers.filter(
  (u) => u.role === "owner" || u.role === "attorney",
);
