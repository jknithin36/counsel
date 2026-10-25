# Connecting a backend

Counsel ships with a browser-only demo: every record lives in `localStorage`.
The app is built so you can replace that with any backend (Postgres, Supabase,
Firebase, a REST or GraphQL API, a headless CMS) without rewriting the UI.

This guide explains the seams and walks through the swap.

## How data flows today

```text
            reads                              writes
components ───────► useDemoStore (cache) ◄─────── lib/data/* functions ◄── components
                         ▲
                         │ loaded once by
           ensureDemoData() in the dashboard and portal providers
```

There are three rules, and the codebase follows all of them:

1. **Reads** come from one client-side store, `useDemoStore` in
   `lib/data/store.ts`. Its shape is the `DemoData` type in
   `lib/data/types.ts`. Derived values (balances, unread counts, reports) are
   pure functions in `lib/data/selectors.ts` and `lib/data/reports.ts`.
2. **Writes** go through named functions in `lib/data/*`, such as
   `createLead`, `recordPayment` or `signPortalDocument`. Components never
   write to the store directly.
3. **Loading** happens in one place. `ensureDemoData()` (`lib/data/demo-data.ts`)
   fills the store from the seed, and it's called by
   `components/dashboard/demo-data-provider.tsx` and
   `components/portal/provider.tsx`.

So connecting a backend means changing what fills the store and what each
write function does. The store stays as the client-side cache, and pages
and components don't change.

## The swap, step by step

### 1. Turn off demo mode

Set `NEXT_PUBLIC_DEMO_MODE=false`. This hides the demo banner, the demo
sign-in buttons and the dashboard role switch, and makes `/login` redirect
signed-in users again (`proxy.ts`).

### 2. Replace authentication

`lib/auth/session.ts` is the only auth boundary. It exposes `signIn`,
`signInAs`, `signOut` and `useSession`. It also sets a role cookie, which
`proxy.ts` reads to guard `/dashboard` (staff) and `/portal` (clients).

- Replace `signIn` and `signOut` with your provider (Auth.js, Clerk, Supabase
  Auth, your own sessions).
- Make `useSession()` return `{ session, user }` from the provider, with
  `user.role` set to one of `owner | attorney | paralegal | intake | client`
  (`lib/auth/roles.ts`). For client users, also set `user.matterId`.
- In `proxy.ts`, verify the real session instead of trusting the role cookie.

`lib/auth/permissions.ts` (`can(role, permission)`) only hides controls in
the UI. **Enforce the same rules on the server.**

### 3. Load data from your API

Replace the body of `ensureDemoData()` with a fetch, then put the result in
the store:

```ts
// lib/data/demo-data.ts
export async function loadData() {
  const res = await fetch("/api/workspace"); // scoped to the signed-in user
  if (!res.ok) throw new Error("Failed to load");
  const data: DemoData = await res.json();
  useDemoStore.getState().resetData(data);
}
```

Then, in both providers, `await loadData()` before setting the status to
`"ready"`. A client should only receive their own matter, documents, invoices
and thread; do that filtering on the server.

Also stop persisting records in the browser. In `lib/data/store.ts`, narrow
`partialize` to UI preferences only, or remove `persist` entirely, and drop
`rebase` and `seededAt`. `rebase` is demo-only and keeps the sample dates
relative to today.

### 4. Make each write call your backend

Keep every function's name and arguments. Inside it, call your API, then
apply the saved record to the store so the UI updates:

```ts
// lib/data/leads.ts
export async function createLead(input: NewLead): Promise<Lead> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Couldn't save the lead");
  const lead: Lead = await res.json(); // id, reference and history come from the server
  useDemoStore.getState().addLead(lead);
  return lead;
}
```

For a snappier feel, update the store first (optimistic) and roll back if the
request fails. Server actions work the same way: call the action, then update
the store with what it returns.

Most functions return synchronously today. When you make one `async`,
TypeScript flags every caller that needs an `await`.

### 5. Move server-owned logic to the server

These run in the browser for the demo but must be authoritative on the
server:

