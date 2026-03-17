<!-- METADATA -->

```yaml
task: Infrastructure – BigQuery repository spatial filter (bounds + limit)
status: done
priority: 40
dep: ["work/005-feat-spatial-objects-cursor-pagination/003-application-use-case.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Implement the repository adapter that queries BigQuery with a spatial filter using **`ST_IntersectsBox`** (geography, lng1, lat1, lng2, lat2) for the viewport bounding box. Use geometry-derived stable ORDER BY (e.g. `ST_X(ST_Centroid(geoColumn))`, `ST_Y(ST_Centroid(geoColumn))`) so results are deterministic. No cursor. When bounds are provided, do not apply LIMIT in the repository (return all features in the viewport); when bounds are not provided (legacy path), use LIMIT.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Query filters by bounding box using BigQuery geography (ST_IntersectsBox).
- [x] Query uses stable ORDER BY (geometry-derived ST_Centroid); no LIMIT when bounds provided; no cursor.
- [x] Repository returns spatialObjects only (no nextCursor).
- [x] Works with existing tableFqn/geoColumn configuration; handles Point and other geometry types.
