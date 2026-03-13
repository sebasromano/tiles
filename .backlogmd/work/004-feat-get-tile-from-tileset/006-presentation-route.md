<!-- METADATA -->

```yaml
task: Presentation layer — route and response handling
status: done
priority: 60
dep: ["work/004-feat-get-tile-from-tileset/004-application-use-case.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Create `src/features/getTileFromTileset/presentation/index.ts` with `registerGetTileRoute(app, getTile)`.

Route: `GET /tilesets/:tilesetFQN/tiles/:z/:x/:y`

Request handling:
- Extract path params `tilesetFQN`, `z`, `x`, `y` from `request.params`
- Pass them as `GetTileInput` to `getTile.execute()`

Response mapping:
- `ok` → 200 with `Content-Type: application/vnd.mapbox-vector-tile`, send raw Buffer
- `ValidationError` → 400 with JSON `{ errors: ... }`
- `TileNotFoundError` → 404 with JSON `{ error: "Tile not found" }`
- `RepositoryError` → 500 with JSON `{ error: message }`

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Route is registered at `GET /tilesets/:tilesetFQN/tiles/:z/:x/:y`
- [x] Successful response sends raw binary with correct content type
- [x] Validation errors return 400 with field-level errors
- [x] Tile not found returns 404
- [x] Repository errors return 500
