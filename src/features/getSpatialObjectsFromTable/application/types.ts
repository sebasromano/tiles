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
    cursor?: string;
    pageSize?: string;
}

export interface CursorPayload {
    jobId: string;
    pageToken: string;
    location: string;
    projectId: string;
    pageSize: number;
}

export type GetSpatialObjectsCommand =
    | {
          kind: "initial";
          tableFqn: string;
          geoColumn: string;
          pageSize: number;
      }
    | {
          kind: "cursor";
          cursor: CursorPayload;
      };

export interface GetSpatialObjectsResult {
    spatialObjects: SpatialObject[];
    nextCursor: string | null;
}
