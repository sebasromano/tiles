<!-- METADATA -->

```yaml
task: "Unit tests for wkx-based mapper – all geometry types, WKB, edge cases"
status: done
priority: 80
dep: ["work/003-feat-wkt-wkb-geometry-support/004-install-wkx-rewrite-mapper.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Comprehensive unit tests for the rewritten infrastructure mapper. Tests live colocated at `infrastructure/mapper.test.ts`.

**WKT parsing tests (one per geometry type):**
- `POINT(1 2)` → `{ type: "Point", coordinates: [1, 2] }`
- `LINESTRING(0 0, 1 1, 2 2)` → correct LineString
- `POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))` → correct Polygon
- `POLYGON((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))` → Polygon with hole
- `MULTIPOINT((10 40), (40 30))` → correct MultiPoint
- `MULTILINESTRING((10 10, 20 20), (40 40, 30 30))` → correct MultiLineString
- `MULTIPOLYGON(((30 20, 45 40, 10 40, 30 20)))` → correct MultiPolygon
- `GEOMETRYCOLLECTION(POINT(4 6), LINESTRING(4 6, 7 10))` → correct GeometryCollection

**WKB parsing tests:**
- Hex-encoded WKB for a Point → correct Point domain object
- Hex-encoded WKB for a Polygon → correct Polygon domain object

**EWKT parsing tests:**
- `SRID=4326;POINT(1 2)` → correct Point (SRID handled/ignored at domain level)

**Edge cases:**
- Empty geometries: `POINT EMPTY`, `MULTIPOLYGON EMPTY`
- Negative coordinates: `POINT(-73.9 40.8)`
- High-precision coordinates
- Malformed WKT → `RepositoryError`
- `null` / `undefined` geometry cell → `RepositoryError`
- BigQuery GEOGRAPHY object `{ value: "POINT(1 2)" }` → correct extraction

**`mapRowToSpatialObject` integration:**
- Row with string WKT → correct SpatialObject
- Row with `{ value: wkt }` → correct SpatialObject
- Row with missing geo column → RepositoryError

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Tests for all 7 WKT geometry types with correct domain mapping
- [x] Test for Polygon with hole (inner ring)
- [x] Tests for WKB input (at least Point and Polygon via hex buffer)
- [x] Test for EWKT with SRID prefix
- [x] Tests for empty geometries (POINT EMPTY etc.)
- [x] Tests for error cases (malformed WKT, missing column, null cell)
- [x] Tests for BigQuery GEOGRAPHY object extraction (`{ value: "..." }`)
- [x] All tests pass
