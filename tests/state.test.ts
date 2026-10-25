import { describe, expect, it } from "vitest";
import {
  parseBackup,
  parseEntries,
  readProgress,
  saveProgress,
  storageKey,
  type Backup,
  type StorageLike,
} from "../src/state";
import { copy } from "../src/i18n";

const original: Backup = {
  version: 1,
  institution: "indiana-tech",
  program: "biomedical",
  curriculum_revision: "a",
  entries: {
    "edu-first": { activity: "practiced", note: "Uncertainty matters." },
  },
};
const known = new Set(["edu-first", "edu-second"]);

describe("browser progress portability and integrity", () => {
  it("migrates persisted activity on refresh through explicit redirects", () => {
    const storage: StorageLike = {
      getItem: () => JSON.stringify({ version: 1, entries: original.entries }),
      setItem: () => {},
      removeItem: () => {},
    };
    const loaded = readProgress(storage, "indiana-tech", "biomedical", {
      "edu-first": "edu-second",
    });
    expect(loaded.entries["edu-second"]).toEqual(original.entries["edu-first"]);
    expect(loaded.warning).toBe("");
  });
  it("restores known activity and notes without treating activity as assessed mastery", () => {
    const result = parseBackup(
      JSON.stringify(original),
      "indiana-tech",
      "biomedical",
      "a",
      known,
    );
    expect(result.entries["edu-first"]).toEqual(original.entries["edu-first"]);
    expect(result.unknown).toEqual([]);
    expect(result.revisionChanged).toBe(false);
  });
  it("scopes progress by institution and program", () => {
    expect(storageKey("indiana-tech", "biomedical")).not.toBe(
      storageKey("demo-university", "biomedical"),
    );
    expect(() =>
      parseBackup(
        JSON.stringify(original),
        "demo-university",
        "biomedical",
        "a",
        known,
      ),
    ).toThrow(copy.importScopeError);
  });
  it("rejects malformed or incompatible backups before exposing partial entries", () => {
    for (const value of [
      null,
      [],
      {},
      { ...original, version: 2 },
      {
        ...original,
        entries: {
          ...original.entries,
          broken: { activity: "passed", note: "" },
        },
      },
      { ...original, entries: { bad: { activity: "studied", note: 42 } } },
    ]) {
      expect(() =>
        parseBackup(
          JSON.stringify(value),
          "indiana-tech",
          "biomedical",
          "a",
          known,
        ),
      ).toThrow();
    }
    expect(() =>
      parseEntries(
        JSON.parse('{"__proto__":{"activity":"studied","note":"bad"}}'),
      ),
    ).toThrow();
  });
  it("reports unresolved IDs and curriculum revisions while preserving valid entries", () => {
    const result = parseBackup(
      JSON.stringify({
        ...original,
        entries: {
          ...original.entries,
          removed: { activity: "", note: "old" },
        },
      }),
      "indiana-tech",
      "biomedical",
      "b",
      known,
    );
    expect(result.entries["edu-first"]).toEqual(original.entries["edu-first"]);
    expect(result.unknown).toEqual(["removed"]);
    expect(result.revisionChanged).toBe(true);
  });
  it("uses explicit redirects and refuses a collision that could lose notes", () => {
    const result = parseBackup(
      JSON.stringify(original),
      "indiana-tech",
      "biomedical",
      "a",
      new Set(["edu-second"]),
      { "edu-first": "edu-second" },
    );
    expect(result.entries["edu-second"].note).toBe("Uncertainty matters.");
    const collision = {
      ...original,
      entries: {
        ...original.entries,
        "edu-second": { activity: "", note: "new" },
      },
    };
    expect(() =>
      parseBackup(
        JSON.stringify(collision),
        "indiana-tech",
        "biomedical",
        "a",
        known,
        { "edu-first": "edu-second" },
      ),
    ).toThrow();
  });
  it("keeps corrupt stored data intact and returns a recoverable notice", () => {
    let writes = 0;
    const storage: StorageLike = {
      getItem: () => "{invalid",
      setItem: () => {
        writes++;
      },
      removeItem: () => {},
    };
    expect(readProgress(storage, "indiana-tech", "biomedical").warning).toBe(
      copy.corruptStorage,
    );
    expect(writes).toBe(0);
  });
  it("handles storage failure and round-trips a valid save", () => {
    const values = new Map<string, string>();
    const storage: StorageLike = {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => {
        values.set(key, value);
      },
      removeItem: (key) => {
        values.delete(key);
      },
    };
    expect(
      saveProgress(storage, "indiana-tech", "biomedical", original.entries),
    ).toBe(true);
    expect(
      readProgress(storage, "indiana-tech", "biomedical").entries["edu-first"],
    ).toEqual(original.entries["edu-first"]);
    expect(
      saveProgress(
        {
          ...storage,
          setItem: () => {
            throw new Error("quota");
          },
        },
        "indiana-tech",
        "biomedical",
        original.entries,
      ),
    ).toBe(false);
  });
});
