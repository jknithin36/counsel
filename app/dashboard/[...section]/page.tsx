import { notFound } from "next/navigation";

/*
 * Unknown dashboard paths render app/dashboard/not-found.tsx inside the
 * dashboard layout instead of the site-wide 404.
 */
export default function UnknownSection() {
  notFound();
}
