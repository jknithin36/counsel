"use client";

import { buildSeed } from "./seed";
import { SEED_VERSION, useDemoStore } from "./store";

/*
 * Loads the seed data on the first dashboard visit and keeps it relative
 * to today on later visits. Kept apart from the store so the public site
 * never bundles the seed.
 */

export function ensureDemoData(now = new Date()) {
  const { seededAt, seed, rebase, setSeedVersion } = useDemoStore.getState();
  if (!seededAt) {
    seed(buildSeed(now));
    setSeedVersion(SEED_VERSION);
    return "seeded" as const;
  }
  rebase(now);
  return upgradeDemoData(now) ? ("updated" as const) : ("ready" as const);
}

/**
 * Fills in data added to the seed since this browser was seeded, without
 * touching anything the user changed.
 */
function upgradeDemoData(now: Date) {
  const { seedVersion, mutate, setSeedVersion } = useDemoStore.getState();
  if (seedVersion >= SEED_VERSION) return false;
  const fresh = buildSeed(now);
  // Invoices had no year in their number before payments existed; nothing
  // could change them then, so swap in the new billing data wholesale.
  const oldBilling = useDemoStore
    .getState()
    .invoices.some((i) => !/^INV-\d{4}-/.test(i.id));
  mutate((data) => ({
    appointments:
      data.appointments.length > 0 ? data.appointments : fresh.appointments,
    portalForms:
      data.portalForms.length > 0 ? data.portalForms : fresh.portalForms,
    invoices: data.invoices.some((invoice) => invoice.clientId === "cl-delgado")
      ? data.invoices
      : [
          ...data.invoices,
          ...fresh.invoices.filter(
            (invoice) => invoice.clientId === "cl-delgado",
          ),
        ],
    ...(oldBilling || data.payments.length === 0
      ? {
          invoices: fresh.invoices,
          payments: fresh.payments,
          trustTransactions: fresh.trustTransactions,
        }
      : {}),
    clients: data.clients.map((client) => {
      const seeded = fresh.clients.find((c) => c.id === client.id);
      return {
        ...client,
        portalStatus:
          client.portalStatus ?? seeded?.portalStatus ?? "not_invited",
        preferredContact: client.preferredContact ?? seeded?.preferredContact,
        notes: client.notes ?? seeded?.notes ?? [],
      };
    }),
    documents: data.documents.map((doc) => ({
      ...doc,
      category:
        doc.category ?? fresh.documents.find((d) => d.id === doc.id)?.category,
    })),
    conflictChecks:
      data.conflictChecks.length > 0
        ? data.conflictChecks
        : fresh.conflictChecks,
    matters: data.matters.map((matter) => {
      const seeded = fresh.matters.find((m) => m.id === matter.id);
      return {
        ...matter,
        limitationsDate: matter.limitationsDate ?? seeded?.limitationsDate,
        tasks: matter.tasks.map((task) => ({
          ...task,
          priority:
            task.priority ??
            seeded?.tasks.find((t) => t.id === task.id)?.priority ??
            "medium",
        })),
      };
    }),
  }));
  setSeedVersion(SEED_VERSION);
  return true;
}

export function resetDemoData() {
  const store = useDemoStore.getState();
  store.resetData(buildSeed());
  store.setSeedVersion(SEED_VERSION);
}
