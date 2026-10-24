import {
  Facebook01Icon,
  Linkedin01Icon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import {
  FirmEmailLink,
  FirmPhoneLink,
  FirmText,
} from "@/components/site/live/firm";
import { firm } from "@/lib/config/firm";
import {
  footerCopy,
  footerNav,
  legalLinks,
  socialLinks,
} from "@/lib/config/navigation";

const socialIcons = {
  linkedin: Linkedin01Icon,
  facebook: Facebook01Icon,
  youtube: YoutubeIcon,
};

const linkClass =
  "text-[15px] text-white underline-offset-4 hover:underline focus-visible:outline-white";

export function Footer() {
  return (
    <footer data-nav-theme="dark" className="bg-ink pt-20 pb-12 text-white">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-[1.6fr_repeat(4,1fr)] lg:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <p className="font-serif text-[44px] leading-none tracking-[-0.02em]">
              <FirmText field="monogram" />
            </p>
            <address className="mt-6 text-[14px] leading-[1.8] not-italic text-white/60">
              <FirmText field="legalName" />
              <br />
              <FirmText field="line1" />
              <br />
              <FirmText field="city" />, <FirmText field="region" />{" "}
              <FirmText field="postalCode" />
              <br />
              <FirmPhoneLink className="hover:text-white" />
              <br />
              <FirmEmailLink className="hover:text-white" />
              <br />
              <FirmText field="hours" />
            </address>
          </div>

          {footerNav.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="font-sans text-[14px] font-normal leading-normal tracking-normal text-white/65">
                {column.heading}
              </h2>
              <ul className="mt-5 flex flex-col gap-4">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="font-sans text-[14px] font-normal leading-normal tracking-normal text-white/65">
              {footerCopy.connectHeading}
            </h2>
            <ul className="mt-5 flex flex-col gap-4">
              {socialLinks.map((social) => (
                <li key={social.network}>
                  <a
                    href={social.href}
                    aria-label={`${firm.name} on ${social.label}`}
                    className={`${linkClass} inline-flex items-center gap-2`}
                  >
                    <HugeiconsIcon
                      icon={socialIcons[social.network]}
                      strokeWidth={1.5}
                      className="size-4"
                    />
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/12 pt-7 text-[13px] text-white/65 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} <FirmText field="name" />.{" "}
            {footerCopy.rights}
          </p>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 md:gap-x-2">
            {legalLinks.map((link, i) => (
              <li key={link.href} className="flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden="true" className="hidden md:inline">
                    ·
                  </span>
                )}
                <Link
                  href={link.href}
                  className="underline-offset-4 hover:text-white hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 max-w-[900px] text-[12px] leading-[1.7] text-white/65">
          {footerCopy.disclaimer}
        </p>
      </div>
    </footer>
  );
}
