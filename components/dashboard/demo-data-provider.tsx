"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { isStaff } from "@/lib/auth/roles";
import { isDemoDataCorrupted, signOut } from "@/lib/auth/session";
import { demoExperience } from "@/lib/content/demo";
import { ensureDemoData, resetDemoData } from "@/lib/data/demo-data";
import { STORE_KEY, useDemoStore } from "@/lib/data/store";

type Status = "loading" | "ready" | "error";

const StatusContext = createContext<Status>("loading");

/** "loading" until the store is hydrated and seeded. */
export function useDemoStatus() {
  return useContext(StatusContext);
}

/**
 * Seeds the demo data on the first visit, checks the stored session (the
 * proxy only sees the cookie) and picks up changes made in other tabs,
 * such as a lead submitted from the public site.
 */
export function DemoDataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("loading");

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once on mount
  useEffect(() => {
    // Read the live store: during hydration the hook reports the server
    // snapshot (no session) even when signed in.
    const session = useDemoStore.getState().session;
    if (!session || !isStaff(session.role)) {
      signOut();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    try {
      if (isDemoDataCorrupted()) {
        resetDemoData();
        toast.add({ title: demoExperience.dataRecovered, type: "warning" });
      } else if (ensureDemoData() === "updated") {
        toast.add({ title: demoExperience.dataUpdated, type: "info" });
      }
      setStatus("ready");
    } catch {
      setStatus("error");
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORE_KEY) useDemoStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <StatusContext value={status}>{children}</StatusContext>;
}
