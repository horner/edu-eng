import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { argument, json, write } from "./lib/io.ts";
import { contentChanges, graphView, loadCatalog } from "./lib/model.ts";
try {
  const root = argument("--root", process.cwd())!;
  const data = loadCatalog(root);
  if (process.argv.includes("build")) {
    const priorPath = join(root, "generated/curriculum.json");
    const before = existsSync(priorPath)
      ? JSON.parse(readFileSync(priorPath, "utf8"))
      : undefined;
    const changes = contentChanges(before, data);
    write(join(root, "generated/content-change-summary.json"), json(changes));
    write(
      join(root, "generated/content-change-summary.md"),
      `# Content changes\n\n${changes.length} added/updated/removed records since the previous local build.\n\n${changes
        .slice(0, 80)
        .map((row) => `- ${row.change}: ${row.kind}/${row.id}`)
        .join("\n")}\n`,
    );
    write(priorPath, json(data));
    write(join(root, "public/data/curriculum.json"), json(data));
    write(join(root, "generated/roadmap-view.json"), json(graphView(data)));
    write(
      join(root, "generated/validation.json"),
      json({ issues: data.validation, ledgers: data.ledgers }),
    );
  }
  console.log(
    `${data.chapters.length} chapters; ${data.programs.length} programs; ${data.resources.length} resources; ${data.validation.filter((i) => i.severity === "warning").length} visible review gaps. Revision ${data.revision.slice(0, 12)}.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
