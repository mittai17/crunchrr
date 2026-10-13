import { test, expect } from "@playwright/test";
const base = "http://localhost:4001/api/v1";
const headers = { "X-Crunchrr-Demo": "true" };
test("full sidebar and calendar views, filters, create and reschedule", async ({
  page,
  request,
}) => {
  const title = `E2E calendar ${Date.now()}`;
  let id: string | undefined;
  try {
    await page.goto("/demo/calendar");
    await expect(
      page.getByRole("heading", { name: /Calendar —/ }),
    ).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav.getByRole("link")).toHaveCount(22);
    for (const label of [
      "Tasks",
      "Reminders",
      "Health",
      "Medicines",
      "Goals",
      "Habits",
      "Wellbeing",
      "Shopping",
      "Online Orders",
      "Life Vault",
      "AI Assistant",
    ])
      await expect(
        nav.getByRole("link", { name: label, exact: true }),
      ).toHaveAttribute("href", /\/demo\//);
    await expect(page.locator(".planner-day-headers > button")).toHaveCount(7);
    await expect(
      page.locator(".planner-event.event-work").first(),
    ).toBeVisible();
    await page.getByLabel("Work", { exact: true }).uncheck();
    await expect(page.locator(".planner-event.event-work")).toHaveCount(0);
    await page.getByLabel("Work", { exact: true }).check();
    await page.getByRole("button", { name: "Month", exact: true }).click();
    await expect(page.locator(".calendar-cell")).toHaveCount(35);
    await page.getByRole("button", { name: "Day", exact: true }).click();
    await expect(page.locator(".planner-day-headers > button")).toHaveCount(1);
    await page.getByRole("button", { name: "Agenda", exact: true }).click();
    await expect(page.locator(".agenda-events button").first()).toBeVisible();
    await page.getByRole("button", { name: "Week", exact: true }).click();
    await page
      .getByRole("button", { name: /^Add event on Monday, .* at 3 PM$/ })
      .click();
    await page.getByLabel("Title", { exact: true }).fill(title);
    await page
      .getByRole("button", { name: "Create record", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const response = await request.get(
      `${base}/entities?kind=event&q=${encodeURIComponent(title)}`,
      { headers },
    );
    const entity = (await response.json()).items.find(
      (e: { title: string }) => e.title === title,
    );
    expect(entity).toBeTruthy();
    id = entity.id;
    expect(new Date(entity.data.start).getHours()).toBe(15);
    const block = page.locator(".planner-event").filter({ hasText: title });
    await block.click();
    await expect(
      page.getByRole("dialog", { name: `${title} event details` }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Save to favorites", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Saved to favorites", exact: true }),
    ).toBeVisible();
    await page.locator(".planner-favorites summary").click();
    await expect(
      page
        .locator(".planner-favorites")
        .getByRole("button", { name: title, exact: true }),
    ).toBeVisible();
    await page
      .locator(".planner-favorites")
      .getByRole("button", { name: title, exact: true })
      .click();
    await page
      .getByRole("button", { name: "Saved to favorites", exact: true })
      .click();
    await expect(
      page
        .locator(".planner-favorites")
        .getByRole("button", { name: title, exact: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Close event preview" }).click();
    const transfer = await page.evaluateHandle(() => new DataTransfer());
    await block.dispatchEvent("dragstart", { dataTransfer: transfer });
    await page
      .getByRole("button", { name: /^Add event on Monday, .* at 4 PM$/ })
      .dispatchEvent("drop", { dataTransfer: transfer });
    await expect
      .poll(async () => {
        const result = await request.get(`${base}/entities/${id}`, { headers });
        return new Date((await result.json()).data.start).getHours();
      })
      .toBe(16);
    await page.reload();
    await block.click();
    await expect(
      page
        .getByRole("dialog", { name: `${title} event details` })
        .getByText("4:00 PM – 5:00 PM", { exact: true }),
    ).toBeVisible();
  } finally {
    if (id) await request.delete(`${base}/entities/${id}`, { headers });
    else {
      const result = await request.get(
        `${base}/entities?q=${encodeURIComponent(title)}`,
        { headers },
      );
      for (const record of (await result.json()).items)
        if (record.title === title)
          await request.delete(`${base}/entities/${record.id}`, { headers });
    }
  }
});

test("phone calendar filters and single-day alternative fit the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/calendar");
  await expect(page.getByRole("heading", { name: /Calendar —/ })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Calendars & filters" }).click();
  await expect(
    page.getByRole("complementary", { name: "Calendar filters" }),
  ).toBeVisible();
  await page.getByLabel("Events", { exact: true }).uncheck();
  await expect(page.locator(".planner-event")).toHaveCount(0);
  await page.getByLabel("Events", { exact: true }).check();
  await page.getByRole("button", { name: "Calendars & filters" }).click();
  await page.getByRole("button", { name: "Day", exact: true }).click();
  await expect(page.locator(".planner-day-headers > button")).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Add event", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
});
