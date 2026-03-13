import type { SpatialObject } from "../domain/index.js";
import type { GetSpatialObjectsFromTableRepositoryError } from "./ports.js";

export interface ValidationFieldError {
    code: string;
    message: string;
}

export type ValidationErrors = Record<string, ValidationFieldError[]>;

export type GetSpatialObjectsError =
    | { kind: "ValidationError"; errors: ValidationErrors }
    | GetSpatialObjectsFromTableRepositoryError;

export interface GetSpatialObjectsInput {
    tableFqn?: string;
    geoColumn?: string;
}

export interface GetSpatialObjectsCommand {
    tableFqn: string;
    geoColumn: string;
}

export interface GetSpatialObjectsResult {
    spatialObjects: SpatialObject[];
}
