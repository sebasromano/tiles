import type { GetTileRepositoryError } from "./ports.js";

export interface ValidationFieldError {
    code: string;
    message: string;
}

export type ValidationErrors = Record<string, ValidationFieldError[]>;

export type GetTileError =
    | { kind: "ValidationError"; errors: ValidationErrors }
    | { kind: "TileNotFoundError" }
    | GetTileRepositoryError;

export interface GetTileInput {
    tilesetFQN?: string;
    z?: string;
    x?: string;
    y?: string;
}

export interface GetTileCommand {
    tilesetFQN: string;
    z: number;
    x: number;
    y: number;
}

export interface GetTileResult {
    data: Buffer;
}
