import { GetSpatialObjects } from "./GetSpatialObjects.js";
import type { GetSpatialObjectsFromTableRepository } from "./ports.js";
import {
    GetSpatialObjectsValidator,
    type IGetSpatialObjectsValidator,
} from "./validation.js";

export type {
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
} from "./ports.js";
export {
    GetSpatialObjects,
    GET_SPATIAL_OBJECTS_LIMIT,
    type IGetSpatialObjects,
} from "./GetSpatialObjects.js";
export {
    GetSpatialObjectsValidator,
    validateTableFqn,
    validateGeoColumn,
} from "./validation.js";

export function createGetSpatialObjects(
    repo: GetSpatialObjectsFromTableRepository,
    validator: IGetSpatialObjectsValidator = new GetSpatialObjectsValidator(),
) {
    return new GetSpatialObjects(repo, validator);
}
