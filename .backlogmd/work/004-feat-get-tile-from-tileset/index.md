<!-- METADATA -->

```yaml
work: Get tile from tileset endpoint
status: done
assignee: ""
```

<!-- DESCRIPTION -->

New `GET /tilesets/:tilesetFQN/tiles/:z/:x/:y` endpoint that retrieves a single vector tile (MVT) from a BigQuery tileset table.

The tileset table has columns `z`, `x`, `y`, `carto_partition`, and `data`. The `data` column contains the tile in MVT format, gzipped and base64-encoded (`data = base64(gzip(<tile in MVT>))`).

The endpoint queries the row matching the given z/x/y coordinates, decodes base64, decompresses gzip, and returns the raw MVT binary with `Content-Type: application/vnd.mapbox-vector-tile`.

Example tileset row:
```json
{
  "z": "14",
  "x": "4602",
  "y": "9819",
  "carto_partition": "2427",
  "data": "H4sIAAAAAAAA/5Mq4GJPSU1LLM0pERLl2Lby78UFt32EmBgYJBiVWDk3aG4QAAp/W/N34jIk4Q86E4RBqtGENwCFpQQS09OLUtMTS1JT4kvySxJzlDglGcDgg71Gg0IFEwDzv1XXcgAAAA=="
}
```

<!-- CONTEXT -->

Follow the same layered architecture as `getSpatialObjectsFromTable`: domain → application → infrastructure → presentation. Use `neverthrow` for error handling, shared `Validator`/`UseCase` interfaces, and BigQuery for the repository.

Key files to reference for patterns:
- `src/app.ts` — DI wiring and route registration
- `src/shared/application.ts` — `Validator`, `UseCase` interfaces
- `src/features/getSpatialObjectsFromTable/` — full feature example

The OpenAPI spec has already been added at `docs/openapi.yaml` under `GET /tilesets/{tilesetFQN}/tiles/{z}/{x}/{y}`.

Route uses path params (not query), since z/x/y identify a specific tile resource. The endpoint returns raw binary (not JSON), so the presentation layer must use `reply.type('application/vnd.mapbox-vector-tile').send(buffer)`.

A `TileNotFoundError` (404) is a distinct error kind, separate from `RepositoryError` (500).
