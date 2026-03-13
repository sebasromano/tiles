import type { BigQuery } from "@google-cloud/bigquery";
import { errAsync, okAsync, ResultAsync, type Result } from "neverthrow";
import type {
    GetSpatialObjectsFromTableRepository,
    GetSpatialObjectsFromTableRepositoryError,
    GetSpatialObjectsRequest,
} from "../application/ports.js";
import type { SpatialObject } from "../domain/index.js";
import { mapRowToSpatialObject, type BigQueryRow } from "./mapper.js";

export class BigQueryGetSpatialObjectsRepository
    implements GetSpatialObjectsFromTableRepository
{
    constructor(private readonly bigquery: BigQuery) {}

    async getPoints(
        request: GetSpatialObjectsRequest,
    ): Promise<
        Result<SpatialObject[], GetSpatialObjectsFromTableRepositoryError>
    > {
        const query = `SELECT \`${request.geoColumn}\` FROM \`${request.tableFqn}\` LIMIT ?`;
        const resultAsync = ResultAsync.fromPromise(
            this.bigquery.query({
                query,
                params: [request.limit],
            }),
            (e: unknown): GetSpatialObjectsFromTableRepositoryError => ({
                kind: "RepositoryError",
                message: e instanceof Error ? e.message : String(e),
            }),
        );

        return resultAsync.andThen(([rows]) => {
            const objects: SpatialObject[] = [];
            for (const row of rows as BigQueryRow[]) {
                const result = mapRowToSpatialObject(row, request.geoColumn);
                if (result.isErr()) return errAsync(result.error);
                objects.push(result.value);
            }
            return okAsync(objects);
        });
    }
}
