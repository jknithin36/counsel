import { format, formatDistanceStrict } from "date-fns";

/** "(555) 555-0148" from any string of digits; partial input stays partial. */
export function formatPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

let dateStyle = "MMM d, yyyy";

/** Set from the signed-in user's Profile › Preferences. */
export function setDateStyle(style: string) {
  dateStyle = style;
}

/** The user's date style: "Oct 24, 2026", or "Oct 24, 2026, 2:30 PM". */
export function formatDate(iso: string, withTime = false) {
  return format(new Date(iso), withTime ? `${dateStyle}, h:mm a` : dateStyle);
}

/** "Eleanor Calloway" → "EC". */
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** "5m ago", "3h ago", "2d ago". */
export function timeAgo(iso: string, now = new Date()) {
  const date = new Date(iso);
  if (now.getTime() - date.getTime() < 60_000) return "Just now";
  return formatDistanceStrict(date, now, { addSuffix: true })
    .replace(/ seconds?/, "s")
    .replace(/ minutes?/, "m")
    .replace(/ hours?/, "h")
    .replace(/ days?/, "d")
    .replace(/ months?/, "mo")
    .replace(/ years?/, "y");
}

export function formatMoney(value: number, cents = false) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
}
