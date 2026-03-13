import { GetTile } from "./GetTile.js";
import type { GetTileRepository } from "./ports.js";
import {
    GetTileValidator,
    type IGetTileValidator,
} from "./validation.js";

export type {
    GetTileCommand,
    GetTileError,
    GetTileInput,
    GetTileResult,
    ValidationErrors,
    ValidationFieldError,
} from "./types.js";
export type {
    GetTileRepository,
    GetTileRepositoryError,
    GetTileRequest,
} from "./ports.js";
export {
    GetTile,
    type IGetTile,
} from "./GetTile.js";
export {
    GetTileValidator,
} from "./validation.js";

export function createGetTile(
    repo: GetTileRepository,
    validator: IGetTileValidator = new GetTileValidator(),
) {
    return new GetTile(repo, validator);
}
