export const firm = {
  name: "Calloway & Reyes",
  monogram: "C&R",
  legalName: "Calloway & Reyes, Attorneys at Law",
  phone: "(555) 555-0148",
  email: "hello@example.com",
  address: {
    line1: "100 Main Street, Suite 400",
    city: "Your City",
    region: "ST",
    postalCode: "00000",
  },
  hours: "Mon–Fri, 8am–6pm",
  /** schema.org openingHours format for the hours above. */
  openingHours: "Mo-Fr 08:00-18:00",
  languages: ["English", "Spanish"],
} as const;

/** "(555) 555-0148" → "tel:+15555550148" */
export function phoneHref(phone: string = firm.phone) {
  return `tel:+1${phone.replace(/\D/g, "")}`;
}
