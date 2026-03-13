<!-- METADATA -->

```yaml
task: Application layer — ports, types, and validation
status: done
priority: 30
dep: ["work/004-feat-get-tile-from-tileset/002-domain-layer.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Create the application layer files under `src/features/getTileFromTileset/application/`:

**`types.ts`** — Define:
- `GetTileInput`: raw input from HTTP params (`tilesetFQN?: string`, `z?: string`, `x?: string`, `y?: string` — all strings since they come from path params)
- `GetTileCommand`: validated input (`tilesetFQN: string`, `z: number`, `x: number`, `y: number`)
- `GetTileResult`: `{ data: Buffer }`
- `GetTileError`: union of `ValidationError`, `TileNotFoundError`, and `RepositoryError`

**`ports.ts`** — Define:
- `GetTileRepository` interface with a `getTile(request)` method returning `Promise<Result<Tile | null, RepositoryError>>`
- Return `null` when no row matches (tile not found), so the use case can map it to `TileNotFoundError`

**`validation.ts`** — Define:
- `GetTileValidator` implementing `Validator<GetTileInput, GetTileCommand, GetTileError>`
- Validate `tilesetFQN` is present and matches safe FQN format (reuse regex pattern from existing feature)
- Validate `z`, `x`, `y` are present and parse to non-negative integers

**`index.ts`** — Re-export all public types, the validator, and the use case.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `GetTileInput`, `GetTileCommand`, `GetTileResult`, `GetTileError` types are defined
- [x] `TileNotFoundError` is a distinct error kind (`{ kind: "TileNotFoundError" }`)
- [x] `GetTileRepository` port interface is defined, returning `Tile | null`
- [x] `GetTileValidator` validates all four params with descriptive error messages
- [x] `z`, `x`, `y` validation rejects negative numbers, floats, and non-numeric strings
- [x] Unit tests for validation pass
