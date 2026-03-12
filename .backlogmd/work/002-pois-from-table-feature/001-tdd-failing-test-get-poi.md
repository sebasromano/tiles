<!-- METADATA -->

```yaml
task: TDD – write failing acceptance test for GET /pois
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

**Test-first (TDD):** Add an **acceptance test** for the GET `/pois` endpoint (operationId `getPois` in **`docs/openapi.yaml`**) before implementing it. Acceptance tests for routes live in `src/__tests__/` (e.g. `poi.test.ts`); unit tests for slice code live in the same directory as the code (e.g. `application/validation.test.ts`). The test must assert behaviour defined by the OpenAPI spec: GET with required **`tableFqn`** returns 200 and a GeoJSON **FeatureCollection** (`type: "FeatureCollection"`, `features` array); missing/invalid `tableFqn` returns 400; optional **`geoColumn`** (default `"geom"`) may be tested. At this stage the endpoint is not implemented, so the test must **fail** (red phase). A later task implements the endpoint until this test passes (green phase).

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Acceptance test file exists for GET /pois (e.g. in `src/__tests__/poi.test.ts`)
- [x] Test covers required behaviour per OpenAPI (e.g. 400 when `tableFqn` missing; 200 with `tableFqn` returning GeoJSON FeatureCollection; 200 with empty features when no data; optional `geoColumn`)
- [x] Test fails when run (endpoint not implemented or does not meet spec yet)
