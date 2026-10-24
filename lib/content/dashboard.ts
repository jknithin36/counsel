/** Copy for the staff dashboard. */

export const dashboardShell = {
  brand: "Counsel",
  breadcrumbRoot: "Dashboard",
  skipToContent: "Skip to content",
  search: {
    button: "Search matters, clients, leads…",
    buttonShort: "Search",
    title: "Search",
    description: "Search leads, clients and matters",
    placeholder: "Search by name, matter number or reference…",
    empty: "No results found.",
    groups: { leads: "Leads", clients: "Clients", matters: "Matters" },
  },
  notifications: {
    label: "Notifications",
    heading: "Latest activity",
    empty: "No activity yet.",
  },
  newMenu: {
    label: "New",
    items: [
      { key: "lead", label: "New lead" },
      { key: "consultation", label: "New consultation" },
      { key: "matter", label: "New matter" },
      { key: "invoice", label: "New invoice" },
    ] as const,
  },
  userMenu: {
    profile: "Profile",
    publicSite: "View public site",
    reset: "Reset demo data",
    signOut: "Sign out",
  },
  resetDialog: {
    title: "Reset demo data?",
    description:
      "This restores the original leads, matters, clients, invoices and messages. Anything you added or changed, including website submissions, will be removed. You'll stay signed in.",
    cancel: "Cancel",
    confirm: "Reset data",
    done: "Demo data reset",
  },
};

export const dashboardErrorCopy = {
  title: "Something went wrong",
  body: "This page couldn't load. Try again, or reset the demo data from the account menu if the problem continues.",
  retry: "Try again",
};

export const dashboardNotFound = {
  title: "Page not found",
  body: "This page doesn't exist in the dashboard.",
  back: "Back to overview",
};

export const overview = {
  greeting: (hour: number, name: string) =>
    `${hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}, ${name}`,
  subtitle: "Here's what's happening at the firm today.",
  range: {
    label: "Date range",
    options: [
      { value: "7", label: "Last 7 days" },
      { value: "30", label: "Last 30 days" },
      { value: "90", label: "Last 90 days" },
    ],
  },
  stats: {
    newLeads: "New leads",
    vsPrevious: (diff: number) =>
      `${diff > 0 ? "+" : ""}${diff} vs previous period`,
    consultations: "Consultations this week",
    consultationsDetail: (upcoming: number) => `${upcoming} still to come`,
    openMatters: "Open matters",
    openMattersDetail: (pending: number) => `${pending} pending`,
    outstanding: "Outstanding invoices",
    outstandingDetail: (overdue: number) => `${overdue} overdue`,
  },
  leadsChart: {
    title: "Leads over time",
    description: (days: number) => `New leads per day, last ${days} days`,
    tabs: [
      { value: "all", label: "All" },
      { value: "website", label: "Website" },
      { value: "referral", label: "Referral" },
    ],
    series: "Leads",
    empty: "No leads in this period.",
  },
  byArea: {
    title: "Leads by practice area",
    description: "New leads in this period",
    centerLabel: "Leads",
    hint: "Hover a slice to see its share",
    empty: "No leads in this period.",
  },
  consultations: {
    title: "Today's consultations",
    description: "Today and tomorrow",
    today: "Today",
    tomorrow: "Tomorrow",
    join: "Join",
    view: "View",
    empty: "No consultations today or tomorrow.",
    with: (attorney: string) => `With ${attorney}`,
  },
  newLeads: {
    title: "New leads",
    description: "Most recent first",
    viewAll: "View all",
    columns: {
      name: "Name",
      area: "Practice area",
      urgency: "Urgency",
      source: "Source",
      received: "Received",
    },
    empty: "No leads yet. Website submissions will appear here.",
  },
  deadlines: {
    title: "Upcoming deadlines",
    description: "Next 14 days",
    overdue: (days: number) => `${days}d overdue`,
    today: "Due today",
    daysLeft: (days: number) => `${days}d left`,
    empty: "No deadlines in the next 14 days.",
  },
  activity: {
    title: "Recent activity",
    description: "Across the firm",
    empty: "No activity yet.",
  },
  error: "Couldn't load this card.",
};
