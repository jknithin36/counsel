"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FirmText } from "@/components/site/live/firm";
import { Button } from "@/components/ui/button";
import { navActions } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

const NAV_HEIGHT = 76;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Flip to the inverse theme while a [data-nav-theme="dark"] section sits
  // under the navbar. The observer root is shrunk to a 1px line through the
  // middle of the (stuck) navbar.
  useEffect(() => {
    const sections = document.querySelectorAll("[data-nav-theme='dark']");
    if (sections.length === 0) return;

    let observer: IntersectionObserver | undefined;
    const intersecting = new Set<Element>();

    const observe = () => {
      observer?.disconnect();
      intersecting.clear();
      const line = NAV_HEIGHT / 2;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) intersecting.add(entry.target);
            else intersecting.delete(entry.target);
          }
          setDark(intersecting.size > 0);
        },
        {
          rootMargin: `-${line}px 0px -${window.innerHeight - line - 1}px 0px`,
        },
      );
      for (const section of sections) observer.observe(section);
    };

    observe();
    window.addEventListener("resize", observe);
    return () => {
      window.removeEventListener("resize", observe);
      observer?.disconnect();
    };
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      data-theme={dark ? "dark" : "light"}
      className={cn(
        "sticky top-0 z-40 h-[76px] border-b border-transparent bg-white text-foreground transition-[background-color,border-color,color] duration-200 motion-reduce:transition-none",
        scrolled && "border-border bg-white/85 backdrop-blur-md",
        dark &&
          "border-white/10 bg-ink/85 backdrop-blur-md [--foreground:#ffffff]",
      )}
    >
      <div className="container-page flex h-full items-center justify-between gap-8">
        <Link
          href="/"
          className="whitespace-nowrap font-serif text-[26px] leading-none tracking-[-0.02em]"
        >
          <FirmText field="name" />
        </Link>

        <DesktopNav />

        <div className="hidden items-center gap-3 xl:flex">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={navActions.login.href} />}
            className={cn(dark && "hover:bg-white/10")}
          >
            {navActions.login.label}
          </Button>
          <Button
            variant={dark ? "inverse" : "default"}
            nativeButton={false}
            render={<Link href={navActions.consultation.href} />}
          >
            {navActions.consultation.label}
          </Button>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
