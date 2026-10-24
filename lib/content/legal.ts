import { firm } from "@/lib/config/firm";

export type LegalDoc = {
  slug: "privacy" | "disclaimer" | "attorney-advertising";
  title: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const legalLastUpdated = "2026-10-01";
export const legalLastUpdatedLabel = "Last updated";

const address = `${firm.address.line1}, ${firm.address.city}, ${firm.address.region} ${firm.address.postalCode}`;

export const legalDocs: Record<LegalDoc["slug"], LegalDoc> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    intro: `This policy explains how ${firm.legalName} ("${firm.name}," "we," "us") collects, uses and protects information when you visit this website or contact us.`,
    sections: [
      {
        heading: "Information we collect",
        paragraphs: [
          "We collect information you choose to give us, such as your name, contact details and a description of your situation when you submit a consultation request or contact form.",
          "We also collect limited technical information, such as browser type and pages visited, to keep the website secure and working well.",
        ],
      },
      {
        heading: "How we use information",
        paragraphs: [
          "We use your information to respond to your inquiry, check for conflicts of interest, schedule consultations and, if you become a client, provide legal services.",
          `We do not sell your personal information. ${firm.name} shares information only with service providers who help us operate, and only as needed for those services.`,
        ],
      },
      {
        heading: "Confidentiality",
        paragraphs: [
          "Information you send us is treated as confidential. However, contacting us does not by itself create an attorney–client relationship, so please do not send confidential details until we have agreed to represent you.",
        ],
      },
      {
        heading: "Your choices",
        paragraphs: [
          `You may ask us to access, correct or delete the personal information we hold about you by emailing ${firm.email}.`,
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          `${firm.legalName}, ${address}. Phone ${firm.phone}. Email ${firm.email}.`,
        ],
      },
    ],
  },
  disclaimer: {
    slug: "disclaimer",
    title: "Legal Disclaimer",
    intro: `The information on this website is provided by ${firm.legalName} for general informational purposes only.`,
    sections: [
      {
        heading: "Not legal advice",
        paragraphs: [
          "Nothing on this website is legal advice. Laws change and vary by jurisdiction, and the right answer always depends on your specific facts. Talk to a qualified attorney before acting on any information here.",
        ],
      },
      {
        heading: "No attorney–client relationship",
        paragraphs: [
          `Using this website, submitting a form, or contacting ${firm.name} by phone or email does not create an attorney–client relationship. That relationship begins only when we have agreed in writing to represent you.`,
        ],
      },
      {
        heading: "Past results",
        paragraphs: [
          "Case results and testimonials describe past matters. They do not guarantee or predict a similar outcome in any future case.",
        ],
      },
      {
        heading: "Links to other websites",
        paragraphs: [
          "This website may link to other sites for convenience. We are not responsible for their content or practices.",
        ],
      },
    ],
  },
  "attorney-advertising": {
    slug: "attorney-advertising",
    title: "Attorney Advertising",
    intro: `This website may be considered attorney advertising under the rules of professional conduct in some jurisdictions.`,
    sections: [
      {
        heading: "Responsible attorneys",
        paragraphs: [
          `${firm.legalName} is responsible for the content of this website. Our office is located at ${address}.`,
        ],
      },
      {
        heading: "Prior results",
        paragraphs: [
          "Prior results do not guarantee a similar outcome. Any results described were based on the unique facts of each matter.",
        ],
      },
      {
        heading: "Images and testimonials",
        paragraphs: [
          "Some images on this website are illustrations and may not depict actual clients, attorneys or events. Client names in testimonials are shortened to protect privacy.",
        ],
      },
      {
        heading: "Areas of practice",
        paragraphs: [
          "Listing a practice area does not mean an attorney is certified as a specialist in that area by any board or organization.",
        ],
      },
    ],
  },
};
