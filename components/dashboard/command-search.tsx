"use client";

import {
  Briefcase01Icon,
  Search01Icon,
  UserAdd01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { dashboardShell } from "@/lib/content/dashboard";
import { practiceAreaLabel } from "@/lib/data/labels";
import { leadName } from "@/lib/data/selectors";
import { useDemoStore } from "@/lib/data/store";

const copy = dashboardShell.search;

const OpenSearchContext = createContext<() => void>(() => {});

/** Opens the search dialog from anywhere in the dashboard. */
export function useOpenSearch() {
  return useContext(OpenSearchContext);
}

/** The top bar's search field. */
export function SearchButton() {
  const openSearch = useOpenSearch();
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={openSearch}
      className="h-8 w-8 justify-center px-0 text-muted-foreground sm:w-64 sm:justify-start sm:px-2.5 lg:w-80"
    >
      <HugeiconsIcon icon={Search01Icon} />
      <span className="hidden sm:inline">{copy.button}</span>
      <span className="sr-only sm:hidden">{copy.buttonShort}</span>
      <Kbd className="ml-auto hidden md:inline-flex">⌘K</Kbd>
    </Button>
  );
}

/**
 * ⌘K search across leads, clients and matters in the store. One dialog
 * for the whole dashboard; the sidebar and top bar both open it.
 */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const leads = useDemoStore((s) => s.leads);
  const clients = useDemoStore((s) => s.clients);
  const matters = useDemoStore((s) => s.matters);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      // "/" jumps to the page's table search, unless you're typing.
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest("input, textarea, select, [contenteditable=true]") ||
        document.querySelector("[role=dialog], [role=alertdialog]")
      )
        return;
      const search = document.querySelector<HTMLInputElement>(
        "[data-table-search]",
      );
      if (!search) return;
      event.preventDefault();
      search.focus();
      search.select();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <OpenSearchContext value={() => setOpen(true)}>
      {children}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={copy.title}
        description={copy.description}
      >
        <Command>
          <CommandInput placeholder={copy.placeholder} />
          <CommandList>
            <CommandEmpty>{copy.empty}</CommandEmpty>
            <CommandGroup heading={copy.groups.matters}>
              {matters.map((matter) => (
                <CommandItem
                  key={matter.id}
                  value={`${matter.title} ${matter.id}`}
                  onSelect={() => go(`/dashboard/matters/${matter.id}`)}
                >
                  <HugeiconsIcon icon={Briefcase01Icon} />
                  <span className="truncate">{matter.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                    {matter.id}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={copy.groups.clients}>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={`${client.name} ${client.email}`}
                  onSelect={() => go(`/dashboard/clients/${client.id}`)}
                >
                  <HugeiconsIcon icon={UserIcon} />
                  <span className="truncate">{client.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={copy.groups.leads}>
              {leads.map((lead) => (
                <CommandItem
                  key={lead.id}
                  value={`${leadName(lead)} ${lead.id}`}
                  onSelect={() => go(`/dashboard/leads/${lead.id}`)}
                >
                  <HugeiconsIcon icon={UserAdd01Icon} />
                  <span className="truncate">{leadName(lead)}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {practiceAreaLabel(lead.practiceArea)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </OpenSearchContext>
  );
}
