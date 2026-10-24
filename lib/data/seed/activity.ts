import { format } from "date-fns";
import { practiceAreaLabel } from "../labels";
import type {
  Client,
  Consultation,
  FirmActivity,
  Invoice,
  Lead,
  Matter,
  MatterDocument,
  MessageThread,
} from "../types";
import { findDemoUser } from "./users";

const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

/** Firm-wide history derived from the seed records, newest first. */
export function buildActivityLog(
  now: Date,
  data: {
    leads: Lead[];
    consultations: Consultation[];
    clients: Client[];
    matters: Matter[];
    invoices: Invoice[];
    documents: MatterDocument[];
    threads: MessageThread[];
  },
): FirmActivity[] {
  const events: FirmActivity[] = [];
  const push = (event: Omit<FirmActivity, "id">) =>
    events.push({ id: `ACT-${events.length + 1}`, ...event });
  const clientName = (id: string) =>
    data.clients.find((c) => c.id === id)?.name ??
    findDemoUser(id)?.name ??
    "Client";

  for (const lead of data.leads) {
    const name = `${lead.firstName} ${lead.lastName}`;
    const href = `/dashboard/leads/${lead.id}`;
    push({
      createdAt: lead.createdAt,
      type: "lead_created",
      actorId:
        lead.source === "phone" || lead.source === "referral"
          ? "u-tom"
          : "website",
      message: `New lead: ${name} · ${practiceAreaLabel(lead.practiceArea)}`,
      href,
    });
    const change = lead.activity.findLast((a) => a.type === "status_changed");
    if (change) {
      push({
        createdAt: change.createdAt,
        type: "lead_status_changed",
        actorId: "u-tom",
        message: `${name}: ${change.message.toLowerCase()}`,
        href,
      });
    }
  }

  for (const c of data.consultations) {
    if (c.status !== "scheduled") continue;
    const lead = data.leads.find((l) => l.id === c.leadId);
    if (!lead) continue;
    const booked = lead.activity.at(-1)?.createdAt ?? lead.createdAt;
    push({
      createdAt: booked,
      type: "consultation_booked",
      actorId: "u-tom",
      message: `Consultation booked with ${lead.firstName} ${lead.lastName} for ${format(new Date(c.start), "MMM d")}`,
      href: "/dashboard/consultations",
    });
  }

  for (const m of data.matters) {
    push({
      createdAt: m.openedAt,
      type: "matter_opened",
      actorId: m.leadAttorneyId,
      message: `Matter opened: ${m.title}`,
      href: `/dashboard/matters/${m.id}`,
    });
  }

  for (const d of data.documents) {
    const matterHref = `/dashboard/matters/${d.matterId}`;
    if (d.status === "signed") {
      push({
        createdAt: d.uploadedAt,
        type: "document_signed",
        actorId: "client",
        message: `Document signed: ${d.name}`,
        href: matterHref,
      });
    } else if (d.uploadedBy.startsWith("cl-")) {
      push({
        createdAt: d.uploadedAt,
        type: "document_uploaded",
        actorId: "client",
        message: `${clientName(d.uploadedBy)} uploaded ${d.name}`,
        href: matterHref,
      });
    }
  }

  for (const inv of data.invoices) {
    const total = inv.lineItems.reduce((s, i) => s + i.quantity * i.rate, 0);
    if (inv.status === "draft") continue;
    push({
      createdAt: inv.issuedAt,
      type: "invoice_sent",
      actorId: "u-rosa",
      message: `Invoice ${inv.id} sent to ${clientName(inv.clientId)} · ${money(total)}`,
      href: "/dashboard/billing",
    });
    if (inv.paidAt) {
      push({
        createdAt: inv.paidAt,
        type: "invoice_paid",
        actorId: "client",
        message: `Invoice ${inv.id} paid · ${money(total)}`,
        href: "/dashboard/billing",
      });
    }
  }

  for (const thread of data.threads) {
    for (const msg of thread.messages) {
      if (
        findDemoUser(msg.authorId)?.role !== "client" &&
        !msg.authorId.startsWith("cl-")
      )
        continue;
      push({
        createdAt: msg.sentAt,
        type: "message_received",
        actorId: "client",
        message: `New message from ${clientName(thread.clientId)}`,
        href: "/dashboard/messages",
      });
    }
  }

  const cutoff = now.getTime() - 90 * 864e5;
  return events
    .filter((e) => {
      const t = new Date(e.createdAt).getTime();
      return t >= cutoff && t <= now.getTime();
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
