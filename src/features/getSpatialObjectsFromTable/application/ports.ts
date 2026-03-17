import type { Result } from "neverthrow";
import type { SpatialObject } from "../domain/index.js";
import type { Bounds } from "./types.js";

export interface GetSpatialObjectsRequest {
    tableFqn: string;
    geoColumn: string;
    bounds?: Bounds;
    limit: number;
    latColumn: string;
    lngColumn: string;
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
            SpatialObject[],
            GetSpatialObjectsFromTableRepositoryError
        >
    >;
}
