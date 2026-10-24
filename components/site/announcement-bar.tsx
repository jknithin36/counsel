"use client";

import Link from "next/link";
import { ArrowIcon } from "@/components/site/arrow-icon";
import { announcementStorageKey } from "@/lib/announcement";
import { useAnnouncement } from "@/lib/site-content";
import { AnnouncementDismiss } from "./announcement-dismiss";

/** The top bar; its text and link are editable in Dashboard › Content. */
export function AnnouncementBar() {
  const { enabled, message, linkLabel, linkHref } = useAnnouncement();
  if (!enabled) return null;
  return (
    <div className="relative bg-ink text-white in-data-[announcement=dismissed]:hidden">
      <div className="container-page flex min-h-10 items-center justify-center px-12 py-2 text-sm">
        <p className="text-center">
          {message}{" "}
          {linkLabel && linkHref && (
            <Link
              href={linkHref}
              className="group/arrow font-medium whitespace-nowrap underline underline-offset-4 hover:no-underline"
            >
              {linkLabel} <ArrowIcon className="inline-block align-[-0.2em]" />
            </Link>
          )}
        </p>
      </div>
      <AnnouncementDismiss
        storageKey={announcementStorageKey}
        message={message}
      />
    </div>
  );
}
