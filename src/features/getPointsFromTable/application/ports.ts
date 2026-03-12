import type { Result } from "neverthrow";
import type { PointOfInterest } from "../domain/index.js";

export interface GetPointsRequest {
    tableFqn: string;
    geoColumn: string;
    limit: number;
}

export interface GetPointsFromTableRepositoryError {
    kind: "RepositoryError";
    message: string;
}

export interface GetPointsFromTableRepository {
    getPoints(
        request: GetPointsRequest,
    ): Promise<Result<PointOfInterest[], GetPointsFromTableRepositoryError>>;
}
