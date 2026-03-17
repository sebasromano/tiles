<!-- METADATA -->

```yaml
task: Application – use case executes with bounds and limit
status: done
priority: 30
dep: ["work/005-feat-spatial-objects-cursor-pagination/002-application-types-ports-validation.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Update the GetSpatialObjects use case to pass bounds, limit, and latColumn/lngColumn to the repository and to return the spatial objects. Keep existing behavior when bounds are not provided (if we support legacy "no bounds" path with a low cap) or require bounds and fail validation otherwise, per product decision in task 001/002. No cursor or nextCursor.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Use case calls repository with validated command including bounds, limit, latColumn, lngColumn.
- [x] Use case result type is spatialObjects only (no nextCursor).
- [x] Use case returns spatialObjects from repository.
