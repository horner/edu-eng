import { join } from "node:path";
import { argument } from "./lib/io.ts";
import {
  exportKnowledgeNavigator,
  verifyKnowledgeNavigatorExport,
} from "./lib/export-kn.ts";
try {
  const root = argument("--root", process.cwd())!,
    out = argument(
      "--out",
      join(root, "generated/knowledge-navigator-export"),
    )!;
  if (process.argv.includes("--verify")) {
    verifyKnowledgeNavigatorExport(root, out);
    console.log(
      `Pinned upstream builder and core + sidecar round-trip passed. ${out}`,
    );
  } else {
    const result = exportKnowledgeNavigator(root, out);
    console.log(
      `Exported ${result.chapters.length} chapters with extension sidecar: ${out}`,
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
