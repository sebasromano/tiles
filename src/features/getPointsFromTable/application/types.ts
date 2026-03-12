import type { PointOfInterest } from "../domain/index.js";
import type { GetPointsFromTableRepositoryError } from "./ports.js";

export interface ValidationFieldError {
    code: string;
    message: string;
}

export type ValidationErrors = Record<string, ValidationFieldError[]>;

/** Use-case error: validation (400) or repository/infra (500). */
export type GetPoisError =
    | { kind: "ValidationError"; errors: ValidationErrors }
    | GetPointsFromTableRepositoryError;

export interface GetPoisQuery {
    tableFqn?: string;
    geoColumn?: string;
}

export interface GetPoisCommand {
    tableFqn: string;
    geoColumn: string;
}

export interface GetPoisResult {
    pois: PointOfInterest[];
}
