import type { Result } from "neverthrow";
import type { SpatialObject } from "../domain/index.js";

export interface GetSpatialObjectsRequest {
    tableFqn: string;
    geoColumn: string;
    limit: number;
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
