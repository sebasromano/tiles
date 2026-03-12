import { GetPois } from "./GetPois.js";
import type { GetPointsFromTableRepository } from "./ports.js";
import { GetPoisValidator, type IGetPoisValidator } from "./validation.js";

export type {
    GetPoisCommand,
    GetPoisError,
    GetPoisQuery,
    GetPoisResult,
    ValidationErrors,
    ValidationFieldError,
} from "./types.js";
export type {
    GetPointsFromTableRepository,
    GetPointsFromTableRepositoryError,
    GetPointsRequest,
} from "./ports.js";
export { GetPois, GET_POIS_LIMIT, type IGetPois } from "./GetPois.js";
export {
    GetPoisValidator,
    validateTableFqn,
    validateGeoColumn,
} from "./validation.js";

export function createGetPois(
    repo: GetPointsFromTableRepository,
    validator: IGetPoisValidator = new GetPoisValidator(),
) {
    return new GetPois(repo, validator);
}
