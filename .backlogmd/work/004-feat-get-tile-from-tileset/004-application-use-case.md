<!-- METADATA -->

```yaml
task: Application layer — GetTile use case
status: done
priority: 40
dep: ["work/004-feat-get-tile-from-tileset/003-application-ports-types-validation.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Create `src/features/getTileFromTileset/application/GetTile.ts` implementing the `UseCase` interface.

Flow:
1. Validate input using `GetTileValidator`
2. Call `repo.getTile({ tilesetFQN, z, x, y })`
3. If repo returns `null`, return `err({ kind: "TileNotFoundError" })`
4. Otherwise return `ok({ data: tile.data })`

Export `IGetTile` type alias and `GetTile` class.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `GetTile` class implements `UseCase<GetTileInput, GetTileResult, GetTileError>`
- [x] Returns validation errors when input is invalid
- [x] Returns `TileNotFoundError` when repository returns `null`
- [x] Returns `RepositoryError` when repository fails
- [x] Returns tile data on success
- [x] Unit tests for use case pass (mock repository)
