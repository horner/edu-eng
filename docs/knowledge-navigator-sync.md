# Pinned imports and safe updates

The website reads built curriculum JSON. All commands here are contributor tooling; visitors need no GitHub connection or account. Ordinary validation/build commands work offline after installing dependencies. Only explicit upstream import/update/export verification fetches source.

Source: `MohamedMuneerM/knowledge-navigator`, initially pinned to `c26f8337f42f6dd3bbe5e007263fa92399f1b96e`. Content is CC BY-SA 4.0; keep the attribution and license links in the checked-in lock record and derivatives.

## Files and authoring

- `data/upstream/knowledge-navigator/`: generated, committed baseline; edit through synchronization only.
- `data/overlays/`: local edits to upstream fields and independently owned extensions.
- `data/chapters/` and other local collections: locally owned records, including BME. A new imported chapter never joins a degree automatically.
- `generated/`: ignored previews, validation reports, and export artifacts.

Every local YAML file contains one record. IDs are stable and relationships reference IDs. Arrays preserve semantic order. Upstream prerequisite/related edges stay distinct. Generated node coordinates never enter YAML.

An overlay example:

```yaml
schema_version: 1
target_type: chapter
target_id: mt-intro-to-materials
overrides:
  summary: A locally revised explanation.
extensions:
  resources: [res-materials-introduction]
  review_status: draft
```

Missing override fields inherit. An override replaces its entire top-level field, including an array/object. `null` is an ordinary value only where allowed by the record schema. `remove_fields` explicitly deletes an optional field. IDs, discipline, ownership, and provenance cannot be overwritten; extension keys must not collide with upstream fields. Use one overlay per target record; duplicate layers are rejected so update behavior cannot depend on file ordering. A resource-only extension remains separate from upstream topic updates.

## Updating

1. Identify and review a full 40-character upstream SHA. Do not use moving branch names.
2. Run `pnpm sync:preview -- --ref <full-sha>`. It fetches into `.cache/`, writes `generated/sync-preview.json`, and leaves tracked inputs unchanged. Read changes, conflicts, and affected local records.
3. For each conflict create a resolution JSON/YAML file with the exact preview `binding` and a `resolutions` mapping. Edit conflicts use `choice: upstream` or `choice: local`; deletion conflicts use `choice: retain` or `choice: delete`. Example path: `chapters/mt-intro-to-materials.yaml/summary`. Resolve ID collisions by deliberately migrating the local ID and its references before previewing again.
4. Run `pnpm sync:apply -- --ref <full-sha> --resolutions <file>`. Omit the resolutions argument if there are no conflicts. This command requires the matching saved preview. Old/new revision, local-data hash, importer version, and schema version must still match.
5. Run `pnpm data:validate`, `pnpm test`, `pnpm data:build`, and inspect `git diff -- data`. Commit baseline, lock, and relevant overlay changes together.

Upstream B/new upstream U/local effective L merge rule: if U=B keep L; if L=B take U; if U=L keep the shared value; otherwise resolve explicitly. Ordered topic arrays are atomic in this version. Accepted upstream fields remove obsolete local overrides so the application exposes the accepted value. Local extensions survive independently.

Candidate validation runs in an ignored staging directory. Broken references, schema drift, stale reviews, or unresolved conflicts stop before replacing tracked data. Successful apply replaces the validated `data/` tree and keeps a rollback copy until replacement succeeds. If apply is rejected, fix the reported local issue or adapter deliberately, preview again, and retry; do not hand-edit the imported baseline. An upstream deletion referenced locally must be retained with source provenance or deliberately migrated/removed. A retained chapter keeps its ID so existing references remain valid.

## Reproducible conflict demonstration

Run `pnpm sync:demo`. Two tiny authored JSON revisions in `tests/fixtures/sync/` demonstrate preview, an intentionally refused unresolved conflict, bound resolution, accepted upstream text, and preserved local review metadata. They are synthetic fixtures, not real upstream commits. All demonstration writes stay in `.cache/`.

## Interchange

`pnpm export:kn` writes authored upstream-compatible JSON and `edu-eng-extensions.json` under `generated/knowledge-navigator-export/`. BME uses a local `biomedical` discipline and `edu-bme` chapter prefix. The sidecar preserves every unsupported field/record, including resources, assessment, term/credit rules, studios, and review/provenance metadata.

`pnpm export:verify` additionally runs the pinned upstream Python builder against a temporary export and checks reimported core fields plus reconstruction from the sidecar. This is authored-data compatibility; unmodified Knowledge Navigator does not display local extensions. `generated/roadmap-view.json` is our renderer contract (`edu-eng-roadmap-view`), not a native roadmap.sh format.

## Institution-specific academic selections

The default program is institution-independent. Identity and brand changes cannot alter its academic content. `resolveProgram(data, institutionId, programId)` returns a copy, leaving generic source records unchanged.

The only permitted academic override keys are `requirements`, `electives`, and `content_selections`. The first two replace a whole metadata field and require academic interpretation; the software does not certify that the revised requirement is satisfied. `content_selections` is a complete mapping of all eight semester IDs to ordered, distinct chapter-ID arrays. Partial maps and unknown IDs are rejected. Validation checks the resulting prerequisite schedule and rejects selected competencies whose required chapters have been orphaned. An explicit content change is therefore reviewable independently of a university name or logo change.
