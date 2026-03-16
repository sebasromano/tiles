import { GetSpatialObjects } from "./GetSpatialObjects.js";
import type { GetSpatialObjectsFromTableRepository } from "./ports.js";
import {
    GetSpatialObjectsValidator,
    type IGetSpatialObjectsValidator,
} from "./validation.js";

export type {
    CursorPayload,
    GetSpatialObjectsCommand,
    GetSpatialObjectsError,
    GetSpatialObjectsInput,
    GetSpatialObjectsResult,
    ValidationErrors,
    ValidationFieldError,
} from "./types.js";
export type {
    GetSpatialObjectsFromTableRepository,
    GetSpatialObjectsFromTableRepositoryError,
    GetSpatialObjectsRequest,
    GetSpatialObjectsRepositoryResult,
} from "./ports.js";
export {
    GetSpatialObjects,
    type IGetSpatialObjects,
} from "./GetSpatialObjects.js";
export {
    GetSpatialObjectsValidator,
    validateTableFqn,
    validateGeoColumn,
    validatePageSize,
    decodeCursor,
    encodeCursor,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
} from "./validation.js";

export function createGetSpatialObjects(
    repo: GetSpatialObjectsFromTableRepository,
    validator: IGetSpatialObjectsValidator = new GetSpatialObjectsValidator(),
) {
    return new GetSpatialObjects(repo, validator);
}
