/** Copy for the client portal. Written for clients, not staff. */

export const portalShell = {
  brand: "Counsel",
  skipToContent: "Skip to content",
  navLabel: "Your case",
  accountLabel: "Account",
  matterLabel: "Your matter",
  breadcrumbRoot: "Portal",
  profile: "Profile",
  help: "Help",
  publicSite: "Firm website",
  signOut: "Sign out",
  loadError: "The portal couldn't load. Refresh the page to try again.",
  loading: "Loading your portal",
};

export const portalOverview = {
  title: (firstName: string) => `Hello, ${firstName}`,
  subtitle: (matter: string) => `Here's where ${matter} stands today.`,
  message: "Message your team",
  todo: {
    title: "To do",
    description: "Things your legal team is waiting on.",
    empty: "You're all caught up. We'll let you know when we need something.",
    sign: (n: number) => (n === 1 ? "Sign 1 document" : `Sign ${n} documents`),
    upload: (n: number) =>
      n === 1
        ? "Upload 1 requested document"
        : `Upload ${n} requested documents`,
    form: (n: number) =>
      n === 1 ? "Finish 1 questionnaire" : `Finish ${n} questionnaires`,
    pay: (amount: string) => `Pay ${amount} balance`,
  },
  stats: {
    stage: "Current stage",
    stageDetail: (n: number, total: number) => `Step ${n} of ${total}`,
    appointment: "Next appointment",
    noAppointment: "None scheduled",
    balance: "Balance due",
    balanceClear: "Nothing due",
    balanceDetail: (date: string) => `Due ${date}`,
  },
  progress: {
    title: "Case progress",
    description: "Every case moves at its own pace. We'll explain each step.",
    viewCase: "View case details",
  },
  updates: {
    title: "Latest updates",
    description: "Notes your legal team has shared with you.",
    empty: "No updates yet. Your team will post here as the case moves.",
    all: "See all updates",
  },
  latestMessage: {
    title: "Latest message",
    empty: "No messages yet.",
    open: "Open messages",
  },
  team: {
    title: "Your legal team",
    message: (name: string) => `Message ${name}`,
  },
};

/** Plain-language descriptions of each matter stage, by stage key. */
export const stageExplanations: Record<string, string> = {
  intake:
    "We open your file, confirm the facts and collect the first documents.",
  investigation:
    "We gather records, photos, bills and other evidence about what happened.",
  demand:
    "We send the insurer a summary of your injuries and losses, with what we're asking for.",
  negotiation:
    "We discuss a settlement. We'll share every offer with you before anything is decided.",
  litigation:
    "If a fair agreement isn't possible, the case moves to court and formal evidence exchange.",
  resolution:
    "We finalize the agreement, payments and closing paperwork with you.",
  filing: "We prepare and file the papers that start your case with the court.",
  discovery: "Both sides exchange information and documents.",
  mediation: "A neutral mediator helps both sides try to reach an agreement.",
  hearing: "The judge hears the case and makes decisions on open issues.",
  final_order: "The court issues its final order and we explain what it means.",
  drafting: "We prepare your documents based on what you've told us.",
  client_review: "You review the drafts and tell us what to change.",
  signing: "We meet to sign the documents with the required witnesses.",
  funding: "We help move assets into your trust so it works as planned.",
  complete: "Your plan is in place. Keep copies somewhere safe.",
  review: "We review the documents and terms you've shared with us.",
  execution: "Everyone signs and the agreement takes effect.",
  closed: "The matter is complete and your file is closed.",
  arraignment:
    "Your first court appearance, where charges are read and a plea entered.",
  pretrial:
    "We ask the court to rule on evidence and other issues before trial.",
  trial: "The case is presented to a judge or jury.",
};

