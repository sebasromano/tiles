<!-- METADATA -->

```yaml
task: Write failing tests for BigQuery job pagination
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Write failing tests that define the BigQuery job pagination contract before any implementation. Tests should cover the use case, validation, and route handler layers. Use mocked repository implementations.

Test scenarios:
- First request (no cursor): returns first page of features + a non-null `nextCursor`
- Subsequent request (with cursor): returns next page + `nextCursor`
- Last page (no next page token from BigQuery): returns final features + `nextCursor: null`
- `pageSize` validation: rejects invalid values (negative, zero, non-integer, above max)
- `pageSize` defaults when not provided
- `cursor` validation: rejects malformed cursor strings (not valid base64url, invalid JSON, missing `jobId`/`pageToken`/`location`/`projectId`, invalid `pageSize`)
- Response shape: `{ data: { type: "FeatureCollection", features: [...] }, nextCursor: string | null }`
- `tableFqn` is required for the first request
- Follow-up requests work with `cursor` alone
- Query-defining params are rejected or ignored consistently when `cursor` is provided

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Tests exist for first page, middle page, and last page scenarios
- [x] Tests exist for `pageSize` validation (bounds, type, default)
- [x] Tests exist for `cursor` validation (format and payload fields)
- [x] Tests exist for the response shape `{ data, nextCursor }`
- [x] Tests verify `tableFqn` is required even when cursor is provided
- [x] All new tests fail (no implementation yet)
- [x] Existing tests still pass
