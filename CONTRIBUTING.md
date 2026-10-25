# Contributing to Counsel

Thanks for helping improve Counsel. Before opening a pull request, please open
an issue for substantial changes so the approach can be agreed first.

## Local workflow

1. Fork and clone the repository.
2. Run `pnpm install` and copy `.env.example` to `.env.local`.
3. Create a focused branch from `main`.
4. Run `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`,
   `pnpm build` and `pnpm test:e2e` before submitting. (Run
   `pnpm exec playwright install chromium` once first.)
5. Add or update tests for behavior changes and describe manual checks in the
   pull request.

## Conventions

- Copy lives in `lib/content/*` and configuration in `lib/config/*`, not in
  components.
- Components read data from the store and write only through the functions
  in `lib/data/*`, so the app stays backend-agnostic. See
  [docs/BACKEND.md](docs/BACKEND.md).
- Use the shared UI in `components/ui` and the dashboard building blocks
  (page header, section card, status badge) instead of one-off styles.
- Respect `prefers-reduced-motion`, label icon-only buttons, and check new
  screens at 375, 768 and 1440 px.

Keep changes small, accessible, and backend-agnostic. Do not add real client
data, credentials, law-firm claims, or jurisdiction-specific legal guidance.
By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
