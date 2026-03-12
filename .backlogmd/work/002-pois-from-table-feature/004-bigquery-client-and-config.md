<!-- METADATA -->

```yaml
task: BigQuery client and configuration (dotenv, table FQN as parameter)
status: done
priority: 40
dep: ["work/002-pois-from-table-feature/003-domain-entity-point-of-interest.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Add **`neverthrow`**, **`@google-cloud/bigquery`**, and **dotenv** to dependencies. Load configuration from environment via dotenv (e.g. Google Cloud project). Create a **repository** (BigQuery-backed) that uses this config. Per **`docs/openapi.yaml`**, **table FQN** and **geometry column name** are **not** in config. The repository implements an **application port**, accepts a request object with `tableFqn`, `geoColumn`, and application policy such as `limit`, and returns only domain **POIs** (`PointOfInterest[]`) wrapped in **neverthrow** `Result`. Use neverthrow for all fallible operations (e.g. BigQuery query, WKT parsing) so callers receive `Result` instead of exceptions. Repository should be injectable so tests can mock it. No HTTP route yet; this task is infrastructure plus the application port boundary.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Dependencies **neverthrow**, `@google-cloud/bigquery`, and **dotenv** added; config (e.g. Google Cloud project) loaded via dotenv from env
- [x] Table FQN (**`tableFqn`**) and geometry column name (**`geoColumn`**, default `"geom"`) are **not** in config; they are passed in the application request to the repository
- [x] Repository interface lives in **application** and returns only domain POIs (e.g. `Result<PointOfInterest[], GetPoisError>` via neverthrow); no GeoJSON building in infrastructure
- [x] Repository implementation uses neverthrow for fallible operations (BigQuery query, WKT parsing); no thrown exceptions
- [x] Repository injectable (e.g. via Fastify decorator or constructor) so tests can substitute a mock
