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

export interface Bounds {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
}

export interface GetSpatialObjectsInput {
    tableFqn?: string;
    geoColumn?: string;
    minLng?: number | string;
    minLat?: number | string;
    maxLng?: number | string;
    maxLat?: number | string;
    limit?: number | string;
    latColumn?: string;
    lngColumn?: string;
}

export interface GetSpatialObjectsCommand {
    tableFqn: string;
    geoColumn: string;
    bounds?: Bounds;
    limit: number;
    latColumn: string;
    lngColumn: string;
}

export interface GetSpatialObjectsResult {
    spatialObjects: SpatialObject[];
}
