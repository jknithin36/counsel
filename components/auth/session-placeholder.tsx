"use client";

import { Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth/session";
import { auth } from "@/lib/content/auth";
import { useDemoStore } from "@/lib/data/store";

/**
 * Temporary landing for /dashboard and /portal until those apps are built.
 * Also catches a stale cookie with no stored session (e.g. storage cleared).
 */
export function SessionPlaceholder({ title }: { title: string }) {
  const router = useRouter();
  const { session, user } = useSession();

  // Read the live store, not the hook value: during hydration the hook
  // briefly reports the server snapshot (no session) even when signed in.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-check when the session changes
  useEffect(() => {
    if (!useDemoStore.getState().session) {
      signOut();
      router.replace("/login");
    }
  }, [session, router]);

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

  return (
    <div className="container-page py-16">
      <h1 className="text-[44px] text-[#111]">{title}</h1>
      {user && (
        <p className="mt-3 text-[16px] text-muted-foreground">
          {auth.signedInAs(user.name, user.title)}
        </p>
      )}
      <Button variant="outline" className="mt-8" onClick={handleSignOut}>
        <HugeiconsIcon icon={Logout01Icon} className="size-4" />
        {auth.signOut}
      </Button>
    </div>
  );
}
