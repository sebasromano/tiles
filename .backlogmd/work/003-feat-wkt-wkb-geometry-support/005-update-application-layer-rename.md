<!-- METADATA -->

```yaml
task: "Update application layer – rename types, use case, and ports"
status: done
priority: 50
dep: ["work/003-feat-wkt-wkb-geometry-support/004-install-wkx-rewrite-mapper.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Rename all application-layer types and classes to reflect the "Spatial Objects" naming:

**Types (`application/types.ts`):**
- `GetPoisQuery` → `GetSpatialObjectsQuery`
- `GetPoisCommand` → `GetSpatialObjectsCommand`
- `GetPoisResult` → `GetSpatialObjectsResult` (with `spatialObjects: SpatialObject[]` instead of `pois: PointOfInterest[]`)
- `GetPoisError` → `GetSpatialObjectsError`

**Ports (`application/ports.ts`):**
- `GetPointsFromTableRepository` → `GetSpatialObjectsFromTableRepository`
- `GetPointsFromTableRepositoryError` → `GetSpatialObjectsFromTableRepositoryError`
- `GetPointsRequest` → `GetSpatialObjectsRequest`

**Use case (`application/GetPois.ts` → `application/GetSpatialObjects.ts`):**
- `GetPois` → `GetSpatialObjects`
- `IGetPois` → `IGetSpatialObjects`
- `GET_POIS_LIMIT` → `GET_SPATIAL_OBJECTS_LIMIT`

**Validation (`application/validation.ts`):**
- `GetPoisValidator` → `GetSpatialObjectsValidator`
- `IGetPoisValidator` → `IGetSpatialObjectsValidator`

**Barrel export (`application/index.ts`):** Update all exports and factory function (`createGetPois` → `createGetSpatialObjects`).

Update `src/app.ts` composition root to use renamed imports.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] All application types, ports, use case, and validator renamed to `SpatialObjects` naming
- [x] Use case file renamed from `GetPois.ts` to `GetSpatialObjects.ts`
- [x] Barrel exports in `application/index.ts` updated
- [x] `src/app.ts` updated with new imports and factory names
- [x] Project builds with no type errors
- [x] Existing unit tests in `application/` updated to match new names and pass
