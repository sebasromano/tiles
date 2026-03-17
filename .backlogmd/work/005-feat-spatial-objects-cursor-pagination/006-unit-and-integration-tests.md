<!-- METADATA -->

```yaml
task: Unit and integration tests for bounds and limit
status: done
priority: 60
dep: ["work/005-feat-spatial-objects-cursor-pagination/004-infrastructure-bigquery-spatial-cursor.md", "work/005-feat-spatial-objects-cursor-pagination/005-presentation-route-bounds-cursor.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Add unit tests for validation (bounds required and valid, min < max, limit in range, latColumn/lngColumn); unit tests for use case (passes bounds, limit, latColumn, lngColumn to repo; returns spatialObjects). Add integration test(s) for GET /spatial-objects with bounds that assert 200 and valid GeoJSON FeatureCollection.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Unit tests for bounds/limit/latColumn/lngColumn validation (valid and invalid cases).
- [x] Unit tests for use case with mocked repo (passes bounds, limit, latColumn, lngColumn; returns spatialObjects).
- [x] Integration test: request with bounds returns 200 and valid GeoJSON FeatureCollection.
