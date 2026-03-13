<!-- METADATA -->

```yaml
work: "Feature – Support all WKT/WKB geometry types via wkx"
status: done
assignee: ""
```

<!-- DESCRIPTION -->

Replace the hand-rolled POINT-only WKT regex parser with the **wkx** library to support all OGC geometry types (Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection) in both **WKT** and **WKB** formats.

This also renames the feature from "Points of Interest" to "Spatial Objects" throughout the codebase: domain types, feature folder, endpoint path (`/pois` → `/spatial-objects`), use case, and OpenAPI spec.

**Key decisions:**
- Domain type `PointOfInterest` → `SpatialObject` with a `geometry: Geometry` discriminated union
- Feature folder `getPointsFromTable` → `getSpatialObjectsFromTable`
- Endpoint `/pois` → `/spatial-objects`
- Presentation uses wkx's `.toGeoJSON()` for geometry serialization
- Infrastructure mapper uses `wkx.Geometry.parse()` for both WKT strings and WKB buffers

**References:**
- WKT format spec: https://es.wikipedia.org/wiki/Well_Known_Text
- wkx library: https://www.npmjs.com/package/wkx (v0.5.0, MIT, 2.3M weekly downloads)

<!-- CONTEXT -->

**Architecture:** Clean architecture with vertical slices. Each feature lives under `src/features/<featureName>/` with `domain/`, `application/`, `infrastructure/`, `presentation/` layers. Shared kernel at `src/shared/`. Composition root in `src/app.ts`.

**Existing code to modify:**
- `src/features/getPointsFromTable/` — entire feature folder (rename + update contents)
- `src/app.ts` — composition root (imports, route registration)
- `src/__tests__/poi.test.ts` — acceptance tests (rename + expand)
- `docs/openapi.yaml` — API contract

**Domain layer stays independent of wkx.** The domain defines its own `Geometry` union. Only the infrastructure mapper depends on wkx (parsing). Presentation may use wkx's `.toGeoJSON()` for convenience, or map from domain types — prefer `.toGeoJSON()` since it avoids duplicating the GeoJSON spec for 7 geometry types.

**neverthrow** is used for all fallible operations. No thrown exceptions.
