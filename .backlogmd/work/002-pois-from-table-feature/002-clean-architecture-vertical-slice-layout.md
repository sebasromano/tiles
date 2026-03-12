<!-- METADATA -->

```yaml
task: Project layout – clean architecture and vertical slice for points-of-interest
status: done
priority: 20
dep: ["work/002-pois-from-table-feature/001-tdd-failing-test-get-poi.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Define and create the folder structure for **clean architecture** with **vertical slices by feature**. The first slice implements the **getPois** operation from **`docs/openapi.yaml`** (folder: **camelCase** `getPointsFromTable`). Use a **simplified MVP layout:** one folder per feature; **camelCase** for folder and file names. Layers: **domain/**, **application/**, **infrastructure/**, **presentation/**. **Application** owns validation, ports, use cases, and application errors. **Domain** owns only core POI concepts. **Presentation** maps application results to the HTTP/OpenAPI response shape. Shared kernel at `src/shared/` includes shared **Validator** and **UseCase** interfaces. Unit tests live **in the same directory** as the code under test (e.g. `application/validation.test.ts` next to `validation.ts`). Document the layout in a short README so future slices follow the same pattern.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] First vertical slice folder created (e.g. `src/features/getPointsFromTable/`) with `domain/`, `application/`, `infrastructure/`, `presentation/` (each with content in files, e.g. `index.ts`)
- [x] Placeholder or minimal content in each file so the structure is clear and the project still builds
- [x] Brief documentation of the layout and boundaries (`README.md`) so agents and humans know where to put new code (including: repository port in application; single `execute()` use case; response shaping in presentation; Validator/UseCase in shared; unit tests colocated)
