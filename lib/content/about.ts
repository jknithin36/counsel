import { firm } from "@/lib/config/firm";

export const about = {
  metaTitle: "About Us",
  title: `About ${firm.name}`,
  intro:
    "A firm built on one simple idea: clients deserve to know what's happening with their case.",
  story: {
    heading: "Our Story",
    paragraphs: [
      `Eleanor Calloway and Daniel Reyes started ${firm.name} after years of watching clients struggle to get a straight answer from their lawyers. Calls went unreturned, updates came months apart, and people facing the hardest moments of their lives were left guessing.`,
      "They built a different kind of firm: one where you talk to an attorney, not a call center; where fees are explained before work begins; and where every client can see the status of their case at any time through a secure online portal. Today the firm serves individuals, families and growing businesses across five focused practice areas.",
    ],
  },
  values: {
    heading: "Our Values",
    items: [
      {
        title: "Accessibility",
        body: "You can reach your attorney, get answers in plain language, and follow your case online at any hour.",
      },
      {
        title: "Honesty",
        body: "We tell you what we really think about your case, including the risks, before you make any decision.",
      },
      {
        title: "Preparation",
        body: "We prepare every matter as if it will go to court, because that's what produces the best outcomes.",
      },
      {
        title: "Respect",
        body: "Every client is treated with patience and dignity, whatever their situation and whatever language they speak.",
      },
    ],
  },
  leadership: {
    heading: "Leadership",
    intro:
      "The firm is led by its two founding partners, who still handle cases every day.",
  },
  community: {
    heading: "In the Community",
    body: "Our attorneys volunteer at free legal clinics, take on pro bono matters for families who can't afford representation, and speak at schools and community centers about knowing your rights. We believe a law firm should make its community stronger, not just its clients' cases.",
  },
};
