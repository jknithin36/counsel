import { LegalDocument } from "@/components/site/legal-document";
import { legalDocs } from "@/lib/content/legal";
import { createPageMetadata } from "@/lib/metadata";

const doc = legalDocs.privacy;

export const metadata = createPageMetadata({
  title: doc.title,
  description: doc.intro,
  path: "/privacy",
});

export default function LegalPage() {
  return <LegalDocument doc={doc} />;
}
