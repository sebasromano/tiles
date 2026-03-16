<!-- METADATA -->

```yaml
task: Implement BigQuery job pagination in repository
status: done
priority: 40
dep: ["work/005-feat-cursor-based-pagination/002-add-paginated-types.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Update `BigQueryGetSpatialObjectsRepository` to use BigQuery query jobs and `getQueryResults(...)` pagination.

Implementation outline:
- Initial request:
  - Run `bigquery.createQueryJob({ query, location? })`
  - Use `job.getQueryResults({ maxResults: pageSize, autoPaginate: false })`
- Follow-up request:
  - Recreate the job via `bigquery.job(jobId, { location, projectId })`
  - Call `job.getQueryResults({ pageToken, maxResults: pageSize, autoPaginate: false })`
- Build `nextCursor` from the next page token returned by BigQuery. When there is no next page token, return `nextCursor = null`.
- Use a stable selected column alias (for example `SELECT \`${geoColumn}\` AS geom ...`) so row mapping works the same on every page.

Map rows through existing `mapRowToSpatialObject`.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Initial page uses `createQueryJob(...)` and `getQueryResults(...)`
- [x] Follow-up pages use an existing job reference plus `pageToken`
- [x] `nextCursor` is null when BigQuery returns no next page token
- [x] `nextCursor` encodes BigQuery pagination metadata as base64url JSON when more rows exist
- [x] Query aliases the selected geometry column to a stable name for mapping
- [x] Rows mapped through existing `mapRowToSpatialObject`
- [x] Errors wrapped in `neverthrow` Result types
