<!-- METADATA -->

```yaml
task: OpenAPI – add bounds, limit, latColumn, lngColumn params
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Extend the `GET /spatial-objects` contract so the frontend can request results for a viewport (bounding box). Add query parameters: `minLng`, `minLat`, `maxLng`, `maxLat` (when provided, all four required), **`limit`** (only applied when not using viewport; when using viewport, all features inside the bounds are returned and limit is not applied), and **`latColumn`** / **`lngColumn`** (optional; default e.g. `"lat"` / `"lng"`) for tables with different column names. One request per viewport; when the user pans/zooms, the client sends new bounds and gets a new response. No cursor or nextCursor.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] OpenAPI spec documents new query params: `minLng`, `minLat`, `maxLng`, `maxLat` (numbers), `limit` (integer, optional; only applied when not using viewport; when using viewport all features in bounds are returned), `latColumn` and `lngColumn` (strings, optional, defaults to "lat"/"lng").
- [x] Response schema for 200 remains GeoJSON FeatureCollection (no nextCursor).
- [x] Description explains viewport-based request: new bounds on pan/zoom = new request.
