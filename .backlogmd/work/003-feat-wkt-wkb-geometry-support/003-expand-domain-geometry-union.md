<!-- METADATA -->

```yaml
task: "Expand domain – Geometry discriminated union and SpatialObject type"
status: done
priority: 30
dep: ["work/003-feat-wkt-wkb-geometry-support/002-rename-feature-folder-and-endpoint.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Replace the coordinates-only domain model with a full geometry type system. The domain must model all OGC Simple Feature geometry types without depending on wkx or GeoJSON.

**New domain types (in `domain/index.ts`):**

```typescript
type Position = [longitude: number, latitude: number];

type Point = { type: "Point"; coordinates: Position };
type LineString = { type: "LineString"; coordinates: Position[] };
type Polygon = { type: "Polygon"; coordinates: Position[][] };
type MultiPoint = { type: "MultiPoint"; coordinates: Position[] };
type MultiLineString = { type: "MultiLineString"; coordinates: Position[][] };
type MultiPolygon = { type: "MultiPolygon"; coordinates: Position[][][] };
type GeometryCollection = { type: "GeometryCollection"; geometries: Geometry[] };

type Geometry = Point | LineString | Polygon | MultiPoint | MultiLineString | MultiPolygon | GeometryCollection;

interface SpatialObject {
    geometry: Geometry;
}
```

Remove old `Coordinates` and `PointOfInterest` types. Update all imports across the feature (application ports, types, use case, mapper, presentation) to use the new types. The application port's return type becomes `SpatialObject[]` instead of `PointOfInterest[]`.

**Note:** The `Geometry` union mirrors GeoJSON geometry structure intentionally (same `type` discriminant and coordinate layout) but is a domain type — no dependency on any GeoJSON library.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `Geometry` discriminated union with all 7 types defined in domain layer
- [x] `Position` type alias for `[number, number]` (longitude, latitude)
- [x] `SpatialObject` interface with `geometry: Geometry` replaces `PointOfInterest`
- [x] Old `Coordinates` and `PointOfInterest` types removed
- [x] All imports across the feature updated (application, infrastructure, presentation)
- [x] Project builds with no type errors