export const casePage = {
  title: "My case",
  meta: (id: string, area: string, opened: string) =>
    `${id} · ${area} · Opened ${opened}`,
  progress: {
    title: "Progress",
    description: "Each step takes a different amount of time.",
    step: (n: number) => `Step ${n}`,
    current: "Current",
    done: "Done",
  },
  timeline: {
    title: "Updates",
    description:
      "Everything your legal team has shared with you, newest first.",
    empty: "No updates have been shared yet.",
    by: (name: string) => `From ${name}`,
  },
  next: {
    title: "What happens next",
    finishing: "Wrapping up",
    finishingBody:
      "We'll confirm every final document and payment is complete.",
  },
  details: {
    title: "Details",
    type: "Case type",
    attorney: "Lead attorney",
    fee: "Fee arrangement",
    stage: "Current stage",
    deadline: "Important date",
  },
  feeTypes: {
    contingency:
      "Contingency. You pay no attorney fee unless we recover money for you.",
    hourly: "Hourly. You're billed for time spent on your case.",
    flat: "Flat fee, agreed at the start.",
  },
  notFound: "We couldn't find your case. Contact your legal team.",
};

export const documentsPage = {
  title: "Documents",
  subtitle:
    "Upload what your team asks for, sign documents and find everything shared on your case.",
  upload: "Upload document",
  requested: {
    title: "Requested from you",
    description: "Files your legal team needs.",
    empty: "Nothing requested right now.",
    due: (date: string) => `Due ${date}`,
    action: "Upload",
  },
  signature: {
    title: "Waiting for your signature",
    description: "Read each document before you sign.",
    empty: "Nothing to sign right now.",
    sent: (date: string) => `Sent ${date}`,
    action: "Review and sign",
  },
  all: {
    title: "All documents",
    columns: { name: "Document", from: "From", date: "Date", status: "Status" },
    fromYou: "You",
    fromFirm: "Your legal team",
    empty: "No documents yet.",
    download: (name: string) => `Download ${name}`,
    downloadDemo: "Downloads aren't available in the demo",
  },
  statuses: {
    requested: "Needed",
    uploaded: "Uploaded",
    reviewed: "Reviewed",
    sent_for_signature: "Needs signature",
    signed: "Signed",
  },
};

export const uploadDialog = {
  title: "Upload a document",
  description:
    "Choose a file from your device. The demo keeps only its name and size.",
  type: "What is it?",
  types: [
    { value: "medical", label: "Medical record or bill" },
    { value: "police", label: "Police or accident report" },
    { value: "correspondence", label: "Letter or email" },
    { value: "id", label: "ID or insurance card" },
    { value: "other", label: "Something else" },
  ],
  choose: "Choose a file",
  replace: "Choose a different file",
  accepted: "PDF, image, Word or spreadsheet",
  comment: "Note for your team (optional)",
  commentPlaceholder: "Anything we should know about this file",
  cancel: "Cancel",
  submit: "Upload",
  done: "Document uploaded",
  doneDetail: "Your legal team has been notified.",
};

export const signPage = {
  back: "Documents",
  intro: "Read the whole document before signing.",
  demoLabel: "Sample document",
  panel: {
    title: "Sign",
    name: "Full legal name",
    type: "Type",
    draw: "Draw",
    placeholder: "Your signature",
    drawLabel: "Signature pad. Draw with your mouse or finger.",
    clear: "Clear",
    date: "Date",
    consent: "I agree to sign this document electronically.",
    submit: "Sign and submit",
  },
  done: {
    title: "Document signed",
    detail: (date: string) => `Signed ${date}. A copy is in your documents.`,
    back: "Back to documents",
  },
  notFound: "This document isn't available.",
  /** Fictional wording used for every document in the signing demo. */
  sample: {
    body: (name: string, doc: string, matter: string, firm: string) => [
      `I, ${name}, have read this ${doc.toLowerCase()} and had the chance to ask ${firm} about anything I didn't understand.`,
      `I authorize ${firm} to act on it on my behalf in ${matter}, and only for that matter.`,
      "I can withdraw this authorization in writing at any time, except where someone has already acted on it.",
      "This is sample wording for the demo. It is not a real document and has no legal effect.",
    ],
    footer: (name: string, matterId: string) =>
      `Client: ${name} · Matter: ${matterId}`,
  },
};

