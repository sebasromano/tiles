<!-- METADATA -->

```yaml
task: "Rename feature folder, endpoint, and imports (getPointsFromTable → getSpatialObjectsFromTable)"
status: done
priority: 20
dep: ["work/003-feat-wkt-wkb-geometry-support/001-tdd-failing-tests-multi-geometry.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Rename the vertical slice folder and all associated names:

**Folder:** `src/features/getPointsFromTable/` → `src/features/getSpatialObjectsFromTable/`

**Endpoint:** `/pois` → `/spatial-objects` in presentation and OpenAPI.

**Composition root:** Update `src/app.ts` imports to point to the new feature path.

**Imports:** Update all internal imports within the feature (relative paths stay the same, but barrel imports from `src/app.ts` and tests change).

At this stage, keep the internal types as-is (they'll be updated in subsequent tasks). The goal is a clean rename of the folder and route path so the project still builds and existing tests (adapted for the new path) pass.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Feature folder renamed to `src/features/getSpatialObjectsFromTable/`
- [x] Endpoint path changed from `/pois` to `/spatial-objects` in presentation layer
- [x] `src/app.ts` imports updated to new feature path
- [x] Project builds (`npm run build`) with no errors
- [x] Old `src/features/getPointsFromTable/` directory removed
