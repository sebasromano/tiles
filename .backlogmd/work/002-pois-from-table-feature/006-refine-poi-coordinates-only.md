<!-- METADATA -->

```yaml
task: Refine POI use case – coordinates only (query, domain, response)
status: done
priority: 40
dep: ["work/002-pois-from-table-feature/005-first-endpoint-get-poi.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Refine the get-POIs use case so that **only coordinates** are required: the API returns points with no extra row attributes. This implies (1) querying BigQuery for **only the geo column** (no `SELECT *`), (2) simplifying **domain entities** to a coordinates-only POI shape, and (3) shaping **responses** (domain + GeoJSON) to match.

**BigQuery:** Change the repository query from `SELECT *` to selecting only the geometry column (e.g. `SELECT \`geom\` FROM ...`). The column name remains configurable via `geoColumn`; only that column is fetched.

**Domain:** Simplify the POI type to hold only **coordinates** (longitude, latitude). Remove the `properties` map from the domain entity and from any repository/mapper output.

**Response:** Application result and presentation layer should expose only coordinates per POI (e.g. GeoJSON Feature with `geometry` and no or minimal `properties`), in line with the OpenAPI contract if it is updated to reflect coordinates-only.

<!-- CONTEXT -->

- Repository: `GetPointsFromTableRepository` / `BigQueryGetPointsRepository` — query should select only the single geo column; mapper maps row to coordinates only.
- Domain: `PointOfInterest` (and any DTOs) — reduce to coordinates-only; remove `properties`.
- Use case and presentation: continue to return GeoJSON FeatureCollection; each feature has a Point geometry and can have an empty or omitted properties object per spec.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] **BigQuery:** Repository query selects only the geo column (e.g. `` SELECT `{geoColumn}` FROM `{tableFqn}` LIMIT ? ``); no `SELECT *`
- [x] **Domain:** `PointOfInterest` (or equivalent) has only `coordinates` (longitude, latitude); no `properties` on the domain type
- [x] **Mapper:** Maps BigQuery row (single geo column) to domain coordinates-only POI; no properties aggregation
- [x] **Use case & response:** Application result and GET `/pois` response expose only coordinates per POI; GeoJSON features have geometry only (or empty properties) per OpenAPI
- [x] OpenAPI/spec and tests updated if response shape changes
