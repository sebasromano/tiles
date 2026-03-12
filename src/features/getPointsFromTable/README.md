# Get Points From Table (vertical slice)

First vertical slice for the **getPois** operation (GET `/pois` per `docs/openapi.yaml`). Clean architecture with **one folder per layer**; layer content in files inside each folder (e.g. `index.ts`).

## Layout

| Folder            | Layer          | Responsibility                                                                                                                                                                                                                                           |
| ----------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain/`         | Domain         | Core POI concepts (`Coordinates`, `PointOfInterest`). No repository ports and no GeoJSON transport DTOs. Entry: `index.ts`.                                                                                                                              |
| `application/`    | Application    | **ports.ts** owns repository boundaries. **validation.ts** validates input. **GetPois.ts** exposes a single `execute()` use case and applies application policy (for example the repository limit). **index.ts** exports the use case factory and types. |
| `infrastructure/` | Infrastructure | **repository.ts**: `BigQueryGetPointsRepository` class implements the application port. **mapper.ts** parses WKT and maps rows to domain POIs. **index.ts** wires BigQuery config and exports the adapter.                                               |
| `presentation/`   | Presentation   | HTTP handler and route registration. Calls the use case and maps application results to the OpenAPI response shape (GeoJSON + HTTP status codes). Entry: `index.ts`.                                                                                     |

## Boundaries

- **Repository port** lives in **application**, not domain.
- **Repository** returns domain **POIs** only. The **presentation layer** is responsible for shaping those into the OpenAPI GeoJSON response.
- Shared kernel (API types, errors, Result) lives in `src/shared/`.
- **Composition root** is `src/app.ts`: it wires repository + validator + use case and passes only the input port into presentation.
- New slices: add a folder under `src/features/<sliceName>/` with the same layout (camelCase for folder and files).

## Conventions

- **Use a single application entrypoint.** Prefer `execute()` on use cases instead of exposing separate `validate()` and `run()` methods.
- **No inline type imports.** Use top-level `import type { X } from "..."` and reference the type by name (e.g. `Result<A, E>`) instead of `import("neverthrow").Result`.
