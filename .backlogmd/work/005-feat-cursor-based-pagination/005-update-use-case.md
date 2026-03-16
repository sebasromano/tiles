<!-- METADATA -->

```yaml
task: Update GetSpatialObjects use case for pagination
status: done
priority: 50
dep: ["work/005-feat-cursor-based-pagination/003-add-pagination-validation.md", "work/005-feat-cursor-based-pagination/004-implement-paginated-repository.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Update `GetSpatialObjects.execute()` to pass the validated initial-query or follow-up cursor request to the repository, and return `{ spatialObjects, nextCursor }`.

Remove or replace the `GET_SPATIAL_OBJECTS_LIMIT` constant.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `execute()` passes the validated pagination request variant to repository
- [x] Initial requests and follow-up cursor requests both flow through the use case correctly
- [x] Result includes `nextCursor` from repository
- [x] `GET_SPATIAL_OBJECTS_LIMIT` removed or replaced
