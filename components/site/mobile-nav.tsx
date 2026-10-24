"use client";

import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import { ArrowIcon } from "@/components/site/arrow-icon";
import { FirmPhoneLink, FirmText } from "@/components/site/live/firm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mainNav, navActions } from "@/lib/config/navigation";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            className="-mr-2.5 size-11 hover:bg-foreground/5 xl:hidden"
          />
        }
      >
        <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="size-6" />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 overflow-y-auto bg-white data-[side=right]:border-l-0 text-[#111] data-[side=right]:w-full data-[side=right]:sm:max-w-none"
      >
        <div className="container-page flex h-[76px] shrink-0 items-center justify-between">
          <SheetTitle className="font-serif text-[26px] font-normal leading-none tracking-[-0.02em]">
            <FirmText field="name" />
          </SheetTitle>
          <SheetClose
            aria-label="Close menu"
            render={
              <Button
                variant="ghost"
                size="icon-lg"
                className="-mr-2.5 size-11"
              />
            }
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              strokeWidth={2}
              className="size-6"
            />
          </SheetClose>
        </div>

        <nav aria-label="Mobile" className="container-page flex-1 pt-4">
          <Accordion>
            {mainNav.map((entry) =>
              entry.type === "link" ? (
                <Link
                  key={entry.label}
                  href={entry.href}
                  onClick={close}
                  className="block border-b border-border py-4 font-serif text-[28px] leading-tight tracking-[-0.02em]"
                >
                  {entry.label}
                </Link>
              ) : (
                <AccordionItem
                  key={entry.label}
                  value={entry.label}
                  className="border-b border-border"
                >
                  <AccordionTrigger className="items-center py-4 font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] hover:no-underline **:data-[slot=accordion-trigger-icon]:size-5">
                    {entry.label}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 [&_a]:no-underline">
                    <ul className="flex flex-col">
                      {entry.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className="block rounded-md py-2.5"
                          >
                            <span className="block text-[15px] font-medium text-[#111]">
                              {item.title}
                            </span>
                            <span className="block text-[13px] text-muted-foreground">
                              {item.description}
                            </span>
                          </Link>
                        </li>
                      ))}
                      {entry.footer && (
                        <li>
                          <Link
                            href={entry.footer.href}
                            onClick={close}
                            className="group/arrow flex items-center gap-1.5 py-2.5 text-[15px] font-medium text-[#111]"
                          >
                            {entry.footer.label} <ArrowIcon />
                          </Link>
                        </li>
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ),
            )}
          </Accordion>
        </nav>

        <div className="container-page flex shrink-0 flex-col gap-3 pt-8 pb-8">
          <Button
            nativeButton={false}
            render={
              <Link href={navActions.consultation.href} onClick={close} />
            }
            className="w-full"
          >
            {navActions.consultation.label}
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={navActions.login.href} onClick={close} />}
            className="w-full"
          >
            {navActions.login.label}
          </Button>
          <FirmPhoneLink
            className="mt-2 text-center text-[15px] font-medium underline underline-offset-4"
            prefix="Call "
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
