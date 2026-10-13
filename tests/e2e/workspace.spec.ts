import { test, expect } from "@playwright/test";
test("persistent task CRUD, command search and Life Graph", async ({
  page,
}) => {
  const title = `E2E task ${Date.now()}`;
  await page.goto("/demo/dashboard");
  await expect(page.getByRole("heading", { name: /^Hi Thomas/ })).toBeVisible();
  await page.getByRole("button", { name: "Add tasks", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page
    .getByRole("button", { name: "Create record", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("Control+k");
  await page.getByRole("textbox", { name: "Search all records" }).fill(title);
  await page.getByRole("button").filter({ hasText: title }).click();
  await expect(
    page.getByRole("heading", { name: "Connected in your Life Graph" }),
  ).toBeVisible();
  await page.getByLabel("Search records to connect").fill("Personal website");
  await page
    .getByLabel("Record to link")
    .selectOption({ label: "Project · Personal website" });
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Unlink Personal website" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill(`${title} updated`);
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await page.keyboard.press("Control+k");
  await page
    .getByRole("textbox", { name: "Search all records" })
    .fill(`${title} updated`);
  await page
    .getByRole("button")
    .filter({ hasText: `${title} updated` })
    .click();
  await expect(
    page.getByRole("button", { name: "Unlink Personal website" }),
  ).toBeVisible();
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("mobile navigation, forms, and layout are usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/dashboard");
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("link", { name: "Notes", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Notes", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Quick add", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
});

test("reference analytics controls and persisted widget addition", async ({
  page,
  request,
}) => {
  const profileResponse = await request.get(
    "http://localhost:4001/api/v1/profile",
    { headers: { "X-Crunchrr-Demo": "true" } },
  );
  const original = await profileResponse.json();
  try {
    await page.goto("/demo/dashboard");
    await expect(
      page.getByRole("heading", { name: /^Hi Thomas/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: "minutes", exact: true }).click();
    await expect(page.getByText("240m", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Add dashboard widget", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Goals & progress", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Goals & progress", exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Goals & progress", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Remove Goals & progress widget",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", { name: "Goals & progress", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Open Design note", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Connected in your Life Graph",
        exact: true,
      }),
    ).toBeVisible();
  } finally {
    await request.put("http://localhost:4001/api/v1/profile", {
      headers: {
        "X-Crunchrr-Demo": "true",
        "Content-Type": "application/json",
      },
      data: original,
    });
  }
});
