<!-- METADATA -->

```yaml
work: BigQuery job-based pagination for spatial objects
status: done
assignee: ""
```

<!-- DESCRIPTION -->

Add pagination to the `getSpatialObjectsFromTable` feature using BigQuery query jobs and result page tokens so clients can consume large result sets from heterogeneous tables without relying on a shared sort key. The first request starts a query job; subsequent requests page through that fixed job result set.

Query pattern for the first request:
```sql
SELECT `<geoColumn>` AS geom
FROM `project.dataset.table`
```

The cursor is an opaque base64url string encoding:
```json
{
  "jobId": "bquxjob_123",
  "pageToken": "next-page-token",
  "location": "us-central1",
  "projectId": "my-project",
  "pageSize": 5000
}
```

When BigQuery returns no next page token, the server returns `nextCursor: null` to signal the last page.

Response shape: `{ data: GeoJsonFeatureCollection, nextCursor: string | null }`.

Client usage:
```typescript
async function* getData() {
  let cursor: string | undefined;
  let firstRequest = true;
  while (firstRequest || cursor) {
    firstRequest = false;
    const params = cursor
      ? new URLSearchParams({ cursor })
      : new URLSearchParams({
          tableFqn: "project.dataset.table",
          geoColumn: "geom",
          pageSize: "5000",
        });
    const res = await fetch(`/spatial-objects?${params}`).then(r => r.json());
    cursor = res.nextCursor ?? undefined;
    yield res.data.features;
  }
}
```

<!-- CONTEXT -->

Follow the existing layered architecture: domain → application → infrastructure → presentation. Use `neverthrow` for error handling, shared `Validator`/`UseCase` interfaces.

Key files:
- `src/features/getSpatialObjectsFromTable/application/ports.ts` — repository interface (support initial query and follow-up page requests)
- `src/features/getSpatialObjectsFromTable/infrastructure/repository.ts` — BigQuery query job creation + `job.getQueryResults(...)`
- `src/features/getSpatialObjectsFromTable/presentation/index.ts` — Fastify route handler
- `src/app.ts` — DI wiring and route registration
- `docs/openapi.yaml` — response/query parameter contract
- `src/preview.ts` — preview consumer must read `body.data`

Important:
- Initial request: `tableFqn` is required; `geoColumn` and `pageSize` are optional.
- Follow-up request: `cursor` is required and should be the only pagination/query input needed.
- Use base64url rather than plain base64 so the opaque cursor is safe in query strings.
- Alias the selected geometry column to a stable name (for example `AS geom`) so subsequent pages can always be mapped the same way.

TDD: write failing tests first, then implement to make them pass.
