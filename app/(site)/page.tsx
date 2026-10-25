import { faqJsonLd } from "@/components/site/faq-accordion";
import { AttorneysPreview } from "@/components/site/home/attorneys-preview";
import { CaseResults } from "@/components/site/home/case-results";
import { ClosingCta } from "@/components/site/home/closing-cta";
import { Faq } from "@/components/site/home/faq";
import { Hero } from "@/components/site/home/hero";
import { HowItWorks } from "@/components/site/home/how-it-works";
import { PortalTeaser } from "@/components/site/home/portal-teaser";
import { PracticeAreas } from "@/components/site/home/practice-areas";
import { Testimonials } from "@/components/site/home/testimonials";
import { TrustStrip } from "@/components/site/home/trust-strip";
import { TwoPaths } from "@/components/site/home/two-paths";
import { WhyUs } from "@/components/site/home/why-us";
import { JsonLd } from "@/components/site/json-ld";
import { firm } from "@/lib/config/firm";
import { homeFaqs } from "@/lib/content/faq";
import { hero } from "@/lib/content/home";
import { siteMeta } from "@/lib/content/pages";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: siteMeta.title,
  description: hero.subtext,
  path: "/",
  absoluteTitle: true,
});

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "#organization",
      name: firm.name,
      legalName: firm.legalName,
      email: firm.email,
      telephone: firm.phone,
    },
    {
      "@type": "LegalService",
      name: firm.name,
      parentOrganization: { "@id": "#organization" },
      telephone: firm.phone,
      email: firm.email,
      openingHours: firm.openingHours,
      availableLanguage: firm.languages,
      address: {
        "@type": "PostalAddress",
        streetAddress: firm.address.line1,
        addressLocality: firm.address.city,
        addressRegion: firm.address.region,
        postalCode: firm.address.postalCode,
        addressCountry: "US",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={faqJsonLd(homeFaqs)} />
      <Hero />
      <TrustStrip />
      <TwoPaths />
      <PracticeAreas />
      <CaseResults />
      <WhyUs />
      <AttorneysPreview />
      <HowItWorks />
      <PortalTeaser />
      <Testimonials />
      <Faq />
      <ClosingCta />
    </>
  );
}
