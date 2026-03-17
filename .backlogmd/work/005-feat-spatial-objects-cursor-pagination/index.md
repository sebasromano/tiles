<!-- METADATA -->

```yaml
work: Spatial objects viewport pagination (bounds only)
status: done
assignee: ""
```

<!-- DESCRIPTION -->

Support large result sets (e.g. 1M+ rows) for spatial objects without overloading the frontend. Each table has latitude/longitude (or a geometry column). When the user moves the map, the frontend sends the current viewport (bounding box); the API returns only features inside that region, up to `limit`. New bounds on pan/zoom = new request = new page. No cursor: one response per viewport.

**Approach:**
- **Bounds-only:** Bounding box — `minLng`, `minLat`, `maxLng`, `maxLat`. Frontend sends new bounds on pan/zoom; API returns up to `limit` features in that viewport. If the viewport has more than `limit` points, we return the first `limit` (user can zoom in to reduce density). Cursor deferred; can add later if "load more in same viewport" is needed.
- **Parametrized columns:** Like `tableFqn` and `geoColumn`, latitude and longitude column names are parametrized (`latColumn`, `lngColumn`) because different tables use different column names. Used for stable ordering. Optional with defaults (e.g. `"lat"`, `"lng"`).
- **Optional later:** Center + radius; cursor for "load more" in same viewport.
- **Safety:** Max `limit` per request (e.g. 500–1000), optional max bounding box area to avoid full-table scans.

<!-- CONTEXT -->

- Feature lives in `src/features/getSpatialObjectsFromTable/`. Existing use case: `GetSpatialObjects`; repo port `getPoints(request)` with `tableFqn`, `geoColumn`, `limit`. No spatial filter today.
- API: `GET /spatial-objects` (see `docs/openapi.yaml`). Add query params for bounds + limit + **latColumn** + **lngColumn**. No cursor; one response per viewport.
- BigQuery: filter by bounding box using **`ST_IntersectsBox`** (geography, lng1, lat1, lng2, lat2). Stable ORDER BY via `ST_Centroid` on geometry. When bounds provided, no LIMIT in repository; legacy path (no bounds) uses LIMIT. No keyset/cursor.
- Keep backward compatibility: if no bounds provided, existing behavior can remain (e.g. first page with default limit) or we can require bounds for this endpoint; decide in implementation (suggest: require bounds for spatial pagination, keep optional for legacy "whole table" with a low cap).
