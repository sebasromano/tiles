import type { Result } from "neverthrow";
import type { SpatialObject } from "../domain/index.js";
import type { GetSpatialObjectsCommand } from "./types.js";

export type GetSpatialObjectsRequest = GetSpatialObjectsCommand;

export interface GetSpatialObjectsRepositoryResult {
    spatialObjects: SpatialObject[];
    nextCursor: string | null;
}

export interface GetSpatialObjectsFromTableRepositoryError {
    kind: "RepositoryError";
    message: string;
}

export interface GetSpatialObjectsFromTableRepository {
    getPoints(
        request: GetSpatialObjectsRequest,
    ): Promise<
        Result<
            GetSpatialObjectsRepositoryResult,
            GetSpatialObjectsFromTableRepositoryError
        >
    >;
}
