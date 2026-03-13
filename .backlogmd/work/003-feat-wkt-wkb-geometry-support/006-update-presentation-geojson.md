<!-- METADATA -->

```yaml
task: "Update presentation – support all GeoJSON geometry types via wkx.toGeoJSON()"
status: done
priority: 60
dep: ["work/003-feat-wkt-wkb-geometry-support/005-update-application-layer-rename.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Update the presentation layer to output GeoJSON FeatureCollection with any geometry type, not just Point.

**Approach:** Since the domain `Geometry` union intentionally mirrors GeoJSON geometry structure (same `type` discriminant and coordinate arrays), the mapping from domain to GeoJSON response is straightforward — the domain geometry object is already in GeoJSON-compatible shape.

**Changes to `presentation/index.ts`:**

1. Rename `registerGetPoisRoute` → `registerGetSpatialObjectsRoute`.
2. Change route path from `/pois` to `/spatial-objects`.
3. Update `toFeatureCollection` to map `SpatialObject[]` → GeoJSON FeatureCollection:
   - Each `SpatialObject.geometry` maps directly to a GeoJSON geometry (the domain types already use the same structure).
   - Each feature: `{ type: "Feature", geometry: spatialObject.geometry }`.
4. Remove the old Point-only hardcoded geometry mapping.
5. Update GeoJSON TypeScript interfaces to accept any geometry type (replace `GeoJsonPoint` with a generic `GeoJsonGeometry`).

**Note on wkx.toGeoJSON():** Since the domain `Geometry` already mirrors GeoJSON structure, we don't actually need wkx in presentation at all — just pass `spatialObject.geometry` through. This keeps presentation independent of wkx (only infrastructure depends on it).

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Route function renamed to `registerGetSpatialObjectsRoute`
- [x] Endpoint path is `/spatial-objects`
- [x] `toFeatureCollection` handles all 7 geometry types (not just Point)
- [x] GeoJSON response matches the standard FeatureCollection spec for any geometry type
- [x] Presentation layer does NOT depend on wkx (domain geometry is already GeoJSON-shaped)
- [x] Error mapping updated to use renamed error types
