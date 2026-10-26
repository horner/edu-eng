import { expect, test, type Page } from "@playwright/test";

const overviewURL =
  "./#/program/biomedical?institution=indiana-tech&view=graph";

type LearningRecord = { id: string; prerequisites: string[] };

function selection(page: Page) {
  return new URLSearchParams(new URL(page.url()).hash.split("?")[1] || "");
}

async function expectYearOverview(page: Page) {
  const roadmap = page.getByTestId("program-roadmap");
  await expect(roadmap).toBeVisible();
  await expect(roadmap.locator(".roadmap-year")).toHaveCount(4);
  await expect(
    roadmap.getByRole("button", { name: /^Explore Semester [1-8]$/ }),
  ).toHaveCount(8);
  await expect(page.getByTestId("graph-canvas")).toHaveCount(0);
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1);
}

async function expectDependencyNodes(
  page: Page,
  records: Map<string, LearningRecord>,
  selectedID: string,
  includeEarlierLayers: boolean,
) {
  const visible = new Set([selectedID]);
  function visit(id: string) {
    for (const prerequisite of records.get(id)?.prerequisites || []) {
      if (visible.has(prerequisite)) continue;
      visible.add(prerequisite);
      if (includeEarlierLayers) visit(prerequisite);
    }
  }
  visit(selectedID);
  const expectedNodes = [...visible].sort();
  await expect(page.getByTestId("graph-canvas")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".react-flow__node")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("data-id")).sort(),
        ),
    )
    .toEqual(expectedNodes);
  const expectedEdges = expectedNodes
    .flatMap((id) =>
      (records.get(id)?.prerequisites || [])
        .filter((prerequisite) => visible.has(prerequisite))
        .map((prerequisite) => `prerequisite:${prerequisite}:${id}`),
    )
    .sort();
  await expect
    .poll(() =>
      page
        .locator(".react-flow__edge")
        .evaluateAll((edges) =>
          edges.map((edge) => edge.getAttribute("data-id")).sort(),
        ),
    )
    .toEqual(expectedEdges);
}

