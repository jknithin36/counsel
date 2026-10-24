"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { signOut } from "@/lib/auth/session";
import { ensureDemoData } from "@/lib/data/demo-data";
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
      ensureDemoData();
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
