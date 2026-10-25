export const appErrors = {
  global: {
    title: "Something went wrong",
    body: "Counsel couldn't load this page. Try again to continue.",
    retry: "Try again",
  },
  auth: {
    title: "Sign-in unavailable",
    body: "The sign-in page couldn't load. Try again or return to the website.",
    retry: "Try again",
    home: "Return home",
  },
  portal: {
    title: "Portal unavailable",
    body: "This portal page couldn't load. Try again or return to your case overview.",
    retry: "Try again",
    home: "Portal overview",
    notFoundTitle: "Portal page not found",
    notFoundBody: "The portal page you requested doesn't exist or has moved.",
  },
} as const;
