<!-- METADATA -->

```yaml
task: Infrastructure layer — BigQuery repository
status: done
priority: 50
dep: ["work/004-feat-get-tile-from-tileset/003-application-ports-types-validation.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Create the infrastructure layer under `src/features/getTileFromTileset/infrastructure/`:

**`repository.ts`** — `BigQueryGetTileRepository` implementing `GetTileRepository`:
- Query: `SELECT data FROM \`{tilesetFQN}\` WHERE z = @z AND x = @x AND y = @y LIMIT 1`
- Use parameterized query for z, x, y values
- If no rows returned, return `ok(null)`
- If a row is returned, decode the `data` column: base64-decode → gzip-decompress → raw MVT Buffer
- Return `ok(tile)` with the decoded Tile entity
- Wrap BigQuery errors as `RepositoryError`

**`index.ts`** — Factory function `createBigQueryGetTileRepository()` that creates a BigQuery client and returns the repository instance.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] BigQuery query uses parameterized values for z, x, y (not string interpolation)
- [x] `tilesetFQN` is safely interpolated (validated upstream by the use case)
- [x] base64 decoding and gzip decompression are handled correctly
- [x] Returns `null` when no matching tile row exists
- [x] BigQuery errors are wrapped as `RepositoryError`
- [x] Factory function follows same pattern as `createBigQueryGetSpatialObjectsRepository`
