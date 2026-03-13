<!-- METADATA -->

```yaml
task: Failing endpoint integration test and stub route
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

TDD starting point: write a failing integration test and the minimal scaffolding to register the route (returning 501 Not Implemented).

**`src/__tests__/tile.test.ts`** — Integration tests using `app.inject()`:
- Test 200: `GET /tilesets/project.dataset.tileset/tiles/14/4602/9819` returns MVT binary with `Content-Type: application/vnd.mapbox-vector-tile`
- Test 400: missing/invalid params return 400 with validation errors
- Test 404: tile not found returns 404 with `{ error: "..." }`
- Test 500: repository error returns 500

These tests will initially FAIL because the route returns 501.

**Minimal scaffolding:**
- Create `src/features/getTileFromTileset/presentation/index.ts` with a stub `registerGetTileRoute` that registers `GET /tilesets/:tilesetFQN/tiles/:z/:x/:y` returning `reply.status(501).send({ error: "Not implemented" })`
- Wire the stub route in `src/app.ts`

The tests define the contract — subsequent tasks make them pass.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Integration test file exists with tests for 200, 400, 404, and 500 scenarios
- [x] Tests run but FAIL (red phase of TDD)
- [x] Stub route is registered and returns 501
- [x] Route is wired in `app.ts`
- [x] Existing tests still pass
