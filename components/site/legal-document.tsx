import { PageHeader } from "@/components/site/page-header";
import {
  type LegalDoc,
  legalLastUpdated,
  legalLastUpdatedLabel,
} from "@/lib/content/legal";
import { formatDate } from "@/lib/content/pages";

/** Simple legal page: header, "last updated" date and prose sections. */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: doc.title, href: `/${doc.slug}` }]}
        title={doc.title}
        intro={doc.intro}
      />
      <section className="bg-white pb-[88px] lg:pb-[140px]">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <div className="max-w-[720px]">
              <p className="text-[14px] text-muted-foreground">
                {legalLastUpdatedLabel}:{" "}
                <time dateTime={legalLastUpdated}>
                  {formatDate(legalLastUpdated)}
                </time>
              </p>
              {doc.sections.map((section) => (
                <section key={section.heading} className="mt-12">
                  <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] text-[#111]">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((p) => (
                    <p
                      key={p}
                      className="mt-4 text-[17px] leading-[1.75] text-[#3a3a3a]"
                    >
                      {p}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
