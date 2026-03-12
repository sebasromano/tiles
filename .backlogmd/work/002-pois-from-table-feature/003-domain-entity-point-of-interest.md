<!-- METADATA -->

```yaml
task: Domain types Point and Feature (GeoJSON-aligned)
status: done
priority: 30
dep:
    [
        "work/002-pois-from-table-feature/002-clean-architecture-vertical-slice-layout.md",
    ]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Implement the core POI domain types for the `getPointsFromTable` slice. Domain types should model the business concept, not the HTTP/GeoJSON transport contract.

- **Coordinates**: `longitude` and `latitude` as numbers.
- **PointOfInterest**: `coordinates` plus a `properties` map for the remaining table attributes.

GeoJSON `Point`, `Feature`, and `FeatureCollection` remain part of the HTTP/OpenAPI boundary and are shaped in presentation.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] **Coordinates** type in the slice's domain layer with `longitude` and `latitude` as required numbers
- [x] **PointOfInterest** type in the slice's domain layer with `coordinates` and `properties`
- [x] Domain stays independent of GeoJSON/OpenAPI DTO types
- [x] Coordinates are required and longitude/latitude remain explicit