test("roadmap preserves four-year context and progressively opens semester, capability, and dependencies", async ({
  page,
  request,
}) => {
  const response = await request.get("data/curriculum.json");
  expect(response.ok()).toBe(true);
  const data = (await response.json()) as {
    chapters: LearningRecord[];
    competencies: LearningRecord[];
  };
  const records = new Map(
    [...data.chapters, ...data.competencies].map((record) => [
      record.id,
      record,
    ]),
  );

  await page.goto(overviewURL);
  await expectYearOverview(page);
  await page.getByTestId("map-search").locator("summary").click();
  const search = page.getByRole("textbox", {
    name: "Search topics, capabilities, or resources",
    exact: true,
  });
  await search.fill("Fourier");
  await expectYearOverview(page);
  await search.fill("");
  await expect(search).toBeVisible();

  await page
    .getByRole("button", { name: "Explore Semester 5", exact: true })
    .click();
  const semester = page.getByTestId("semester-map");
  await expect(semester).toBeVisible();
  await expect(page).toHaveURL(/term=5/);
  await expect(
    semester.getByText(/Physiological analogue/).first(),
  ).toBeVisible();
  await expect(page.getByTestId("map-foundations")).toBeVisible();
  await expect(page.getByTestId("map-foundations")).not.toHaveAttribute(
    "open",
    "",
  );
  await expect(page.getByTestId("graph-canvas")).toHaveCount(0);

  await semester
    .getByRole("button", {
      name: "Validate a physiological transport or signal model",
      exact: true,
    })
    .click();
  const detailTitle = page
    .getByTestId("detail-panel")
    .getByRole("heading", { level: 2 });
  await expect(detailTitle).toHaveText(
    "Validate a physiological transport or signal model",
  );
  await expect(page.getByTestId("graph-canvas")).toHaveCount(0);
  const selectedID = selection(page).get("node")!;
  expect(selectedID).toBe("edu-bme-c05-technical");

  await page
    .getByRole("button", { name: "Explore dependencies", exact: true })
    .click();
  await expect(page).toHaveURL(/focus=1/);
  await expectDependencyNodes(page, records, selectedID, false);
  await expect
    .poll(
      async () =>
        (await page.locator(".react-flow__node button").first().boundingBox())
          ?.width || 0,
    )
    .toBeGreaterThan(150);
  await expect(
    page.getByRole("checkbox", {
      name: "Show related and concurrent links",
      exact: true,
    }),
  ).not.toBeChecked();

  await page.reload();
  await expectDependencyNodes(page, records, selectedID, false);
  await expect(detailTitle).toHaveText(
    "Validate a physiological transport or signal model",
  );
  expect(selection(page).get("term")).toBe("5");
  expect(selection(page).get("node")).toBe(selectedID);
  await page.goBack();
  await expect(semester).toBeVisible();
  await expect(page.getByTestId("graph-canvas")).toHaveCount(0);
  await expect(detailTitle).toHaveText(
    "Validate a physiological transport or signal model",
  );
  await page
    .getByRole("button", { name: "Explore dependencies", exact: true })
    .click();
  await expect(page.getByTestId("graph-canvas")).toBeVisible();
  const layers = page.getByRole("checkbox", {
    name: "Include earlier prerequisite layers",
    exact: true,
  });
  await layers.check();
  await expectDependencyNodes(page, records, selectedID, true);
  await layers.uncheck();
  await expectDependencyNodes(page, records, selectedID, false);
  await layers.check();
  await page
    .getByRole("button", { name: "Back to semester", exact: true })
    .click();
  await expect(semester).toBeVisible();
  await expect(page.getByTestId("graph-canvas")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Explore dependencies", exact: true })
    .click();
  await expect(layers).not.toBeChecked();
  await expectDependencyNodes(page, records, selectedID, false);
  await page
    .getByRole("button", { name: "Back to semester", exact: true })
    .click();
  const searchDisclosure = page.getByTestId("map-search");
  if ((await searchDisclosure.getAttribute("open")) === null)
    await searchDisclosure.locator("summary").click();
  await search.fill("Fourier");
  await page
    .getByRole("button", { name: "All four years", exact: true })
    .click();
  await expectYearOverview(page);
  await expect(
    page.getByRole("textbox", {
      name: "Search topics, capabilities, or resources",
      exact: true,
      includeHidden: true,
    }),
  ).toHaveValue("");
  expect(selection(page).get("term")).toBeNull();
  expect(selection(page).get("node")).toBeNull();
  expect(selection(page).get("focus")).not.toBe("1");
  await page.reload();
  await expectYearOverview(page);
});

test("phone roadmap supports keyboard progression without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(overviewURL);
  await expectYearOverview(page);
  await expectNoHorizontalOverflow(page);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to curriculum", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page
    .getByRole("button", { name: "Explore Semester 5", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("semester-map")).toBeVisible();
  await expect(
    page.getByTestId("semester-map").getByRole("heading", { level: 2 }),
  ).toBeFocused();
  await expectNoHorizontalOverflow(page);
  await page
    .getByTestId("semester-map")
    .getByRole("button", {
      name: "Validate a physiological transport or signal model",
      exact: true,
    })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("detail-panel")).toBeVisible();
  await expect(page.getByTestId("graph-canvas")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Close detail panel", exact: true })
    .click();
  const capability = page.getByTestId("semester-map").getByRole("button", {
    name: "Validate a physiological transport or signal model",
    exact: true,
  });
  await expect(capability).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("detail-panel")).toBeVisible();
  await page
    .getByRole("button", { name: "Explore dependencies", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("graph-canvas")).toBeVisible();
  await expect(page.locator(".map-dependency-title")).toBeFocused();
  await expectNoHorizontalOverflow(page);
  await page
    .getByRole("button", { name: "Back to semester", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("semester-map")).toBeVisible();
  await expect(
    page.getByTestId("semester-map").getByRole("heading", { level: 2 }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "All four years", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expectYearOverview(page);
  await expect(
    page.getByRole("button", { name: "Explore Semester 5", exact: true }),
  ).toBeFocused();
  await expectNoHorizontalOverflow(page);
});
