export type FaqCategory = "general" | "fees" | "process" | "portal";

export type Faq = {
  question: string;
  answer: string;
  category?: FaqCategory;
  /** Shown in the home page FAQ section. */
  home?: boolean;
};

export const faqCategories: { key: FaqCategory; label: string }[] = [
  { key: "general", label: "General" },
  { key: "fees", label: "Fees" },
  { key: "process", label: "Process" },
  { key: "portal", label: "Client Portal" },
];

export const faqs: Faq[] = [
  {
    question: "Is the first consultation really free?",
    answer:
      "Yes. There's no cost and no obligation to talk with an attorney about your situation.",
    category: "fees",
    home: true,
  },
  {
    question: "How much does it cost to hire you?",
    answer:
      "Personal injury cases are handled on contingency, so you pay only if we win. Other matters are billed hourly or at a flat fee, which we explain upfront in writing.",
    category: "fees",
    home: true,
  },
  {
    question: "How long will my case take?",
    answer:
      "It depends on the type of case and the other side. At your consultation, we'll give you a realistic timeline and keep you updated as things change.",
    category: "process",
    home: true,
  },
  {
    question: "Do you offer virtual meetings?",
    answer:
      "Yes. Consultations and meetings are available by phone or video, as well as in person at our office.",
    category: "process",
    home: true,
  },
  {
    question: "Do you speak Spanish?",
    answer: "Yes. Several of our attorneys and staff are fluent in Spanish.",
    category: "general",
    home: true,
  },
  {
    question: "What should I bring to my consultation?",
    answer:
      "Any documents, photos, letters or notes related to your situation. Don't worry if you don't have everything. We'll tell you what we need.",
    category: "process",
    home: true,
  },
  {
    question: "Will I be able to track my case?",
    answer:
      "Yes. Every client gets access to our secure portal to see updates, share documents, sign forms and message their attorney.",
    category: "portal",
    home: true,
  },
  {
    question: "What if I can't afford an attorney?",
    answer:
      "Talk to us anyway. Many cases are taken on contingency, and we'll discuss payment options that work for you.",
    category: "fees",
    home: true,
  },
  {
    question: "What kinds of cases do you handle?",
    answer:
      "We focus on five areas: personal injury, family law, estate planning, business law and criminal defense. If your matter is outside those areas, we'll try to point you to someone who can help.",
    category: "general",
  },
  {
    question: "Will I work directly with an attorney?",
    answer:
      "Yes. Your attorney leads your case and is your main point of contact, supported by our paralegals and staff.",
    category: "general",
  },
  {
    question: "Does talking to you create an attorney–client relationship?",
    answer:
      "No. An attorney–client relationship begins only after we've agreed to take your case and you've signed an engagement agreement.",
    category: "general",
  },
  {
    question: "Are there costs besides attorney fees?",
    answer:
      "Some cases have expenses such as filing fees, records requests or expert reports. We explain how these are handled in your written agreement before any work begins.",
    category: "fees",
  },
  {
    question: "What happens after I submit a consultation request?",
    answer:
      "We review your request within one business day, check for conflicts, and an attorney contacts you to schedule your free consultation.",
    category: "process",
  },
  {
    question: "How do I log in to the client portal?",
    answer:
      "Once you become a client, you'll receive an email invitation. Follow the link to set your password, then sign in any time from the Client Login button.",
    category: "portal",
  },
  {
    question: "Is the portal secure?",
    answer:
      "Yes. The portal uses encrypted connections and individual logins, and only you and your legal team can see your case information.",
    category: "portal",
  },
  {
    question: "Can I use the portal on my phone?",
    answer:
      "Yes. The portal works in any modern browser on your phone, tablet or computer, including uploading photos of documents.",
    category: "portal",
  },
];

export const homeFaqs = faqs.filter((f) => f.home);
