<!-- METADATA -->

```yaml
task: "TDD – write failing acceptance tests for multi-geometry /spatial-objects endpoint"
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

**Test-first (TDD, red phase).** Write acceptance tests for the renamed `GET /spatial-objects` endpoint before implementing the changes. Tests should cover the new multi-geometry behaviour and the renamed endpoint path.

Tests live in `src/__tests__/` (rename `poi.test.ts` → `spatial-objects.test.ts` or similar). At this stage the endpoint and rename are not implemented, so all new tests must **fail**.

**Test scenarios:**
- `GET /spatial-objects?tableFqn=...` returns 200 with GeoJSON FeatureCollection
- Response features can contain any geometry type (Point, LineString, Polygon, etc.)
- `GET /spatial-objects` without `tableFqn` returns 400
- `GET /pois` returns 404 (old endpoint removed)
- Optional `geoColumn` still works

Keep existing test patterns (mock repository injection via `buildApp`).

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Acceptance test file exists for `GET /spatial-objects` (e.g. `src/__tests__/spatial-objects.test.ts`)
- [x] Tests cover: 200 with FeatureCollection containing mixed geometry types, 400 on missing `tableFqn`, optional `geoColumn`
- [x] Test verifies old `/pois` endpoint returns 404
- [x] Tests fail when run (endpoint not implemented yet — red phase)
