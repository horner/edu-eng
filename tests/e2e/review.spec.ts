import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

test("review all eight studios and capture both university themes", async ({
  page,
  request,
}) => {
  mkdirSync("test-results/review", { recursive: true });
  const response = await request.get("data/curriculum.json");
  const data = await response.json();
  const program = data.programs.find(
    (record: { id: string }) => record.id === "biomedical",
  );
  for (const term of program.semesters) {
    await page.goto(
      `./#/program/biomedical?institution=indiana-tech&view=browse&term=${term.number}`,
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      term.theme,
    );
    await page.getByRole("button", { name: /^Engineering studio:/ }).click();
    await page
      .getByRole("button", { name: "Decompose the problem", exact: true })
      .click();
    await expect(
      page.getByText(
        data.studios.find((studio: { id: string }) => studio.id === term.studio)
          .decomposition[0],
        { exact: true },
      ),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Investigate root causes", exact: true })
      .click();
    await expect(
      page.getByText(
        data.studios.find((studio: { id: string }) => studio.id === term.studio)
          .root_cause,
        { exact: true },
      ),
    ).toBeVisible();
    await page.getByRole("button", { name: "Assessment", exact: true }).click();
    await expect(page.locator(".studio-body .assessment-card")).toHaveCount(2);
    await page.getByRole("button", { name: /Individual capability/ }).click();
    await page
      .getByTestId("detail-panel")
      .getByRole("button", { name: "Demonstrate", exact: true })
      .click();
    await expect(
      page.getByTestId("detail-panel").getByText("Individual", { exact: true }),
    ).toBeVisible();
  }
  for (const institution of ["indiana-tech", "demo-university"]) {
    await page.goto(
      `./#/program/biomedical?institution=${institution}&view=browse`,
    );
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const theme of ["light", "dark"]) {
      if ((await page.locator("html").getAttribute("data-theme")) !== theme)
        await page
          .getByRole("button", { name: "Change color theme", exact: true })
          .click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await page.screenshot({ animations: "disabled", path: `test-results/review/${institution}-${theme}.png` });
      const contrast = await page.evaluate(() => {
        const luminance = (rgb: number[]) =>
          rgb
            .map((v) => {
              const c = v / 255;
              return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            })
            .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
        return [
          ".main-heading h1",
          ".main-heading > p",
          ".term-card h3",
          ".term-kicker > span:first-child",
          ".view-nav a[aria-current]",
          ".capability-button",
          ".semester-nav button",
        ].map((selector) => {
          const element = document.querySelector(selector)!;
          const foreground = getComputedStyle(element)
            .color.match(/[\d.]+/g)!
            .slice(0, 3)
            .map(Number);
          let parent: Element | null = element;
          let background: number[] = [];
          while (parent) {
            const color = getComputedStyle(parent).backgroundColor;
            if (color !== "transparent" && color !== "rgba(0, 0, 0, 0)") {
              background = color
                .match(/[\d.]+/g)!
                .slice(0, 3)
                .map(Number);
              break;
            }
            parent = parent.parentElement;
          }
          const a = luminance(foreground),
            b = luminance(background);
          return {
            selector,
            ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
          };
        });
      });
      for (const item of contrast)
        expect(
          item.ratio,
          `${institution}/${theme} ${item.selector}`,
        ).toBeGreaterThanOrEqual(4.5);
      await page.screenshot({
        animations: "disabled",
        path: `test-results/review/${institution}-${theme}.png`,
      });
    }
  }
  await page.goto(
    "./#/program/biomedical?institution=indiana-tech&view=graph&term=5",
  );
  await expect(page.getByTestId("graph-canvas")).toBeVisible();
  await expect(page.locator(".react-flow__node").first()).toHaveCSS(
    "visibility",
    "visible",
  );
  await expect(
    page.locator(".react-flow__node button").first(),
  ).toBeInViewport();
  await expect
    .poll(
      async () =>
        (await page.locator(".react-flow__node button").first().boundingBox())
          ?.width || 0,
    )
    .toBeGreaterThan(150);
  await page.screenshot({
    animations: "disabled",
    path: "test-results/review/competency-map.png",
  });
  await page.goto(
    "./#/program/biomedical?institution=indiana-tech&view=review",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: /EAC-SO5/ }).click();
  await expect(
    page.getByRole("heading", { name: "Learning progression", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    animations: "disabled",
    path: "test-results/review/abet-teamwork.png",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    "./#/program/biomedical?institution=indiana-tech&view=browse&term=5",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.screenshot({
    animations: "disabled",
    path: "test-results/review/mobile-semester.png",
  });
});
