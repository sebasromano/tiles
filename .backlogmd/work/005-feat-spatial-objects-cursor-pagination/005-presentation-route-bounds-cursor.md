<!-- METADATA -->

```yaml
task: Presentation – route parses bounds, limit, latColumn, lngColumn
status: done
priority: 50
dep: ["work/005-feat-spatial-objects-cursor-pagination/003-application-use-case.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Update the GET /spatial-objects route to parse query parameters `minLng`, `minLat`, `maxLng`, `maxLat`, `limit`, `latColumn`, and `lngColumn` from the request and pass them to the use case. Response is GeoJSON FeatureCollection only (no nextCursor). Return 400 when validation fails (e.g. missing or invalid bounds).

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Route reads minLng, minLat, maxLng, maxLat, limit, latColumn, lngColumn from query and passes to use case.
- [x] Response body is GeoJSON FeatureCollection only (no nextCursor).
- [x] Validation errors (invalid/missing bounds, etc.) return 400 with error body.
