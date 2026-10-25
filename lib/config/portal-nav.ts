import {
  Briefcase01Icon,
  Calendar03Icon,
  DashboardSquare01Icon,
  File02Icon,
  Folder01Icon,
  HelpCircleIcon,
  Invoice03Icon,
  Message01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

export type PortalNavItem = {
  title: string;
  href: string;
  icon: typeof DashboardSquare01Icon;
  /** Which live count to show next to the item. */
  badge?: "documents" | "messages" | "forms";
};

export const portalNav: PortalNavItem[] = [
  { title: "Overview", href: "/portal", icon: DashboardSquare01Icon },
  { title: "My case", href: "/portal/case", icon: Briefcase01Icon },
  {
    title: "Documents",
    href: "/portal/documents",
    icon: Folder01Icon,
    badge: "documents",
  },
  {
    title: "Messages",
    href: "/portal/messages",
    icon: Message01Icon,
    badge: "messages",
  },
  { title: "Appointments", href: "/portal/appointments", icon: Calendar03Icon },
  { title: "Billing", href: "/portal/billing", icon: Invoice03Icon },
  { title: "Forms", href: "/portal/forms", icon: File02Icon, badge: "forms" },
];

export const portalAccountNav: PortalNavItem[] = [
  { title: "Profile", href: "/portal/profile", icon: UserIcon },
  { title: "Help", href: "/portal-help", icon: HelpCircleIcon },
];

/** Signing pages belong to Documents. */
const aliases: Record<string, string> = { "/portal/sign": "/portal/documents" };

/** The nav item for a path, matching the deepest section. */
export function portalNavItemFor(pathname: string) {
  if (pathname === "/portal") return portalNav[0];
  const path = Object.entries(aliases).reduce(
    (p, [from, to]) => (p.startsWith(from) ? to + p.slice(from.length) : p),
    pathname,
  );
  return [...portalNav.slice(1), ...portalAccountNav].find(
    (item) => path === item.href || path.startsWith(`${item.href}/`),
  );
}
