<!-- METADATA -->

```yaml
task: Update Fastify route handler for pagination
status: done
priority: 60
dep: ["work/005-feat-cursor-based-pagination/005-update-use-case.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Update the Fastify route handler in `presentation/index.ts`, plus the public contract consumers affected by pagination:

- Accept `cursor` (optional string) and `pageSize` (optional string) query params alongside existing `tableFqn` and `geoColumn`
- `tableFqn` is required on the initial request
- Follow-up page requests should work with `cursor` alone
- Response shape: `{ data: GeoJsonFeatureCollection, nextCursor: string | null }`
- Update `docs/openapi.yaml` to describe the new request/response contract
- Update `src/preview.ts` (and any other in-repo consumers) to read `body.data` instead of assuming the endpoint returns a bare FeatureCollection

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Route accepts `cursor` and `pageSize` query params
- [x] `tableFqn` required for the initial request and not for cursor follow-up requests
- [x] Response shape is `{ data: FeatureCollection, nextCursor: string | null }`
- [x] OpenAPI spec matches the updated route contract
- [x] Preview/in-repo consumers work with the wrapped `{ data, nextCursor }` response
