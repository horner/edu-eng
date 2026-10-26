import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

test("chemistry and biology begin with curiosity, with review notes available separately", async ({
  page,
}) => {
  await page.goto(
    "./#/program/biomedical?institution=indiana-tech&view=browse&node=edu-bme-chemistry",
  );
  const panel = page.getByTestId("detail-panel");
  const starters = panel.getByTestId("curiosity-resources");
  await expect(
    starters.getByRole("heading", {
      name: "Start with curiosity",
      exact: true,
    }),
  ).toBeVisible();
  const shape = starters
    .getByTestId("spark-resource")
    .filter({
      has: page.getByRole("link", { name: /The Molecular Shape of You/ }),
    });
  await expect(
    shape.getByRole("link", { name: /The Molecular Shape of You/ }),
  ).toHaveAttribute("href", "https://www.youtube.com/watch?v=f8FAJXPBdOg");
  await expect(
    shape.getByText("Why this matters", { exact: true }),
  ).toBeVisible();
  await expect(
    shape.getByText("Play with the idea", { exact: true }),
  ).toBeVisible();
  await expect(
    shape.getByRole("link", { name: "Watch the video", exact: true }),
  ).toHaveAttribute("target", "_blank");
  await expect(
    shape.getByText("Accuracy review", { exact: true }),
  ).not.toBeVisible();
  await shape.locator("summary").click();
  await expect(
    shape.getByText("Accuracy review", { exact: true }),
  ).toBeVisible();
  await expect(
    shape.getByText("What was inspected", { exact: true }),
  ).toBeVisible();
  await expect(
    shape.getByText("Limits and remaining review", { exact: true }),
  ).toBeVisible();
  const order = await panel.evaluate((element) => {
    const hook = element.querySelector('[data-testid="curiosity-resources"]')!;
    const headings = [...element.querySelectorAll("h3")];
    const prerequisite = headings.find(
      (heading) => heading.textContent === "Prerequisite path",
    )!;
    return Boolean(
      hook.compareDocumentPosition(prerequisite) &
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
  expect(order).toBe(true);
  await expect(
    panel.getByRole("heading", { name: "Go deeper", exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByRole("link", { name: /Molecular Structure and Polarity/ }),
  ).toBeVisible();

  await page.goto(
    "./#/program/biomedical?institution=indiana-tech&view=browse&node=edu-bme-anatomy-physiology",
  );
  await expect(
    panel
      .getByTestId("curiosity-resources")
      .getByRole("link", { name: /Evo-Devo/ }),
  ).toHaveAttribute("href", "https://www.youtube.com/watch?v=ydqReeTV_vk");
  await expect(
    panel
      .getByTestId("curiosity-resources")
      .getByRole("link", { name: /Introduction to Cells/ }),
  ).toBeVisible();
});

test("resource discovery finds creators and retains fun introductions on a phone", async ({
  page,
}) => {
  await page.goto(
    "./#/program/biomedical?institution=indiana-tech&view=resources&q=Amoeba%20Sisters",
  );
  const starters = page.getByTestId("curiosity-library");
  await expect(starters).toBeVisible();
  await expect(starters.getByTestId("spark-resource")).toHaveCount(3);
  for (const video of ["1Dx7LDwINLU", "3jwAGWky98c", "8IlzKri08kk"])
    await expect(
      starters
        .locator('a[href="https://www.youtube.com/watch?v=' + video + '"]')
        .first(),
    ).toBeVisible();
  await page
    .getByRole("textbox", {
      name: "Search topics, capabilities, or resources",
      exact: true,
    })
    .fill("Molecular Shape of You");
  await expect(starters.getByTestId("spark-resource")).toHaveCount(1);
  mkdirSync("test-results/review", { recursive: true });
  await page.screenshot({
    animations: "disabled",
    path: "test-results/review/curiosity-resources.png",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    starters.getByRole("link", { name: "Watch the video", exact: true }),
  ).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1);
});