| Demo behaviour | Where it is | Production owner |
| --- | --- | --- |
| Lead references (`CR-1234`) | `referenceCode` in `leads.ts` | Database sequence |
| Matter numbers (`M-2026-0142`) | `nextMatterNumber` in `matters.ts` | Database sequence |
| Invoice numbers and totals | `nextInvoiceNumber`, `selectors.ts` | Billing service |
| Auto-assignment of new leads | `createLead` | Intake service |
| Conflict search | `conflicts.ts` | Server query across all records |
| Payments | `recordPayment` (simulated card form) | Payment provider (e.g. Stripe) with webhooks |
| File uploads | `uploadDocument`, `uploadPortalDocument` (keep name and size only) | Encrypted object storage with signed URLs |
| E-signatures | `signPortalDocument` | E-signature provider or audited server flow |
| Activity log | written by each function | Append-only audit log |
| Simulated replies | `simulateClientReply`, `simulateStaffReply` | Delete |

## The write contract

Every write in the app goes through one of these functions. Implement them
against your backend and the whole UI works.

| Module | Functions |
| --- | --- |
| `leads.ts` | `createLead`, `createIntakeLead`, `updateLead`, `setLeadStatus`, `assignLead`, `addNote`, `deleteNote`, `deleteLead`, `logLeadEvent` |
| `consultations.ts` | `scheduleConsultation`, `cancelConsultation`, `setConsultationStatus`, `updateConsultationNotes` |
| `conflicts.ts` | `runConflictCheck`, `saveConflictCheck` |
| `clients.ts` | `convertLeadToClient`, `updateClient`, `inviteToPortal`, `setClientArchived`, `addClientNote`, `deleteClientNote` |
| `matters.ts` | `createClient`, `createMatter`, `updateMatter`, `changeStage`, `postUpdate`, `closeMatter`, `deleteMatter`, `setTeam`, `addTask`, `updateTask`, `toggleTask` |
| `documents.ts` | `requestDocument`, `uploadDocument`, `setDocumentStatus`, `deleteDocument`, `sendDocumentReminder` |
| `messages.ts` | `sendMessage`, `markThreadRead` |
| `billing.ts` | `createInvoice`, `sendInvoice`, `voidInvoice`, `recordPayment`, `markInvoicePaid`, `trustDeposit` |
| `portal.ts` | `uploadPortalDocument`, `signPortalDocument`, `sendPortalMessage`, `markPortalMessagesRead`, `requestAppointment`, `savePortalForm`, `updatePortalProfile` |
| `admin.ts` | `saveContent`, `resetContent`, `saveSettings`, `saveTeam`, `saveProfile`, `resetCustomizations` |

Read helpers such as `getLead`, `getMatter`, `listLeads`, `getInvoice` and the
selectors work on whatever is in the store, so they keep working unchanged.

## Website content and settings

Dashboard › Content and Settings save overrides with `saveContent` and
`saveSettings`. The public site reads them through hooks in
`lib/site-content.ts`, with the static defaults from `lib/content/*` and
`lib/config/*` as fallbacks.

With a backend you can either:

- **Keep it simple:** store overrides in a `site_content` table and have the
  hooks read from it. Or,
- **Make it static:** read overrides in server components at build or request
  time (with `revalidateTag` after a save), so the public site renders the
  final content without client-side merging. This is the better choice for SEO.

## Suggested data model

`lib/data/types.ts` maps closely to tables:

`users`, `leads` (with `notes` and `activity` as child tables),
`consultations`, `clients`, `matters` (with `tasks` and `updates`),
`documents` (with `history`), `threads` and `messages`, `invoices` (with
`line_items`), `payments`, `trust_transactions`, `conflict_checks`,
`appointments`, `portal_forms`, `activity_log`, `site_content`, `settings`,
`team_members` and `profiles`.

Give every table a firm or tenant id if more than one firm will share the
database, and scope every query by it.

## Before you go live

The demo stores data unencrypted in the browser and has no real security.
Read **Going to production** in the [README](../README.md) for the full
checklist: database, authentication, encrypted storage, audit logging,
payments, email, monitoring, and attorney-advertising and data-protection
review.