export const messagesPage = {
  title: "Messages",
  subtitle:
    "A private conversation with your legal team. We reply within one business day.",
  you: "You",
  empty: "No messages yet. Write below to start the conversation.",
  placeholder: "Write a message",
  attach: "Attach a file",
  removeAttachment: (name: string) => `Remove ${name}`,
  send: "Send",
  sent: "Message sent",
  reply: (name: string) => `New message from ${name}`,
  attachmentOnly: "Sent a file.",
  hint: "Enter to send · Shift + Enter for a new line",
};

export const appointmentsPage = {
  title: "Appointments",
  subtitle: "Meetings and calls with your legal team.",
  request: "Request an appointment",
  tabs: { upcoming: "Upcoming", past: "Past" },
  emptyUpcoming: "No upcoming appointments.",
  emptyPast: "No past appointments.",
  with: (name: string) => `With ${name}`,
  types: { video: "Video call", phone: "Phone call", in_person: "In person" },
  join: "Join video call",
  joinHint: "The link opens 15 minutes before the call",
  phone: "We'll call you at the number on your profile.",
  calendar: "Add to calendar",
  reschedule: "Ask to reschedule",
  dialog: {
    title: "Request an appointment",
    rescheduleTitle: "Ask to reschedule",
    description:
      "This sends a message to your team. They'll confirm a time with you.",
    topic: "What would you like to discuss?",
    reason: "Why do you need a new time?",
    type: "How would you like to meet?",
    times: "When works for you?",
    timeOptions: ["Weekday mornings", "Weekday afternoons", "After 5 PM"],
    anyTime: "Any time",
    cancel: "Cancel",
    submit: "Send request",
    done: "Request sent",
    doneDetail: "Your team will confirm a time.",
  },
};

export const billingPage = {
  title: "Billing",
  subtitle: "Invoices and payments for your case.",
  stats: {
    due: "Balance due",
    nextDue: (date: string) => `Next payment due ${date}`,
    clear: "You don't owe anything right now.",
    paid: "Paid to date",
    paidDetail: (n: number) => (n === 1 ? "1 payment" : `${n} payments`),
    trust: "Held in trust",
    trustDetail: "Funds held for your case expenses",
  },
  feeNote: {
    contingency:
      "Your attorney fee comes from any recovery. Case expenses, like filing fees and records, may be billed along the way.",
    hourly: "You're billed monthly for time spent on your case.",
    flat: "Your flat fee covers the agreed work. Extra costs are billed separately.",
  },
  invoices: {
    title: "Invoices",
    columns: {
      number: "Invoice",
      issued: "Issued",
      due: "Due",
      amount: "Amount",
      balance: "Balance",
      status: "Status",
    },
    view: "View",
    pay: "Pay",
    empty: "No invoices yet.",
  },
  statuses: {
    draft: "Draft",
    sent: "Due",
    partially_paid: "Partly paid",
    paid: "Paid",
    overdue: "Overdue",
    void: "Void",
  },
  history: {
    title: "Payments",
    columns: {
      date: "Date",
      invoice: "Invoice",
      method: "Method",
      amount: "Amount",
    },
    empty: "No payments yet.",
  },
  sheet: {
    issued: (date: string) => `Issued ${date}`,
    due: (date: string) => `Due ${date}`,
    billedTo: "Billed to",
    item: "Description",
    amount: "Amount",
    subtotal: "Subtotal",
    tax: (rate: number) => `Tax (${rate}%)`,
    total: "Total",
    paid: "Paid",
    balance: "Balance due",
    print: "Print",
  },
  pay: {
    title: (amount: string) => `Pay ${amount}`,
    description: "Demo payment. No card is charged. Try 4242 4242 4242 4242.",
    name: "Name on card",
    card: "Card number",
    expiry: "Expiry",
    cvc: "CVC",
    errors: {
      name: "Enter the name on the card",
      card: "Enter a 16-digit card number",
      expiry: "Use MM/YY",
      cvc: "Enter 3 or 4 digits",
    },
    cancel: "Cancel",
    submit: (amount: string) => `Pay ${amount}`,
    processing: "Processing…",
    successTitle: "Payment received",
    successBody: (amount: string, invoice: string) =>
      `${amount} paid on ${invoice}. No real charge was made.`,
    print: "Print receipt",
    done: "Done",
    toast: "Payment complete",
  },
};

