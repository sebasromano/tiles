<!-- METADATA -->

```yaml
task: Application – types, ports, and validation for bounds and limit
status: done
priority: 20
dep: ["work/005-feat-spatial-objects-cursor-pagination/001-openapi-bounds-cursor-params.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Extend the get-spatial-objects application layer: add `Bounds` (or equivalent), `limit`, and **`latColumn`** / **`lngColumn`** (parametrized per table, with defaults) to input/command types; extend the repository port so `getPoints` accepts bounds, limit, and latColumn/lngColumn, and returns `{ spatialObjects }`. Add validation for bounds (required when using viewport, valid numbers, min < max for lng/lat), optional max area or max side length to avoid abuse, and validate latColumn/lngColumn as safe column identifiers (e.g. alphanumeric + underscore). Define a max limit (e.g. 1000) and validate limit within range.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Input/command types include bounds (minLng, minLat, maxLng, maxLat), limit, and latColumn/lngColumn (with defaults).
- [x] Repository port request includes bounds, limit, latColumn, lngColumn; port response is spatialObjects only (no nextCursor).
- [x] Validator rejects invalid bounds (missing, non-numeric, min >= max), limit out of range, and invalid latColumn/lngColumn (e.g. not safe identifier).
- [x] Validator accepts optional max bounding box area or side length and returns validation error when exceeded.
