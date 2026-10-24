import { demoClientUser, demoStaffUser } from "@/lib/data/seed/users";

export const auth = {
  metaTitle: "Sign In",
  title: "Welcome back",
  intro: "Sign in to your client portal or staff dashboard.",
  demoLabel: "Try the demo — sign in as",
  demo: {
    staff: {
      title: "Staff",
      subtitle: demoStaffUser.name,
    },
    client: {
      title: "Client",
      subtitle: demoClientUser.name,
    },
  },
  divider: "or sign in with email",
  fields: {
    email: "Email",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    remember: "Remember me",
    forgot: "Forgot password?",
  },
  submit: "Sign in",
  signingIn: "Signing in…",
  errors: {
    email: "Enter your email address.",
    password: "Enter your password.",
    invalid: "That email and password don't match. Try a demo account above.",
    corrupted: "Demo data looks corrupted. Refresh the page or reset the demo.",
  },
  resetDemo: "Reset demo",
  forgotToast: "Password reset isn't available in the demo.",
  footerNote: "Demo only. Data is stored in your browser.",
  panel: {
    message: "Know where your case stands, anytime.",
    cardLabel: "Preview of a case timeline in the client portal",
  },
  signOut: "Sign out",
  signedInAs: (name: string, title: string) =>
    `Signed in as ${name} (${title})`,
};
