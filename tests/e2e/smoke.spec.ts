import { expect, type Page, test } from "@playwright/test";

/*
 * Smoke tests for the browser demo. Each test starts in a fresh browser
 * context, so the seed data loads clean every time.
 */

const MATTER = "M-2026-0142";

async function signIn(page: Page, who: "Staff" | "Client") {
  await page.goto("/login");
  await page.getByRole("button", { name: new RegExp(`^${who}\\b`) }).click();
  await expect(page).toHaveURL(who === "Staff" ? /\/dashboard/ : /\/portal/);
  await expect(page.locator("main h1").first()).toBeVisible();
}

async function signOutTo(page: Page) {
  // Signing in again replaces the session; going back to /login is enough.
  await page.goto("/login");
}

test("home loads and navigation opens", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile" }),
    ).toBeVisible();
  } else {
    await page
      .getByRole("banner")
      .getByRole("button", { name: "Practice Areas" })
      .click();
    await expect(
      page.getByRole("link", { name: /View all practice areas/i }),
    ).toBeVisible();
  }
});

test("a consultation request becomes a lead staff can update", async ({
  page,
}) => {
  await page.goto("/consultation");
  await page
    .getByRole("radio", { name: /Personal Injury/ })
    .check({ force: true });
  await page.getByRole("button", { name: "Continue" }).click();

  await page
    .getByRole("textbox", { name: /What happened/ })
    .fill(
      "A fictional demo request used to verify the intake workflow end to end.",
    );
  await page
    .getByRole("radio", { name: "Just researching" })
    .check({ force: true });
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("textbox", { name: "First name" }).fill("Smoke");
  await page.getByRole("textbox", { name: "Last name" }).fill("Tester");
  await page.getByRole("textbox", { name: "Email" }).fill("smoke@example.com");
  await page
    .getByRole("textbox", { name: "Phone" })
    .pressSequentially("5555550148");
  await page.getByRole("radio", { name: "Email" }).check({ force: true });
  await page.getByRole("radio", { name: "English" }).check({ force: true });
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("radio", { name: "Phone" }).check({ force: true });
  await page
    .getByRole("checkbox", { name: "Weekday mornings" })
    .check({ force: true });
  await page
    .getByRole("combobox", { name: /How did you hear/ })
    .selectOption("google");
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByRole("checkbox", { name: /does not create an attorney/i })
    .check({ force: true });
  await page.getByRole("button", { name: /Request Consultation/i }).click();

  await expect(page).toHaveURL(/\/consultation\/thank-you/);
  const reference = page.getByText(/^CR-\d{4}$/);
  await expect(reference).toBeVisible();
  const ref = (await reference.innerText()).trim();

  await signIn(page, "Staff");
  await page.goto(`/dashboard/leads/${ref}`);
  await expect(
    page.getByRole("heading", { name: "Smoke Tester" }),
  ).toBeVisible();
  await page.getByRole("combobox", { name: "Lead status" }).click();
  await page.getByRole("option", { name: "Contacted" }).click();
  await expect(page.getByRole("combobox", { name: "Lead status" })).toHaveText(
    /Contacted/,
  );
});

test("staff sends a document for signature and the client signs it", async ({
  page,
}) => {
  await signIn(page, "Staff");
  await page.goto(`/dashboard/matters/${MATTER}?tab=documents`);
  const row = page
    .locator("main table tbody tr")
    .filter({ hasText: /Uploaded|Reviewed/ })
    .first();
  const name = (await row.locator("td").first().innerText())
    .split("\n")[0]
    .trim();
  await row.getByRole("button", { name: /Actions/ }).click();
  await page.getByRole("menuitem", { name: "Send for signature" }).click();
  await expect(page.getByText(`${name} sent for signature`)).toBeVisible();

  await signOutTo(page);
  await signIn(page, "Client");
  await page.goto("/portal/documents");
  await page
    .getByRole("listitem")
    .filter({ hasText: name })
    .getByRole("link", { name: "Review and sign" })
    .click();
  await page
    .getByRole("checkbox", { name: /sign this document electronically/ })
    .check({ force: true });
  await page.getByRole("button", { name: "Sign and submit" }).click();
  await expect(page.getByText("Document signed")).toBeVisible();

  await signOutTo(page);
  await signIn(page, "Staff");
  await page.goto(`/dashboard/matters/${MATTER}?tab=documents`);
  await expect(
    page.locator("main table tbody tr").filter({ hasText: name }),
  ).toContainText("Signed");
});

test("the client pays an invoice and staff billing shows it paid", async ({
  page,
}) => {
  await signIn(page, "Client");
  await page.goto("/portal/billing");
  const row = page
    .locator("main table tbody tr")
    .filter({ hasText: "Due" })
    .first();
  const invoice = (await row.locator("td").first().innerText()).trim();
  await row.getByRole("button", { name: "Pay", exact: true }).click();

  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Name on card" })
    .fill("Maria Delgado");
  await dialog
    .getByRole("textbox", { name: "Card number" })
    .fill("4242424242424242");
  await dialog.getByRole("textbox", { name: "Expiry" }).fill("1230");
  await dialog.getByRole("textbox", { name: "CVC" }).fill("123");
  await dialog.getByRole("button", { name: /^Pay \$/ }).click();
  await expect(dialog.getByText("Payment received")).toBeVisible();

  await signOutTo(page);
  await signIn(page, "Staff");
  await page.goto(`/dashboard/billing/invoices/${invoice}`);
  await expect(page.locator("main")).toContainText("Paid");
});
