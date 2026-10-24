"use client";

import type { PracticeAreaSlug } from "@/lib/content/practice-areas";
import { currentUser, uid } from "./leads";
import { findDemoUser } from "./seed/users";
import { matterStages, stageLabel } from "./stages";
import { useDemoStore } from "./store";
import type {
  Client,
  FeeType,
  FirmActivityType,
  Matter,
  MatterTask,
  MatterUpdate,
} from "./types";

/*
 * Matter data access. Client-visible changes (shared updates, document
 * requests, signature requests, messages) live in the same store the
 * client portal reads.
 */

const now = () => new Date().toISOString();

export function getMatter(id: string) {
  return useDemoStore.getState().matters.find((m) => m.id === id);
}

/** Records an event in the firm activity log, linked to the matter. */
function logMatter(
  matterId: string,
  type: FirmActivityType,
  message: string,
  tab?: string,
) {
  const href = `/dashboard/matters/${matterId}${tab ? `?tab=${tab}` : ""}`;
  useDemoStore.getState().mutate((data) => ({
    activityLog: [
      {
        id: uid(),
        createdAt: now(),
        type,
        actorId: currentUser().id,
        message,
        href,
      },
      ...data.activityLog,
    ],
  }));
}

function patchMatter(id: string, change: (m: Matter) => Partial<Matter>) {
  useDemoStore.getState().mutate((data) => ({
    matters: data.matters.map((m) =>
      m.id === id ? { ...m, ...change(m) } : m,
    ),
  }));
}

/** The next matter number, e.g. "M-2026-0203". */
export function nextMatterNumber(
  matters: Matter[],
  year = new Date().getFullYear(),
) {
  const max = Math.max(
    0,
    ...matters.map((m) => Number(m.id.split("-").at(-1)) || 0),
  );
  return `M-${year}-${String(max + 1).padStart(4, "0")}`;
}

export type NewClientInput = Pick<Client, "name" | "email" | "phone"> &
  Partial<
    Pick<Client, "language" | "address" | "leadId" | "preferredContact">
  > & {
    note?: string;
  };

export function createClient(input: NewClientInput): Client {
  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/^-|-$/g, "");
  const client: Client = {
    id: `cl-${slug}-${uid().slice(0, 4)}`,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    address: input.address ?? "Address to be confirmed",
    language: input.language ?? "English",
    since: now(),
    matters: [],
    trustBalance: 0,
    leadId: input.leadId,
  };
  useDemoStore
    .getState()
    .mutate((data) => ({ clients: [...data.clients, client] }));
  return client;
}

export type NewMatterInput = {
  clientId: string;
  title: string;
  practiceArea: PracticeAreaSlug;
  leadAttorneyId: string;
  team: string[];
  feeType: FeeType;
  openedAt: string;
  /** Budget for hourly/flat matters, estimated value for contingency. */
  amount?: number;
  opposingParties?: string[];
};

/** Opens a matter for an existing client and returns its number. */
export function createMatter(input: NewMatterInput): Matter {
  const { matters, mutate } = useDemoStore.getState();
  const id = nextMatterNumber(matters, new Date(input.openedAt).getFullYear());
  const first = matterStages[input.practiceArea][0];
  const team = [...new Set([input.leadAttorneyId, ...input.team])];
  const matter: Matter = {
    id,
    title: input.title.trim(),
    clientId: input.clientId,
    practiceArea: input.practiceArea,
    status: "open",
    stage: first.key,
    leadAttorneyId: input.leadAttorneyId,
    team,
    openedAt: input.openedAt,
    feeType: input.feeType,
    budget: input.feeType === "contingency" ? undefined : input.amount,
    estimatedValue: input.feeType === "contingency" ? input.amount : undefined,
    tasks: [],
    updates: [
      {
        id: uid(),
        createdAt: now(),
        authorId: input.leadAttorneyId,
        title: first.label,
        body: "Matter opened. Engagement letter and intake documents to follow.",
        shared: true,
      },
    ],
    opposingParties: input.opposingParties ?? [],
    relatedParties: [],
  };
  mutate((data) => ({
    matters: [...data.matters, matter],
    clients: data.clients.map((c) =>
      c.id === input.clientId ? { ...c, matters: [...c.matters, id] } : c,
    ),
  }));
  logMatter(id, "matter_opened", `Matter opened: ${matter.title}`);
  return matter;
}

