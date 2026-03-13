<!-- METADATA -->

```yaml
task: "Update OpenAPI spec – generic geometry schemas and /spatial-objects path"
status: done
priority: 70
dep: ["work/003-feat-wkt-wkb-geometry-support/006-update-presentation-geojson.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Update `docs/openapi.yaml` to reflect the renamed endpoint and multi-geometry support.

**Path changes:**
- Remove `/pois` path.
- Add `/spatial-objects` path with `operationId: getSpatialObjects`.
- Same query parameters: `tableFqn` (required), `geoColumn` (optional, default `"geom"`).

**Schema changes:**
- Replace `GeoJSONFeatureCollectionPoint`, `GeoJSONFeaturePoint`, `GeoJSONPoint` with generic schemas.
- Add `GeoJSONGeometry` as a `oneOf` union of all geometry types: Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection.
- Add individual schemas: `GeoJSONPoint`, `GeoJSONLineString`, `GeoJSONPolygon`, `GeoJSONMultiPoint`, `GeoJSONMultiLineString`, `GeoJSONMultiPolygon`, `GeoJSONGeometryCollection`.
- `GeoJSONFeature` references `GeoJSONGeometry` (not just Point).
- `GeoJSONFeatureCollection` references `GeoJSONFeature`.
- Update response examples to show mixed geometry types.

**Keep:** `ValidationErrorResponse` and `ValidationFieldError` schemas unchanged.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `/pois` path removed; `/spatial-objects` path added with `operationId: getSpatialObjects`
- [x] `GeoJSONGeometry` schema defined as `oneOf` of all 7 geometry types
- [x] Individual geometry type schemas defined (Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection)
- [x] `GeoJSONFeature` references generic `GeoJSONGeometry`
- [x] Response examples include mixed geometry types
- [x] Validation schemas unchanged
