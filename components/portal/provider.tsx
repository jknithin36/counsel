"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { isDemoDataCorrupted, signOut } from "@/lib/auth/session";
import { demoExperience } from "@/lib/content/demo";
import { ensureDemoData, resetDemoData } from "@/lib/data/demo-data";
import { STORE_KEY, useDemoStore } from "@/lib/data/store";

type Status = "loading" | "ready" | "error";
const PortalStatusContext = createContext<Status>("loading");
export const usePortalStatus = () => useContext(PortalStatusContext);

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const session = useDemoStore.getState().session;
    if (!session || session.role !== "client") {
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
  }, [pathname, router]);

  return <PortalStatusContext value={status}>{children}</PortalStatusContext>;
}