export function postUpdate(
  matterId: string,
  input: { title: string; body: string; shared: boolean },
) {
  const update: MatterUpdate = {
    id: uid(),
    createdAt: now(),
    authorId: currentUser().id,
    title: input.title.trim(),
    body: input.body.trim(),
    shared: input.shared,
  };
  patchMatter(matterId, (m) => ({ updates: [...m.updates, update] }));
  logMatter(
    matterId,
    "matter_updated",
    `${input.shared ? "Client update" : "Internal update"} posted on ${matterId}: ${update.title}`,
    "timeline",
  );
}

/** Moves the matter to a stage and posts a client-visible update. */
export function changeStage(matterId: string, stage: string) {
  const matter = getMatter(matterId);
  if (!matter || matter.stage === stage) return;
  const label = stageLabel(matter.practiceArea, stage);
  patchMatter(matterId, () => ({ stage }));
  postUpdate(matterId, {
    title: `Stage changed to ${label}`,
    body: `Your matter has moved to the ${label} stage.`,
    shared: true,
  });
}

export type MatterEdit = Partial<
  Pick<
    Matter,
    | "title"
    | "leadAttorneyId"
    | "feeType"
    | "budget"
    | "estimatedValue"
    | "nextDeadline"
    | "status"
  >
>;

export function updateMatter(matterId: string, patch: MatterEdit) {
  patchMatter(matterId, () => patch);
  logMatter(matterId, "matter_updated", `Matter ${matterId} details updated`);
}

export function closeMatter(matterId: string) {
  patchMatter(matterId, () => ({ status: "closed" }));
  postUpdate(matterId, {
    title: "Matter closed",
    body: "This matter has been closed. Thank you for trusting us with it.",
    shared: true,
  });
  logMatter(matterId, "matter_closed", `Matter closed: ${matterId}`);
}

/** Removes the matter with its documents and message thread. */
export function deleteMatter(matterId: string) {
  const matter = getMatter(matterId);
  if (!matter) return;
  useDemoStore.getState().mutate((data) => ({
    matters: data.matters.filter((m) => m.id !== matterId),
    documents: data.documents.filter((d) => d.matterId !== matterId),
    threads: data.threads.filter((t) => t.matterId !== matterId),
    clients: data.clients.map((c) => ({
      ...c,
      matters: c.matters.filter((id) => id !== matterId),
    })),
    activityLog: [
      {
        id: uid(),
        createdAt: now(),
        type: "matter_closed",
        actorId: currentUser().id,
        message: `Matter deleted: ${matter.title}`,
      },
      ...data.activityLog,
    ],
  }));
}

export function setTeam(
  matterId: string,
  leadAttorneyId: string,
  team: string[],
) {
  const members = [...new Set([leadAttorneyId, ...team])];
  patchMatter(matterId, () => ({ leadAttorneyId, team: members }));
  const names = members.map((id) => findDemoUser(id)?.name).filter(Boolean);
  logMatter(
    matterId,
    "matter_updated",
    `Team for ${matterId}: ${names.join(", ")}`,
  );
}

// Tasks

export type TaskInput = Pick<
  MatterTask,
  "title" | "assigneeId" | "dueAt" | "priority"
>;

export function addTask(matterId: string, input: TaskInput) {
  const task: MatterTask = {
    id: uid(),
    done: false,
    ...input,
    title: input.title.trim(),
  };
  patchMatter(matterId, (m) => ({ tasks: [...m.tasks, task] }));
  logMatter(
    matterId,
    "task_updated",
    `Task added on ${matterId}: ${task.title}`,
    "tasks",
  );
  return task;
}

export function updateTask(
  matterId: string,
  taskId: string,
  patch: Partial<MatterTask>,
) {
  patchMatter(matterId, (m) => ({
    tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
  }));
}

export function toggleTask(matterId: string, taskId: string, done: boolean) {
  const task = getMatter(matterId)?.tasks.find((t) => t.id === taskId);
  updateTask(matterId, taskId, { done });
  if (task)
    logMatter(
      matterId,
      "task_updated",
      `${done ? "Task completed" : "Task reopened"} on ${matterId}: ${task.title}`,
      "tasks",
    );
}
