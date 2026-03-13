<!-- METADATA -->

```yaml
task: Define Tile domain entity
status: done
priority: 20
dep: ["work/004-feat-get-tile-from-tileset/001-failing-endpoint-test.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Create `src/features/getTileFromTileset/domain/index.ts` with the `Tile` entity representing a decoded vector tile.

The entity should contain:
- `z`: number (zoom level)
- `x`: number (column)
- `y`: number (row)
- `data`: Buffer (raw MVT binary, already decoded from base64 and decompressed from gzip)

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `Tile` interface is defined with `z`, `x`, `y` (numbers) and `data` (Buffer)
- [x] Domain types are exported from `domain/index.ts`
