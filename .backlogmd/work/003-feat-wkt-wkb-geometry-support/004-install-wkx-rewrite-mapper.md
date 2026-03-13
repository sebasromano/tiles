<!-- METADATA -->

```yaml
task: "Install wkx and rewrite infrastructure mapper for all geometry types + WKB"
status: done
priority: 40
dep: ["work/003-feat-wkt-wkb-geometry-support/003-expand-domain-geometry-union.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Replace the hand-rolled `parseWktPoint` regex with **wkx** (`npm install wkx`). The mapper becomes the single place where wkx is used for parsing.

**Changes to `infrastructure/mapper.ts`:**

1. Remove `parseWktPoint` function (regex-based, Point-only).
2. New function `parseGeometry(raw: string | Buffer): Result<Geometry, RepositoryError>`:
   - If input is a `string`: use `wkx.Geometry.parse(wkt)` (handles WKT and EWKT with SRID prefix).
   - If input is a `Buffer`: use `wkx.Geometry.parse(buffer)` (handles WKB and EWKB).
   - Map the wkx geometry object to the domain `Geometry` union.
   - Wrap in neverthrow `Result` — parse errors become `RepositoryError`.
3. Update `extractWkt` → `extractGeometryValue` to handle both string WKT and Buffer WKB cells from BigQuery.
4. Update `mapRowToSpatialObject` (renamed from `mapRowToPointOfInterest`) to use the new parser.

**wkx → domain mapping:**
- `wkx.Point` → `{ type: "Point", coordinates: [x, y] }`
- `wkx.LineString` → `{ type: "LineString", coordinates: points.map(p => [p.x, p.y]) }`
- `wkx.Polygon` → `{ type: "Polygon", coordinates: rings.map(ring => ring.map(p => [p.x, p.y])) }`
- Multi* and GeometryCollection follow the same recursive pattern.

**Repository** (`infrastructure/repository.ts`): rename `BigQueryGetPointsRepository` → `BigQueryGetSpatialObjectsRepository`, update to call renamed mapper.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `wkx` added to dependencies in `package.json`
- [x] Hand-rolled `parseWktPoint` removed
- [x] New `parseGeometry` handles WKT strings (including EWKT with SRID) via `wkx.Geometry.parse()`
- [x] New `parseGeometry` handles WKB/EWKB `Buffer` input via `wkx.Geometry.parse()`
- [x] All 7 geometry types mapped from wkx objects to domain `Geometry` union
- [x] `mapRowToSpatialObject` replaces `mapRowToPointOfInterest`
- [x] Repository renamed and updated; returns `SpatialObject[]`
- [x] All parsing errors wrapped in neverthrow `Result` (no thrown exceptions)
