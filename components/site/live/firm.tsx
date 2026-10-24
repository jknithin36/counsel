"use client";

import type { FirmProfile } from "@/lib/data/types";
import { telHref, useFirm } from "@/lib/site-content";

/*
 * Firm details that the dashboard can edit (Settings › Firm profile).
 * Server components drop these in where they used to read lib/config/firm.
 */

type TextField = Exclude<keyof FirmProfile, "languages">;

/** One firm field as text, e.g. <FirmText field="phone" />. */
export function FirmText({ field }: { field: TextField | "address" }) {
  const firm = useFirm();
  if (field === "address")
    return (
      <>{`${firm.line1}, ${firm.city}, ${firm.region} ${firm.postalCode}`}</>
    );
  return <>{firm[field]}</>;
}

/** A tel: link showing the firm phone; children render before the number. */
export function FirmPhoneLink({
  className,
  prefix,
  children,
  hideNumber = false,
  ...rest
}: {
  className?: string;
  prefix?: string;
  children?: React.ReactNode;
  /** Link text comes from children only. */
  hideNumber?: boolean;
} & Omit<React.ComponentProps<"a">, "href">) {
  const { phone } = useFirm();
  return (
    <a href={telHref(phone)} className={className} {...rest}>
      {children}
      {prefix}
      {!hideNumber && phone}
    </a>
  );
}

export function FirmEmailLink({ className }: { className?: string }) {
  const { email } = useFirm();
  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  );
}
