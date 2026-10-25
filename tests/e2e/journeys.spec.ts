import { expect, test, type Page } from "@playwright/test";

async function openCapability(page: Page) {
  await page
    .getByTestId("term-1")
    .getByRole("button", { name: /Individual capability/ })
    .click();
  await expect(
    page.getByTestId("detail-panel").getByRole("heading", { level: 2 }),
  ).toBeVisible();
}

test("static exploration, shared selection, resources, and deep-link refresh", async ({
  page,
  baseURL,
}) => {
  const externalRequests: string[] = [];
  const writes: string[] = [];
  await page.route("**/*", (route) => {
    if (new URL(route.request().url()).origin !== new URL(baseURL!).origin) {
      externalRequests.push(route.request().url());
      return route.abort();
    }
    if (route.request().method() !== "GET")
      writes.push(route.request().method());
    return route.continue();
  });
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Build the engineer. Work backward.",
  );
  for (let term = 1; term <= 8; term++)
    await expect(page.getByTestId(`term-${term}`)).toBeVisible();
  await openCapability(page);
  const selectedTitle = await page
    .getByTestId("detail-panel")
    .getByRole("heading", { level: 2 })
    .textContent();
  const selectedURL = page.url();
  await expect(
    page
      .getByTestId("detail-panel")
      .getByRole("link", {
        name: /Engineering Design|Design|Homeostasis|Chemistry|Calculus/,
      })
      .first(),
  ).toBeVisible();
  await page.getByRole("link", { name: "Competency map", exact: true }).click();
  await expect(page.getByTestId("graph-canvas")).toBeVisible();
  await expect(
    page.getByTestId("detail-panel").getByRole("heading", { level: 2 }),
  ).toHaveText(selectedTitle!);
  await page.reload();
  await expect(
    page.getByTestId("detail-panel").getByRole("heading", { level: 2 }),
  ).toHaveText(selectedTitle!);
  await expect(page).toHaveURL(/view=graph/);
  await page
    .getByRole("button", { name: "Accessible ordered list", exact: true })
    .click();
  await expect(page.locator(".map-list")).toBeVisible();
  await page.goto(selectedURL);
  await page
    .getByTestId("detail-panel")
    .getByRole("button", { name: "My notes", exact: true })
    .click();
  await page
    .getByLabel("My notes", { exact: true })
    .fill("Measured uncertainty matters.");
  await page.reload();
  await page
    .getByTestId("detail-panel")
    .getByRole("button", { name: "My notes", exact: true })
    .click();
  await expect(page.getByLabel("My notes", { exact: true })).toHaveValue(
    "Measured uncertainty matters.",
  );
  expect(externalRequests).toEqual([]);
  expect(writes).toEqual([]);
});

test("progress backup, import validation, reset, and university isolation", async ({
  page,
}) => {
  await page.goto("./");
  await openCapability(page);
  await page
    .getByTestId("detail-panel")
    .getByRole("button", { name: "My notes", exact: true })
    .click();
  await page
    .getByLabel("My notes", { exact: true })
    .fill("Export and restore this note.");
  await page
    .getByRole("combobox", { name: "My activity", exact: true })
    .click();
  await page.getByRole("option", { name: "Practiced", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export progress", exact: true })
    .click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await expect(page.getByLabel("My notes", { exact: true })).toHaveValue("");
  await page.locator("input[type=file]").setInputFiles(path!);
  await expect(page.getByLabel("My notes", { exact: true })).toHaveValue(
    "Export and restore this note.",
  );
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from("{invalid"),
    });
  await expect(page.getByLabel("My notes", { exact: true })).toHaveValue(
    "Export and restore this note.",
  );
  await page
    .getByRole("combobox", { name: "University profile", exact: true })
    .click();
  await page
    .getByRole("option", { name: "Example University", exact: true })
    .click();
  await page
    .getByTestId("detail-panel")
    .getByRole("button", { name: "My notes", exact: true })
    .click();
  await expect(page.getByLabel("My notes", { exact: true })).toHaveValue("");
  await expect(page.getByText("Fictional demonstration profile")).toBeVisible();
  await page
    .getByRole("combobox", { name: "University profile", exact: true })
    .click();
  await page.getByRole("option", { name: "Indiana Tech", exact: true }).click();
  await page
    .getByTestId("detail-panel")
    .getByRole("button", { name: "My notes", exact: true })
    .click();
  await expect(page.getByLabel("My notes", { exact: true })).toHaveValue(
    "Export and restore this note.",
  );
});

test("storage denial keeps browsing and session notes usable", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Unavailable", "SecurityError");
      },
    }),
  );
  await page.goto("./");
  await expect(page.getByText(/Browser storage is unavailable/)).toBeVisible();
  await openCapability(page);
  await page
    .getByTestId("detail-panel")
    .getByRole("button", { name: "My notes", exact: true })
    .click();
  await page
    .getByLabel("My notes", { exact: true })
    .fill("Session-only notes still work.");
  await expect(page.getByLabel("My notes", { exact: true })).toHaveValue(
    "Session-only notes still work.",
  );
});

test("narrow screen and keyboard exploration, both profiles and themes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to curriculum", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await page
    .getByTestId("term-1")
    .getByRole("button", { name: "Semester 1", exact: true })
    .click();
  await expect(page.getByTestId("term-1")).toBeVisible();
  await page
    .getByTestId("term-1")
    .getByRole("button", { name: /Individual capability/ })
    .click();
  await expect(page.getByTestId("detail-panel")).toBeVisible();
  await page
    .getByRole("button", { name: "Change color theme", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("combobox", { name: "University profile", exact: true })
    .click();
  await page
    .getByRole("option", { name: "Example University", exact: true })
    .click();
  await expect(page.getByText("Fictional demonstration profile")).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1);
});

test("ABET mapping and resource discovery remain visibly proposals", async ({
  page,
}) => {
  await page.goto(
    "./#/program/biomedical?institution=indiana-tech&view=review",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Trace the outcome to the experience.",
  );
  await expect(
    page.getByText("122 proposed credits / 122 target", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("button", { name: /SO.?1|EAC.?3.?1|Outcome 1|EAC-3-1/ })
      .first(),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Learning resources", exact: true })
    .click();
  await page
    .getByRole("textbox", {
      name: "Search topics, capabilities, or resources",
      exact: true,
    })
    .fill("Fourier");
  await expect(
    page.getByRole("link", { name: /Fourier Transform/ }).first(),
  ).toBeVisible();
  await expect(page.getByText("Try it", { exact: true }).first()).toBeVisible();
});
