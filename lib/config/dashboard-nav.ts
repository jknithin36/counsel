import {
  Analytics02Icon,
  Briefcase01Icon,
  Calendar03Icon,
  DashboardSquare01Icon,
  Folder01Icon,
  Invoice03Icon,
  KanbanIcon,
  Message01Icon,
  PencilEdit02Icon,
  SecurityCheckIcon,
  Settings01Icon,
  UserAdd01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: typeof DashboardSquare01Icon;
  /** Which live count to show next to the item. */
  badge?: "newLeads" | "unreadMessages";
};

export const dashboardNav: { label: string; items: DashboardNavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { title: "Overview", href: "/dashboard", icon: DashboardSquare01Icon },
      {
        title: "Leads",
        href: "/dashboard/leads",
        icon: UserAdd01Icon,
        badge: "newLeads",
      },
      { title: "Pipeline", href: "/dashboard/pipeline", icon: KanbanIcon },
      {
        title: "Consultations",
        href: "/dashboard/consultations",
        icon: Calendar03Icon,
      },
      {
        title: "Conflict Check",
        href: "/dashboard/conflicts",
        icon: SecurityCheckIcon,
      },
    ],
  },
  {
    label: "Practice",
    items: [
      { title: "Matters", href: "/dashboard/matters", icon: Briefcase01Icon },
      { title: "Clients", href: "/dashboard/clients", icon: UserGroupIcon },
      { title: "Documents", href: "/dashboard/documents", icon: Folder01Icon },
      {
        title: "Messages",
        href: "/dashboard/messages",
        icon: Message01Icon,
        badge: "unreadMessages",
      },
      { title: "Billing", href: "/dashboard/billing", icon: Invoice03Icon },
    ],
  },
  {
    label: "Firm",
    items: [
      { title: "Content", href: "/dashboard/content", icon: PencilEdit02Icon },
      { title: "Reports", href: "/dashboard/reports", icon: Analytics02Icon },
      { title: "Settings", href: "/dashboard/settings", icon: Settings01Icon },
    ],
  },
];

export const dashboardNavItems = dashboardNav.flatMap((group) => group.items);

/** The nav item for a path, matching the deepest section. */
export function navItemFor(pathname: string) {
  if (pathname === "/dashboard") return dashboardNavItems[0];
  return dashboardNavItems
    .filter((item) => item.href !== "/dashboard")
    .find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
}
