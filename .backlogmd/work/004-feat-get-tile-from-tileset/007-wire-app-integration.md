<!-- METADATA -->

```yaml
task: Replace stub with real implementation and verify tests pass
status: done
priority: 70
dep: ["work/004-feat-get-tile-from-tileset/005-infrastructure-repository.md", "work/004-feat-get-tile-from-tileset/006-presentation-route.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Replace the stub route (501) with the real implementation and make all failing integration tests from task 001 pass (green phase of TDD).

**`src/app.ts`**:
- Update DI wiring: create the `GetTile` use case with the real validator and repository
- Accept optional `getTile` / `getTileRepository` in `buildApp` opts for test injection
- Replace the stub route registration with the real `registerGetTileRoute(app, getTile)`

**`src/features/getTileFromTileset/presentation/index.ts`**:
- Replace the 501 stub with the real route handler that delegates to the use case

**`src/__tests__/tile.test.ts`**:
- Update tests to inject a mock repository via `buildApp` opts
- Verify all 4 scenarios pass: 200, 400, 404, 500

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `buildApp` accepts optional `getTile` and `getTileRepository` for DI
- [x] Route is registered and reachable
- [x] All integration tests pass
- [x] Existing tests still pass (`npm test`)
