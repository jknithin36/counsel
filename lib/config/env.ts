/*
 * Build-time flags. Every one has a default so the app builds and runs
 * with no environment variables at all.
 */

/**
 * Demo mode: browser-only data, demo sign-in shortcuts, the demo banner
 * and the dashboard role switch. On unless NEXT_PUBLIC_DEMO_MODE is
 * "false", because the bundled data layer is the browser demo. Turn it off
 * once lib/data/* is connected to a real backend.
 */
export const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
