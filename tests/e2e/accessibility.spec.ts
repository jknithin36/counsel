import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/*
 * Automated WCAG 2.1 A/AA scan of key screens. Fails on serious or critical
 * violations. Automated checks catch roughly a third of issues; keyboard and
 * screen reader testing is still needed for changes to interactive UI.
 */

const publicPages = [
  "/",
  "/practice-areas/personal-injury",
  "/attorneys/eleanor-calloway",
  "/consultation",
  "/faq",
  "/contact",
  "/login",
];
const staffPages = [
  "/dashboard",
  "/dashboard/leads",
  "/dashboard/matters/M-2026-0142",
];
const clientPages = ["/portal", "/portal/documents", "/portal/billing"];

async function scan(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("h1").first()).toBeVisible();
  // Wait for lazily loaded parts (charts) so they're scanned too.
  await page.waitForLoadState("networkidle");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(
    serious.map(
      (v) => `${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes[0]?.target}`,
    ),
    `accessibility violations on ${path}`,
  ).toEqual([]);
}

async function signIn(page: Page, who: "Staff" | "Client") {
  await page.goto("/login");
  await page.getByRole("button", { name: new RegExp(`^${who}\\b`) }).click();
  await expect(page).toHaveURL(who === "Staff" ? /\/dashboard/ : /\/portal/);
}

test("public pages have no serious accessibility violations", async ({
  page,
}) => {
  for (const path of publicPages) await scan(page, path);
});

test("dashboard pages have no serious accessibility violations", async ({
  page,
}) => {
  await signIn(page, "Staff");
  for (const path of staffPages) await scan(page, path);
});

test("portal pages have no serious accessibility violations", async ({
  page,
}) => {
  await signIn(page, "Client");
  for (const path of clientPages) await scan(page, path);
});
