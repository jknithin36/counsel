"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { signOut } from "@/lib/auth/session";
import { firm } from "@/lib/config/firm";
import { invoiceBalance } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";
import { PortalProvider } from "./provider";
import { CLIENT_ID, MATTER_ID } from "./shared";

const nav = [
  ["Overview", "/portal"],
  ["My Case", "/portal/case"],
  ["Documents", "/portal/documents"],
  ["Messages", "/portal/messages"],
  ["Appointments", "/portal/appointments"],
  ["Billing", "/portal/billing"],
  ["Forms", "/portal/forms"],
] as const;

function useCounts() {
  const documents = useDemoStore((s) => s.documents);
  const threads = useDemoStore((s) => s.threads);
  const invoices = useDemoStore((s) => s.invoices);
  const payments = useDemoStore((s) => s.payments);
  return {
    Documents: documents.filter(
      (doc) =>
        doc.matterId === MATTER_ID &&
        ["requested", "sent_for_signature"].includes(doc.status),
    ).length,
    Messages:
      threads
        .find((thread) => thread.matterId === MATTER_ID)
        ?.messages.filter(
          (message) =>
            message.authorId !== "u-maria" &&
            !message.internal &&
            !message.read,
        ).length ?? 0,
    Billing: invoices
      .filter((invoice) => invoice.clientId === CLIENT_ID)
      .reduce((sum, invoice) => sum + invoiceBalance(invoice, payments), 0),
  };
}

function NavLink({
  label,
  href,
  mobile = false,
}: {
  label: string;
  href: string;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const counts = useCounts();
  const active =
    href === "/portal" ? pathname === href : pathname.startsWith(href);
  const count = label in counts ? counts[label as keyof typeof counts] : 0;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        mobile
          ? `flex min-h-11 flex-1 flex-col items-center justify-center rounded-md px-2 text-[11px] ${active ? "bg-muted font-medium" : "text-muted-foreground"}`
          : `flex min-h-11 items-center justify-between rounded-md px-3 text-sm transition-colors ${active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`
      }
    >
      <span>{mobile && label === "My Case" ? "Case" : label}</span>
      {count > 0 && (
        <Badge
          className={mobile ? "h-4 px-1 text-[9px]" : "bg-white text-black"}
        >
          {label === "Billing" ? "$" : count}
        </Badge>
      )}
    </Link>
  );
}

function MoreMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="min-h-11 flex-1 rounded-md text-[11px] text-muted-foreground"
          />
        }
      >
        More
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader>
          <SheetTitle>More</SheetTitle>
          <SheetDescription>
            Appointments, billing, forms, and account settings.
          </SheetDescription>
        </SheetHeader>
        <nav className="grid gap-1 px-4">
          {nav.slice(4).map(([label, href]) => (
            <Button
              key={href}
              variant="ghost"
              className="justify-start"
              onClick={() => go(href)}
            >
              {label}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => go("/portal/profile")}
          >
            Profile
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => go("/portal-help")}
          >
            Help
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-destructive"
            onClick={() => {
              signOut();
              router.replace("/login");
            }}
          >
            Sign out
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <PortalProvider>
      <TooltipProvider>
        <Toaster>
          <div className="min-h-dvh bg-[#fafafa] text-sm">
            <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[#111] p-5 text-white lg:flex">
              <Link href="/portal" className="font-serif text-3xl">
                Counsel
              </Link>
              <p className="mt-1 text-xs text-white/50">{firm.name}</p>
              <div className="mt-8 rounded-lg border border-white/10 p-3">
                <p className="text-[11px] uppercase tracking-wider text-white/45">
                  Your matter
                </p>
                <p className="mt-1 text-sm text-white">
                  Delgado v. Ridgeline Freight
                </p>
                <p className="text-xs text-white/45">M-2026-0142</p>
              </div>
              <nav className="mt-6 grid gap-1">
                {nav.map(([label, href]) => (
                  <NavLink key={href} label={label} href={href} />
                ))}
              </nav>
              <div className="mt-auto border-t border-white/10 pt-4">
                <Link
                  href="/portal/profile"
                  className="flex min-h-12 items-center gap-3 rounded-md px-2 hover:bg-white/5"
                >
                  <Avatar>
                    <AvatarFallback>MD</AvatarFallback>
                  </Avatar>
                  <span>
                    <span className="block text-sm">Maria D.</span>
                    <span className="block text-xs text-white/45">Client</span>
                  </span>
                </Link>
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                  <Link
                    className="rounded px-2 py-2 text-white/60 hover:text-white"
                    href="/portal-help"
                  >
                    Help
                  </Link>
                  <button
                    type="button"
                    className="rounded px-2 py-2 text-left text-white/60 hover:text-white"
                    onClick={() => {
                      signOut();
                      router.replace("/login");
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </aside>
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur lg:hidden">
              <Link href="/portal" className="font-serif text-2xl">
                Counsel
              </Link>
              <Link href="/portal/profile" aria-label="Open profile">
                <Avatar>
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
              </Link>
            </header>
            <main className="pb-24 lg:ml-64 lg:pb-8">
              <div className="mx-auto w-full max-w-[1100px] p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </main>
            <nav
              aria-label="Portal navigation"
              className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-white px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
            >
              {nav.slice(0, 4).map(([label, href]) => (
                <NavLink key={href} label={label} href={href} mobile />
              ))}
              <MoreMenu />
            </nav>
          </div>
        </Toaster>
      </TooltipProvider>
    </PortalProvider>
  );
}
