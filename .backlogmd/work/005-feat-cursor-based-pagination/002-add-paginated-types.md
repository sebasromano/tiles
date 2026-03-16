<!-- METADATA -->

```yaml
task: Add paginated types to ports and types
status: done
priority: 20
dep: ["work/005-feat-cursor-based-pagination/001-write-failing-tests.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Update types in `ports.ts` and `types.ts` for BigQuery job pagination:

- `CursorPayload`: define the opaque cursor payload (`jobId`, `pageToken`, `location`, `projectId`, `pageSize`)
- `GetSpatialObjectsRequest`: replace `limit` with a request shape that can represent either:
  - an initial query request (`tableFqn`, `geoColumn`, `pageSize`)
  - a follow-up page request (`cursor` payload)
- Repository return type: add `nextCursor: string | null` alongside `SpatialObject[]`
- `GetSpatialObjectsInput`: add optional `cursor?: string` and `pageSize?: string`
- `GetSpatialObjectsCommand`: add validated pagination fields for either the first request or the decoded cursor request
- `GetSpatialObjectsResult`: add `nextCursor: string | null`

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Cursor payload type exists for BigQuery job pagination metadata
- [x] `GetSpatialObjectsRequest` supports both initial query execution and follow-up page retrieval
- [x] Repository interface returns `{ spatialObjects, nextCursor }`
- [x] `GetSpatialObjectsInput` includes optional `cursor` and `pageSize`
- [x] `GetSpatialObjectsCommand` represents validated initial and follow-up request variants
- [x] `GetSpatialObjectsResult` includes `nextCursor: string | null`
- [x] Types compile without errors
