import { LegalDocument } from "@/components/site/legal-document";
import { legalDocs } from "@/lib/content/legal";
import { createPageMetadata } from "@/lib/metadata";

const doc = legalDocs["attorney-advertising"];

export const metadata = createPageMetadata({
  title: doc.title,
  description: doc.intro,
  path: "/attorney-advertising",
});

export default function LegalPage() {
  return <LegalDocument doc={doc} />;
}
