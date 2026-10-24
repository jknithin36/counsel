import type { Metadata } from "next";
import { LegalDocument } from "@/components/site/legal-document";
import { legalDocs } from "@/lib/content/legal";

const doc = legalDocs.privacy;

export const metadata: Metadata = {
  title: doc.title,
  description: doc.intro,
};

export default function LegalPage() {
  return <LegalDocument doc={doc} />;
}
