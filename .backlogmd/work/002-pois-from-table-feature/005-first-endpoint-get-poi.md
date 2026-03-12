<!-- METADATA -->

```yaml
task: First endpoint – GET points of interest (use case + handler + route)
status: done
priority: 50
dep: ["work/002-pois-from-table-feature/004-bigquery-client-and-config.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Implement the **first POI endpoint** per **`docs/openapi.yaml`**: GET **`/pois`** (operationId `getPois`). Query params: **`tableFqn`** (required), **`geoColumn`** (optional, default `"geom"`). Response 200: GeoJSON **FeatureCollection**; 400/500 per spec.

**Application (use case) flow:** The use case implements the shared **UseCase** contract with a single **`execute()`** entrypoint. **(1) Validate** — delegate to an injectable **Validator** (e.g. `GetPoisValidator`); validate query params (`tableFqn` required and valid format, `geoColumn` optional); invalid input yields a validation error. **(2) Apply policy and call the repository** — build the repository request with validated params and application policy such as the query limit; repository returns `Result<PointOfInterest[], GetPoisError>` (neverthrow). **(3) Return application data** — the use case returns POIs, not GeoJSON. Presentation maps the use-case result to HTTP: `Ok` → 200, validation error → 400 with body **`errors: { fieldName: [{ code, message }] }`** per OpenAPI `ValidationErrorResponse`, repo/infra error → 500.

**Data source context:** Repository (from task 004) returns domain POIs. The table is specified by **`tableFqn`**; geometry column by **`geoColumn`** (default `"geom"`); WKT e.g. `POINT(longitude latitude)` is parsed in infrastructure. Presentation shapes POIs into `{ type: "FeatureCollection", features }` for the HTTP response.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] **Validation:** Injectable Validator (e.g. `GetPoisValidator`) validates input (tableFqn required and valid, geoColumn optional); validation failure → 400 with body `errors: { fieldName: [{ code, message }] }` per OpenAPI
- [x] **Use case flow:** `execute()` validates input, applies application policy, and calls the repository; repository returns only domain POIs (Result), and the use case does not build GeoJSON
- [x] Use case returns **neverthrow** `Result<GetPoisResult, GetPoisError>` (or equivalent); no thrown exceptions
- [x] Presentation calls the use case and maps Result to status codes: Ok → 200 + GeoJSON body, validation error → 400 + ValidationErrorResponse body, repo/infra error → 500; response bodies match **`docs/openapi.yaml`**
- [x] Route GET **`/pois`** registered per OpenAPI; repository injected and used; no hardcoded credentials
- [x] Task 001 (TDD) acceptance test for GET /pois passes