export const formsPage = {
  title: "Forms",
  subtitle: "Questionnaires your legal team has asked you to fill in.",
  columns: { name: "Form", updated: "Last updated", status: "Status" },
  statuses: {
    not_started: "Not started",
    in_progress: "In progress",
    submitted: "Submitted",
  },
  actions: { not_started: "Start", in_progress: "Continue", submitted: "View" },
  updated: (date: string) => `Updated ${date}`,
  empty: "No forms waiting for you.",
};

export const formDetail = {
  back: "Forms",
  autosave: "Your answers save as you type. You can come back any time.",
  submittedOn: (date: string) => `Submitted ${date}`,
  notFound: "This form isn't available.",
  steps: ["Medical providers", "Insurance and pharmacy", "Review"],
  stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
  provider: (n: number) => `Provider ${n}`,
  fields: {
    name: "Provider or clinic",
    specialty: "Specialty",
    specialtyPlaceholder: "e.g. Physical therapy",
    phone: "Phone",
    firstVisit: "First visit",
    stillTreating: "I'm still being treated here",
    insurance: "Health insurance",
    insurancePlaceholder: "Company and member number",
    pharmacy: "Pharmacy",
    pharmacyPlaceholder: "Name and location",
    consent:
      "These answers are complete and accurate to the best of my knowledge.",
  },
  errors: {
    name: "Enter the provider's name",
    specialty: "Enter a specialty",
    phone: "Enter a phone number",
    firstVisit: "Enter the date of your first visit",
    providers: "Add at least one provider",
    insurance: "Enter your insurance",
    pharmacy: "Enter your pharmacy",
    consent: "Confirm your answers before submitting",
  },
  addProvider: "Add another provider",
  removeProvider: (n: number) => `Remove provider ${n}`,
  review: {
    title: "Check your answers",
    providers: "Providers",
    insurance: "Insurance",
    pharmacy: "Pharmacy",
    none: "Not provided",
    still: "Still treating",
  },
  back2: "Back",
  next: "Continue",
  submit: "Submit form",
  submitted: "Form submitted",
  submittedDetail: "Your legal team can review it now.",
  answers: "Your answers",
};

export const profilePage = {
  title: "Profile",
  subtitle: "Your contact details and how we keep in touch.",
  contact: {
    title: "Contact details",
    description: "Your legal team sees changes right away.",
    name: "Name",
    nameHint: "To change your name, message your legal team.",
    email: "Email",
    phone: "Phone",
    address: "Mailing address",
    preferred: "Best way to reach you",
    preferredOptions: [
      { value: "email", label: "Email" },
      { value: "phone", label: "Phone call" },
      { value: "text", label: "Text message" },
    ],
    language: "Language",
    languages: [
      { value: "English", label: "English" },
      { value: "Spanish", label: "Español" },
    ],
    invalidEmail: "Enter a valid email",
  },
  notifications: {
    title: "Notifications",
    description: "When something on your case needs you.",
    email: "Email me about updates",
    text: "Text me about updates",
  },
  password: {
    title: "Password",
    description: "Password changes are turned off in the demo.",
    action: "Change password",
    disabled: "Password changes are disabled in the demo",
  },
  save: "Save changes",
  saved: "Profile saved",
};
